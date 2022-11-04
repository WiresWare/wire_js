class TodoVO {
  constructor(id, text, note, date = new Date()) {
    this.id = id;
    this.text = text;
    this.note = note;
    this.date = date;
    this.completed = false;
    this.visible = true;
  }
}

export default TodoVO;
