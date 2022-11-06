import { Wire } from 'cores.wire';

import DomElement from '@/mvc/view/base/DomElement';
import ViewSignals from '@/consts/ViewSignals';
import InputDTO from '@/mvc/model/dto/InputDTO';

class TodoInputView extends DomElement {
  constructor(dom) {
    super(dom);
    Wire.add(this, ViewSignals.CLEAR_INPUT, async () => {
      dom.value = '';
    }).then(() => {
      this.dom.value = '';
      this.dom.onkeyup = async (e) => {
        const isEnterPressed = e.key === 'Enter';
        console.log('> TodoInputView -> onkeyup:', { isEnterPressed });
        if (isEnterPressed) {
          await Wire.send(ViewSignals.INPUT, new InputDTO(this.dom.value, ''));
        }
      };
      console.log('> TodoInputView -> init');
    });
  }
}

export default TodoInputView;
