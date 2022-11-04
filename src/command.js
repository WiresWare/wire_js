import { WireWithWireData } from './with';

export class WireCommand {
  async execute() {
    return Promise.resolve();
  }
}

export class WireCommandWithRequiredData extends WireWithWireData {
  constructor(requiredDataKeys) {
    super();
    this._whenRequiredDataReady = new Promise((resolve) => {
      this.getMany(requiredDataKeys).then(resolve);
    });
  }
  get whenReady() {
    return this._whenRequiredDataReady;
  }
  async execute() {
    return null;
  }
}
