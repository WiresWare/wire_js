class InputDTO {
  constructor(text, note, completed = false) {
    this.text = text;
    this.note = note;
    this.completed = completed;
  }
}

export default InputDTO;
