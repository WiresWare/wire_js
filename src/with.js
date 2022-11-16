import Wire from './wire';

export class WireWithWhenReady {
  get whenReady() {
    return this._whenReady;
  }
  constructor(whenReady) {
    this._whenReady = whenReady;
  }
}

export class WireWithDatabase {
  constructor(wireDatabaseService) {
    this.databaseService = wireDatabaseService;
  }
  exist(key) {
    return this.databaseService.exist(key);
  }
  async retrieve(key) {
    return this.databaseService.retrieve(key);
  }
  // Stringify value before sends to database
  persist(key, value) {
    this.databaseService.save(key, JSON.stringify(value));
  }
  delete(key) {
    if (this.exist(key)) this.databaseService.delete(key);
  }
}

export class WireWithWireData {
  getData(dataKey) {
    return Wire.data(dataKey);
  }
  has(dataKey) {
    return Wire.data(dataKey).isSet;
  }
  hasNot(dataKey) {
    return !this.has(dataKey);
  }
  async get(dataKey) {
    return new Promise((resolve, rejects) => {
      if (this.has(dataKey)) {
        resolve(this.getData(dataKey).value);
      } else {
        rejects(`Error: missing data on key - ${dataKey}`);
      }
    });
  }
  async getMany(many) {
    const result = new Map();
    for await (const item of many) {
      result.set(item, await this.get(item));
    }
    return result;
  }
  async update(dataKey, data, refresh = true) {
    if (data != null) Wire.data(dataKey, data);
    else if (refresh) await this.getData(dataKey).refresh();
  }
  async reset(dataKey) {
    if (this.has(dataKey)) await this.getData(dataKey).reset();
  }
  async remove(dataKey) {
    if (this.has(dataKey)) await this.getData(dataKey).remove();
  }
}
