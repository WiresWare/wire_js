import { Wire, WireCommand } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';
import CheckAllCompletedCommand from '@/mvc/controller/commands/operations/CheckAllCompletedCommand';

class TodoToggleCommand extends WireCommand {
  constructor(todoId) {
    super();
    this.todoId = todoId;
  }

  async execute() {
    const todoVO = Wire.data(this.todoId).value;
    console.log(
      `> TodoToggleCommand -> execute: id = ${todoVO.id} - completed = ${todoVO.completed} - text = ${todoVO.text}`,
    );
    if (todoVO) {
      const wasCompleted = todoVO.completed;
      const currentCount = Wire.data(DataKeys.NOT_COMPLETED_COUNT).value || 0;
      console.log('\t currentCount =', currentCount);
      todoVO.completed = !todoVO.completed;
      const completedCount = currentCount + (todoVO.completed ? -1 : 1);
      console.log('\t completedCount =', completedCount);
      Wire.data(this.todoId, todoVO);
      Wire.data(DataKeys.NOT_COMPLETED_COUNT, completedCount);

      if (wasCompleted) await new CheckAllCompletedCommand().execute();
    }
  }
}

export default TodoToggleCommand;
