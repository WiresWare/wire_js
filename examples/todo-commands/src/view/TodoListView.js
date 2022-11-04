import { Wire } from '@wire/core/src';
import DataKeys from '@/consts/DataKeys';
import DomElement from '@/view/base/DomElement';
import TodoListItemView from '@/view/TodoListItemView';

class TodoListView extends DomElement {
  constructor(dom) {
    super(dom);
    const wireDataTodoList = Wire.data(DataKeys.LIST_OF_IDS);
    const todoList = wireDataTodoList.value || [];
    if (todoList.length > 0) todoList.forEach((id) => this.append(id));
  }

  append(id) {
    const viewItem = new TodoListItemView(id);
    console.log(`> TodoListView -> append id = ${id}`, viewItem.dom, this.dom);
    this.dom.insertBefore(viewItem.dom, this.dom.firstChild);
  }
}

export default TodoListView;
