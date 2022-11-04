import TodoInputView from '@/view/TodoInputView';
import TodoListView from '@/view/TodoListView';
import TodoVO from '@/model/vos/TodoVO';
import { Wire } from '@wire/core/src';
import DataKeys from '@/consts/DataKeys';
import ViewSignals from '@/consts/ViewSignals';

const todoVO = new TodoVO(`${Date.now()}`, 'Title', new Date().toDateString());

Wire.data(todoVO.id, todoVO);
Wire.data(DataKeys.LIST_OF_IDS, [todoVO.id]);
Wire.add(this, ViewSignals.TOGGLE, (payload, wid) => {
  console.log('> ViewSignals.TOGGLE', payload, wid);
});

new TodoInputView(document.querySelector('.new-todo'));
new TodoListView(document.querySelector('.todo-list'));

document.querySelector('#loading')?.remove();
