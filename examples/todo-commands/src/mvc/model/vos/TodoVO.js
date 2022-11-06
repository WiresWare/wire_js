class TodoVO {
  static fromJSON(raw) {
    const result = new TodoVO(raw.id, raw.text, raw.note, new Date(raw.date), raw.completed);
    result.visible = raw.visible;
    console.log(`> TodoVO -> fromJSON:`, result);
    return result;
  }
  constructor(id, text, note, date = new Date(), completed = false) {
    this.id = id;
    this.text = text;
    this.note = note;
    this.date = date;
    this.completed = completed;
    this.visible = true;
  }
}

export default TodoVO;
