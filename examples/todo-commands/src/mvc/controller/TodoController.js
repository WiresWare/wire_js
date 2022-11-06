import { Wire } from 'cores.wire';

import ViewSignals from '@/consts/ViewSignals';
import TodoInputCommand from '@/mvc/controller/commands/todo/TodoInputCommand';
import TodoToggleCommand from '@/mvc/controller/commands/todo/TodoToggleCommand';
import TodoEditCommand from '@/mvc/controller/commands/todo/TodoEditCommand';
import TodoDeleteCommand from '@/mvc/controller/commands/todo/TodoDeleteCommand';
import DataKeys from '@/consts/DataKeys';
import CountCompletedGetter from '@/mvc/controller/getters/CountCompletedGetter';
import CompleteAllTodosCommand from '@/mvc/controller/commands/operations/CompleteAllTodosCommand';
import ClearCompletedTodosCommand from '@/mvc/controller/commands/operations/ClearCompletedTodosCommand';
import ApplyFilterToTodosCommand from '@/mvc/controller/commands/operations/ApplyFilterToTodosCommand';

class TodoController {
  constructor() {
    Wire.addMany(this, {
      [ViewSignals.INPUT]: (inputDTO) => new TodoInputCommand(inputDTO).execute(),
      [ViewSignals.TOGGLE]: (id) => new TodoToggleCommand(id).execute(),
      [ViewSignals.EDIT]: (editDTO) => new TodoEditCommand(editDTO).execute(),
      [ViewSignals.DELETE]: (id) => new TodoDeleteCommand(id).execute(),
      [ViewSignals.COMPLETE_ALL]: (isComplete) => new CompleteAllTodosCommand(isComplete).execute(),
      [ViewSignals.CLEAR_COMPLETED]: () => new ClearCompletedTodosCommand().execute(),
      [ViewSignals.FILTER]: (filter) => new ApplyFilterToTodosCommand(filter).execute(),
    }).then(() => {
      console.log('> TodoController -> READY!');
    });
    console.log('> TodoController -> Prepare getters');
    Wire.data(DataKeys.GET_COUNT_COMPLETED, null, new CountCompletedGetter().getter);
  }
}

export default TodoController;
