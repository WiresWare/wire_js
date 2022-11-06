import { Wire } from 'cores.wire';

import TodoInputView from '@/mvc/view/TodoInputView';
import TodoListView from '@/mvc/view/TodoListView';
import TodoController from '@/mvc/controller/TodoController';
import TodoCountView from '@/mvc/view/TodoCountView';
import CompleteAllView from '@/mvc/view/CompleteAllView';
import ClearCompletedView from '@/mvc/view/ClearCompletedView';
import RouteController from '@/mvc/controller/RouteController';
import TodoFilterView from '@/mvc/view/TodoFilterView';
import WebDatabaseService from '@/service/WebDatabaseService';
import TodoStorageMiddleware from '@/middleware/TodoStorageMiddleware';
import DataKeys from '@/consts/DataKeys';

async function main() {
  Wire.put(new WebDatabaseService());
  Wire.middleware(await new TodoStorageMiddleware().whenReady);

  new TodoController();
  new RouteController();

  new TodoInputView(document.querySelector('.new-todo'));
  new TodoListView(document.querySelector('.todo-list'));
  new TodoCountView(document.querySelector('.todo-count')?.firstChild);
  new CompleteAllView(document.querySelector('.toggle-all'));
  new TodoFilterView(document.querySelector('.filters'));
  new ClearCompletedView(document.querySelector('.clear-completed'));

  console.log('> init: ', Wire.data(DataKeys.LIST_OF_IDS).value);

  document.querySelector('#loading')?.remove();
}

main();
