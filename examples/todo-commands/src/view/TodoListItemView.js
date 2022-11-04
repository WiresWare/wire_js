import DomElement from '@/view/base/DomElement';
import { Wire } from '@wire/core/src';
import ViewSignals from '@/consts/ViewSignals';

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
    // this.inpEdit.onKeyDown.listen((e) {
    //   if (e.keyCode == KeyCode.ENTER) {
    //     Wire.send(ViewSignals.EDIT, payload: getEditData());
    //   } else if (e.keyCode == KeyCode.ESC) _OnEditCancel();
    // }),
    // this.lblContent.onDoubleClick.listen((_) => _OnEditBegin()),
    //   this.inpEdit.onBlur.listen((_) => _OnEditCancel())

    const todoWD = Wire.data(id);
    todoWD.subscribe(this._OnDataChanged);
    console.log(`> TodoListItemView(${id}) -> isSet = ${todoWD.isSet}`);
    if (todoWD.isSet) {
      this._OnDataChanged(todoWD.value).then(() => {});
    }
  }
  async _OnDataChanged(todoVO) {
    console.log(`> TodoListItemView -> _OnTodoDataChanged = ${todoVO?.id ?? 'empty'}`);
    if (todoVO == null) {
      this.remove();
    } else {
      this.update(todoVO);
    }
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
    const todoWireData = Wire.data(this.dom.id);
    todoWireData.unsubscribe(this._OnDataChanged);
    // listeners.removeWhere((element) { element.cancel(); return true; });
    this.inpToggle.onclick = null;
    this.btnDelete.onclick = null;
    this.container.remove();
    this.inpEdit.remove();
    this.dom.remove();
  }
  _OnEditBegin() {
    this.dom.style.classList.add('editing');
    this.inpEdit.focus();
  }
  _OnEditCancel() {
    this.inpEdit.text = this.lblContent.text;
    this.dom.style.classList.remove('editing');
  }
}

export default TodoListItemView;
