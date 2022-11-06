import { Wire, WireWithDatabase } from 'cores.wire';
import WebDatabaseService from '@/service/WebDatabaseService';
import DataKeys from '@/consts/DataKeys';
import TodoVO from '@/mvc/model/vos/TodoVO';
import FilterValues from '@/consts/FilterValues';

class TodoStorageMiddleware extends WireWithDatabase {
  constructor() {
    super(Wire.find(WebDatabaseService));
    this.whenReady = new Promise((resolve) => {
      this.databaseService
        .init()
        .then(async () => {
          let todoIdsList = [];
          if (this.exist(DataKeys.LIST_OF_IDS)) {
            const todoIdsListRaw = await this.retrieve(DataKeys.LIST_OF_IDS);
            for await (const todoId of JSON.parse(todoIdsListRaw)) {
              const rawString = await this.retrieve(todoId);
              const todo = TodoVO.fromJSON(JSON.parse(rawString));
              Wire.data(todoId, todo);
              todoIdsList.push(todoId);
            }
          }
          Wire.data(DataKeys.LIST_OF_IDS, todoIdsList);
        })
        .then(async () => {
          if (this.exist(DataKeys.NOT_COMPLETED_COUNT)) {
            const value = parseInt(await this.retrieve(DataKeys.NOT_COMPLETED_COUNT));
            Wire.data(DataKeys.NOT_COMPLETED_COUNT, value);
          } else Wire.data(DataKeys.NOT_COMPLETED_COUNT, 0);
        })
        .then(async () => {
          if (this.exist(DataKeys.FILTER)) {
            const value = parseInt(await this.retrieve(DataKeys.FILTER));
            Wire.data(DataKeys.FILTER, value);
          } else Wire.data(DataKeys.FILTER, FilterValues.ALL);
        })
        .then(async () => {
          if (this.exist(DataKeys.COMPLETE_ALL)) {
            const value = (await this.retrieve(DataKeys.COMPLETE_ALL)) === 'true';
            Wire.data(DataKeys.COMPLETE_ALL, value);
          } else Wire.data(DataKeys.COMPLETE_ALL, false);
        })
        .finally(() => resolve(this));
    });
  }
  onAdd() {
    return Promise.resolve(undefined);
  }

  onData(key, prevValue, nextValue) {
    console.log(`> TodoStorageMiddleware -> onData:`, { key, prevValue, nextValue });
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

export default TodoStorageMiddleware;
