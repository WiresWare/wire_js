///
/// Created by Vladimir Cores (Minkin) on 31/10/22.
/// Github: https://github.com/vladimircores
/// License: APACHE LICENSE, VERSION 2.0
///

import { ERROR__WIRE_ALREADY_REGISTERED } from './const';
import { WireData, WireSendResults } from './data.js';

export class WireCommunicateLayer {
  constructor() {
    this._wireById = new Map();
    this._wireIdsBySignal = new Map();
  }

  add(wire) {
    const wireId = wire.id;
    const signal = wire.signal;

    if (this._wireById.has(wireId)) {
      throw new Error(ERROR__WIRE_ALREADY_REGISTERED + wireId.toString());
    }

    this._wireById.set(wireId, wire);

    if (!this._wireIdsBySignal.has(signal)) {
      this._wireIdsBySignal.set(signal, []);
    }

    this._wireIdsBySignal.get(signal).push(wireId);

    return wire;
  }

  hasSignal(signal) {
    return this._wireIdsBySignal.has(signal);
  }

  hasWire(wire) {
    return this._wireById.has(wire.id);
  }

  async send(signal, payload, scope) {
    let noMoreSubscribers = true;
    const results = [];
    if (this.hasSignal(signal)) {
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        const wiresToRemove = [];
        for await (const wireId of this._wireIdsBySignal.get(signal)) {
          const wire = this._wireById.get(wireId);
          if (scope != null && wire.scope !== scope) continue;
          noMoreSubscribers = wire.replies > 0 && --wire.replies === 0;
          if (noMoreSubscribers) wiresToRemove.push(wire);
          await wire.transfer(payload);
        }
        if (wiresToRemove.length > 0)
          for await (const wire of wiresToRemove) {
            noMoreSubscribers = await this._removeWire(wire);
          }
      }
    }
    return new WireSendResults(results, noMoreSubscribers);
  }

  async remove(signal, scope, listener) {
    const exists = this.hasSignal(signal);
    if (exists) {
      const withScope = scope != null;
      const withListener = listener != null;
      const toRemoveList = [];
      const hasWires = this._wireIdsBySignal.has(signal);
      if (hasWires) {
        for await (const wireId of this._wireIdsBySignal.get(signal)) {
          if (this._wireById.has(wireId)) {
            const wire = this._wireById.get(wireId);
            const isWrongScope = withScope && scope !== wire.scope;
            const isWrongListener = withListener && listener !== wire.listener;
            if (isWrongScope || isWrongListener) continue;
            toRemoveList.push(wire);
          }
        }
      }
      if (toRemoveList.length > 0)
        for await (const wire of toRemoveList) {
          await this._removeWire(wire);
        }
    }
    return exists;
  }

  async clear() {
    const wireToRemove = [];
    this._wireById.forEach((wire) => wireToRemove.push(wire));
    if (wireToRemove.length > 0)
      for await (const wire of wireToRemove) {
        await this._removeWire(wire);
      }
    this._wireById.clear();
    this._wireIdsBySignal.clear();
  }

  getBySignal(signal) {
    if (this.hasSignal(signal) && this._wireIdsBySignal.get(signal))
      return (
        this._wireIdsBySignal.get(signal).map((wireId) => {
          return this._wireById.get(wireId);
        }) || []
      );
    return [];
  }

  getByScope(scope) {
    const result = [];
    this._wireById.forEach((wire) => {
      if (wire.scope === scope) result.push(wire);
    });
    return result;
  }

  getByListener(listener) {
    const result = [];
    this._wireById.forEach((wire) => {
      if (wire.listener === listener) result.push(wire);
    });
    return result;
  }

  getByWID(wireId) {
    return this._wireById.get(wireId);
  }

  ///
  /// Exclude a Wire based on a signal.
  ///
  /// @param    The Wire to remove.
  /// @return If there is no ids (no Wires) for that SIGNAL stop future perform
  ///
  async _removeWire(wire) {
    const wireId = wire.id;
    const signal = wire.signal;

    // Remove Wire by wid
    this._wireById.delete(wireId);

    // Remove wid for Wire signal
    const wireIdsForSignal = this._wireIdsBySignal.get(signal) || [];
    wireIdsForSignal.splice(wireIdsForSignal.indexOf(wireId), 1);

    const noMoreSignals = wireIdsForSignal.length === 0;
    if (noMoreSignals) this._wireIdsBySignal.delete(signal);

    await wire.clear();

    return noMoreSignals;
  }
}

export class WireMiddlewaresLayer {
  constructor() {
    this._MIDDLEWARE_LIST = [];
  }

  has(middleware) {
    return this._MIDDLEWARE_LIST.indexOf(middleware) > -1;
  }
  add(middleware) {
    this._MIDDLEWARE_LIST.push(middleware);
  }
  clear() {
    this._MIDDLEWARE_LIST.splice(0, this._MIDDLEWARE_LIST.length);
  }
  onData(key, prevValue, nextValue) {
    return this._process((m) => m.onData(key, prevValue, nextValue));
  }
  onReset(key, prevValue) {
    return this._process((m) => m.onData(key, prevValue, null));
  }
  onRemove(signal, scope, listener) {
    return this._process((m) => m.onRemove(signal, scope, listener));
  }
  onSend(signal, payload) {
    return this._process((m) => m.onSend(signal, payload));
  }
  onAdd(wire) {
    return this._process((m) => m.onAdd(wire));
  }

  async _process(p) {
    if (this._MIDDLEWARE_LIST.length > 0) {
      for await (const mw of this._MIDDLEWARE_LIST) {
        await p(mw);
      }
    }
  }
}

export class WireDataContainerLayer {
  constructor() {
    this._dataMap = new Map();
  }

  has(key) {
    const result = this._dataMap.has(key);
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: has ${key} = ${result}`);
    return result;
  }
  get(key) {
    return this._dataMap.get(key);
  }
  create(key, onReset) {
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: create ${key}`);
    const wireData = new WireData(key, (key) => this.remove(key), onReset);
    this._dataMap.set(key, wireData);
    return wireData;
  }
  remove(key) {
    console.log(`> Wire -> _DATA_CONTAINER_LAYER: remove ${key}`);
    return this._dataMap.delete(key);
  }

  async clear() {
    const wireDataToRemove = [];
    this._dataMap.forEach((wireData) => {
      wireDataToRemove.push(wireData);
    });
    if (wireDataToRemove.length > 0)
      for await (const wireData of wireDataToRemove) {
        await wireData.remove(true);
      }
    this._dataMap.clear();
  }
}
