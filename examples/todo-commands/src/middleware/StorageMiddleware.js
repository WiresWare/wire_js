import WebDatabaseService from '@/service/WebDatabaseService';
import { Wire, WireWithDatabase } from '@wire/core/src';

class StorageMiddleware extends WireWithDatabase {
  constructor() {
    super(Wire.find(WebDatabaseService));
  }
  onAdd() {
    return Promise.resolve(undefined);
  }

  onData(key, prevValue, nextValue) {
    console.log(`> StorageMiddleware -> onData:`, { key, prevValue, nextValue });
    this.persist(key, nextValue);
    return Promise.resolve();
  }

  onRemove() {
    return Promise.resolve(undefined);
  }

  onSend() {
    return Promise.resolve(undefined);
  }
}

export default StorageMiddleware;
