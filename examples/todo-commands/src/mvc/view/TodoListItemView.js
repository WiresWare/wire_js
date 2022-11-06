import { Wire } from 'cores.wire';

import DomElement from '@/mvc/view/base/DomElement';
import ViewSignals from '@/consts/ViewSignals';
import EditDTO from '@/mvc/model/dto/EditDTO';

const createWithClass = (tag, className) => {
  const result = document.createElement(tag);
  result.className = className;
  return result;
};

class TodoListItemView extends DomElement {
  constructor(id) {
    super(document.createElement('li'));
    this.dom.id = id;

    this.lblContent = createWithClass('label', 'todo-content');
    this.btnDelete = createWithClass('btn', 'destroy');
    this.inpEdit = createWithClass('input', 'edit');
    this.inpToggle = createWithClass('input', 'toggle');
    this.inpToggle.type = 'checkbox';
    this.container = createWithClass('div', 'view');

    this.container.append(this.inpToggle);
    this.container.append(this.lblContent);
    this.container.append(this.btnDelete);

    this.dom.append(this.inpEdit);
    this.dom.append(this.container);

    this.inpToggle.onclick = () => Wire.send(ViewSignals.TOGGLE, id);
    this.btnDelete.onclick = () => Wire.send(ViewSignals.DELETE, id);
    this.inpEdit.onkeydown = (e) => {
      console.log('> TodoListItemView -> inpEdit.onkeydown', e);
      if (e.key === 'Enter') {
        Wire.send(ViewSignals.EDIT, this.getEditData()).then(() => this._OnEditCancel());
      } else if (e.key === 'Escape') this._OnEditCancel();
    };
    this.lblContent.ondblclick = () => this._OnEditBegin();
    this.inpEdit.onblur = () => this._OnEditCancel();

    const todoWD = Wire.data(id);
    todoWD.subscribe((todoVO) => this._OnDataChanged(todoVO));
    console.log(`> TodoListItemView(${id}) -> isSet = ${todoWD.isSet}`);
    if (todoWD.isSet) {
      this._OnDataChanged(todoWD.value).then(() => {});
    }
  }
  async _OnDataChanged(todoVO) {
    console.log(`> TodoListItemView -> _OnTodoDataChanged: id = ${todoVO?.id}`);
    if (todoVO == null) {
      this.remove();
    } else {
      this.update(todoVO);
    }
  }

  getEditData() {
    return new EditDTO(this.dom.id, this.inpEdit.value.trim(), '');
  }

  update(todoVO) {
    console.log(`> TodoListItemView(${this.dom.id}) -> update`, todoVO);
    this.dom.id = todoVO.id;
    this.dom.style.display = todoVO.visible ? 'block' : 'none';
    if (todoVO.visible) {
      const text = todoVO.text;
      this.dom.className = todoVO.completed ? 'completed' : '';
      this.inpToggle.checked = todoVO.completed;
      this.lblContent.innerText = text;
      this.inpEdit.value = text;
      this.inpEdit.selectionStart = text.length;
    }
  }
  remove() {
    console.log(`> TodoListItemView(${this.dom.id}) -> remove`);
    this.inpToggle.onclick = null;
    this.btnDelete.onclick = null;
    this.inpEdit.onkeydown = null;
    this.lblContent.ondblclick = null;
    this.inpEdit.onblur = null;
    this.dom.remove();
  }
  _OnEditBegin() {
    this.dom.classList.add('editing');
    this.inpEdit.focus();
  }
  _OnEditCancel() {
    this.inpEdit.value = this.lblContent.innerText;
    this.dom.classList.remove('editing');
  }
}

export default TodoListItemView;
