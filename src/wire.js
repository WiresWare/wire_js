import { WireCommunicateLayer, WireDataContainerLayer, WireMiddlewaresLayer } from './layers';
import {
  ERROR__LISTENER_IS_NULL,
  ERROR__MIDDLEWARE_EXISTS,
  ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER,
  ERROR__CANT_PUT_ALREADY_EXISTING_INSTANCE,
  ERROR__CANT_FIND_INSTANCE_NULL,
} from './const';
import { WireDataLockToken } from './data';

export default class Wire {
  /// Wire object is a communication unit of the system, each instance associated with a signal
  ///
  /// Wire object can be passed as a reference to any component of the system
  /// But it won't react on signal until it is attached to the communication layer with [attach]
  /// However you still can send data through it by calling [transfer]
  ///
  constructor(scope = {}, signal = '', listener, replies = 0) {
    this._scope = scope;
    this._signal = signal;
    this._listener = listener;
    this.replies = replies;
    this._id = ++Wire._INDEX;
  }
  ///
  /// [read-only] [static]
  /// Used to generate Wire wid
  ///
  /// @private
  static _INDEX = 0;
  static _COMMUNICATION_LAYER = new WireCommunicateLayer();
  static _DATA_CONTAINER_LAYER = new WireDataContainerLayer();
  static _MIDDLEWARE_LAYER = new WireMiddlewaresLayer();
  ///**************************************************
  ///  Protected / Private Properties
  ///**************************************************
  ///
  /// [read-only]
  /// The SIGNAL associated with this Wire.
  ///
  /// @private
  get signal() {
    return this._signal;
  }
  ///
  /// [read-only]
  /// The closure method, reaction to the Wire instance changes.
  ///
  /// @private
  get listener() {
    return this._listener;
  }
  ///
  /// [read-only] [internal use]
  /// Unique identification for wire instance.
  ///
  /// @private
  get id() {
    return this._id;
  }
  ///
  /// [read-only] [internal use]
  /// Scope to which wire belongs to
  ///
  /// @private
  get scope() {
    return this._scope;
  }
  ///
  /// The number of times that wire instance will respond on signal before being removed.
  /// Default is 0 that means infinity times.
  ///
  get replies() {
    return this._replies;
  }
  set replies(value) {
    this._withReplies = value > 0;
    this._replies = value;
  }
  get withReplies() {
    return this._withReplies;
  }
  /// Call associated WireListener with data.
  async transfer(payload) {
    if (!this._listener) throw new Error(ERROR__LISTENER_IS_NULL);
    // Call a listener in this Wire only in case data type match its listener type.
    // TODO: Find a way of how to filter listeners on payload data type
    // const filterByPayloadType: boolean = payload instanceof PayloadType || payload == null;
    // if (filterByPayloadType)
    return this._listener(payload, this._id);
  }
  clear() {
    this._scope = undefined;
    this._listener = undefined;
  }
  ///**********************************************************************************************************
  ///
  ///  Public Static Methods - API
  ///
  ///**********************************************************************************************************
  /// Add wire object to the communication layer
  /// This method won't call middleware
  static attach(wire) {
    this._COMMUNICATION_LAYER.add(wire);
  }
  /// Remove wire object from communication layer, then inform all middlewares with
  /// Returns existence of another wires with that signal.
  static async detach(wire) {
    return this.remove(wire.signal, wire.scope, wire.listener);
  }
  /// Create wire object from params and [attach] it to the communication layer
  /// All middleware will be informed from [WireMiddleware.onAdd] before wire is attached to the layer
  static async add(scope, signal, listener, replies) {
    const wire = new Wire(scope, signal, listener, replies);
    await this._MIDDLEWARE_LAYER.onAdd(wire);
    this.attach(wire);
    return wire;
  }
  /// Register many signals at once
  static async addMany(scope, signalToHandlerMap) {
    for await (const [key, value] of Object.entries(signalToHandlerMap)) {
      await Wire.add(scope, key, value);
    }
  }
  /// Check if signal string or wire instance exists in communication layer
  static has(signal, wire) {
    if (signal) return this._COMMUNICATION_LAYER.hasSignal(signal);
    if (wire) return this._COMMUNICATION_LAYER.hasWire(wire);
    return false;
  }
  /// Send signal through all wires has the signal string value
  /// Payload is optional, default is null, passed to WireListener from [transfer]
  /// If you use scope then only wire with this scope value will receive the payload
  /// All middleware will be informed from [WireMiddleware.onSend] before signal sent on wires
  ///
  /// Returns WireSendResults which contains data from all listeners that react on the signal
  static async send(signal, payload, scope) {
    await this._MIDDLEWARE_LAYER.onSend(signal, payload);
    return this._COMMUNICATION_LAYER.send(signal, payload, scope);
  }
  /// Remove all entities from Communication Layer and Data Container Layer
  /// @param [withMiddleware] used to remove all middleware
  static async purge(withMiddleware = false) {
    await this._COMMUNICATION_LAYER.clear();
    await this._DATA_CONTAINER_LAYER.clear();
    if (withMiddleware) this._MIDDLEWARE_LAYER.clear();
  }
  /// Remove all wires for specific signal, for more precise target to remove add scope and/or listener
  /// All middleware will be informed from [WireMiddleware.onRemove] after signal removed, only if existed
  /// Returns [bool] telling signal existed in communication layer
  static async remove(signal, scope, listener) {
    const existed = await this._COMMUNICATION_LAYER.remove(signal, scope, listener);
    if (existed) await this._MIDDLEWARE_LAYER.onRemove(signal, scope, listener);
    return existed;
  }
  static async _removeAllBySignal(signal = '', scope = {}, listener) {
    const existed = await this._COMMUNICATION_LAYER.remove(signal, scope, listener);
    if (existed) await this._MIDDLEWARE_LAYER.onRemove(signal, scope, listener);
    return existed;
  }
  static async _removeAllByScope(scope) {
    const results = [];
    for await (const wire of this._COMMUNICATION_LAYER.getByScope(scope)) {
      results.push(await this._removeAllBySignal(wire.signal, scope));
    }
    return results;
  }
  /// Class extending [WireMiddleware] can listen to all processes in side Wire
  static middleware(value) {
    if (!this._MIDDLEWARE_LAYER.has(value)) {
      this._MIDDLEWARE_LAYER.add(value);
    } else {
      throw new Error(`${ERROR__MIDDLEWARE_EXISTS} ${value.toString()}`);
    }
  }
  /// When you need Wires associated with signal or scope or listener
  /// Returns [List<Wire>]
  static get(signal, scope, listener, wireId) {
    let result = [];
    if (signal) {
      const instances = this._COMMUNICATION_LAYER.getBySignal(signal);
      instances && (result = [...result, ...instances]);
    }
    if (scope) {
      const instances = this._COMMUNICATION_LAYER.getByScope(scope);
      instances && (result = [...result, ...instances]);
    }
    if (listener) {
      const instances = this._COMMUNICATION_LAYER.getByListener(listener);
      instances && (result = [...result, ...instances]);
    }
    if (wireId) {
      const instance = this._COMMUNICATION_LAYER.getByWID(wireId);
      instance && result.push(instance);
    }
    return result;
  }
  /// Access to the data container, retrieve WireData object when value is null and set when is not
  /// [WireData] is a data container to changes of which anyone can subscribe/unsubscribe.
  /// It's associated with string key.
  /// [WireData] can't be null and Wire.data(key) will always return WireData instance.
  /// Initial value will be null and special property of [WireData] isSet equal to false until any value is set
  /// If value is null then delete method of [WireData] will be called, object will be removed from system
  /// To protect [WireData] from being set from unappropriated places the [WireDataLockToken] token introduced.
  /// When only specific object want to have rights to write/change value of [WireData] it can create [WireDataLockToken] object
  /// and pass it to [Wire.data] method as option parameter `token` to validate the assign action.
  /// [WireData] API:
  /// ```
  /// WireData subscribe(WireDataListener listener)
  /// WireData unsubscribe([WireDataListener listener])
  /// void setValue(T input, { DataModificationToken token })
  /// void refresh()
  /// void remove()
  /// ```
  /// Returns [WireData]
  static data(key, value, getter) {
    console.log(`> Wire.data -> key = ${key}`);
    const wireData = this._DATA_CONTAINER_LAYER.has(key)
      ? this._DATA_CONTAINER_LAYER.get(key)
      : this._DATA_CONTAINER_LAYER.create(key, this._MIDDLEWARE_LAYER.onReset);
    if (getter) {
      wireData.getter = getter;
      wireData.lock(new WireDataLockToken());
    }
    if (value !== undefined && value !== null) {
      if (wireData.isGetter) throw new Error(ERROR__VALUE_IS_NOT_ALLOWED_TOGETHER_WITH_GETTER);
      const prevValue = wireData.isSet ? wireData.value : null;
      const isValueFunction = typeof value === 'function';
      console.log(`> Wire.data -> prev = ${prevValue}`);
      const nextValue = isValueFunction ? value(prevValue) : value;
      wireData.value = nextValue;
      this._MIDDLEWARE_LAYER.onData(key, prevValue, nextValue).then(() => {});
    }
    return wireData;
  }
  /// Store an instance of the object by its type, and lock it, so it can't be overwritten
  static put(instance, lock) {
    const key = instance.constructor.name.toString();
    console.log(`> Wire.put: ${key} (typeof key: ${typeof key})`);
    const wireData = Wire.data(key);
    if (wireData?.isLocked) throw new Error(ERROR__CANT_PUT_ALREADY_EXISTING_INSTANCE);
    console.log(`> Wire.put: set value = ${instance}`);
    wireData.value = instance;
    wireData.lock(lock ?? new WireDataLockToken());
    return instance;
  }
  /// Return an instance of an object by its type, throw an error in case it is not set
  static find(instanceType) {
    const key = instanceType.name?.toString();
    console.log(`> Wire.find: ${key} (typeof key: ${typeof key})`);
    const wireData = Wire.data(key);
    const isSet = wireData?.isSet;
    console.log(`> \t is set = ${isSet}`);
    if (!isSet) throw new Error(ERROR__CANT_FIND_INSTANCE_NULL);
    return wireData.value;
  }
}
