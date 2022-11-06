import DomElement from '@/mvc/view/base/DomElement';
import { Wire } from 'cores.wire';
import ViewSignals from '@/consts/ViewSignals';
import DataKeys from '@/consts/DataKeys';

class CompleteAllView extends DomElement {
  constructor(dom) {
    super(dom);
    Wire.add(this, ViewSignals.COMPLETE_ALL_FORCED, this._onWireSignalForced).then();
    this.dom.checked = Wire.data(DataKeys.COMPLETE_ALL).value;
    this.dom.onchange = () => {
      const isChecked = this.dom.checked;
      console.log(`> CompleteAllView -> onchange: ${isChecked}`);
      Wire.send(ViewSignals.COMPLETE_ALL, isChecked).then();
    };
  }

  async _onWireSignalForced(data) {
    console.log(`> CompleteAllView -> onWireSignalForced: checked = ${data}`);
    this.dom.checked = !!data;
  }
}

export default CompleteAllView;
