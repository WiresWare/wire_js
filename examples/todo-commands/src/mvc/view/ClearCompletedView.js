import DomElement from '@/mvc/view/base/DomElement';
import { Wire } from 'cores.wire';
import ViewSignals from '@/consts/ViewSignals';
import DataKeys from '@/consts/DataKeys';

class ClearCompletedView extends DomElement {
  constructor(dom) {
    super(dom);
    const listWD = Wire.data(DataKeys.LIST_OF_IDS);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);

    const updateComponentVisibility = () => this.setComponentVisibilityFrom(listWD.value, countWD.value);

    listWD.subscribe(updateComponentVisibility);
    countWD.subscribe(updateComponentVisibility);
    updateComponentVisibility();

    this.dom.onclick = () => Wire.send(ViewSignals.CLEAR_COMPLETED);
  }

  async setComponentVisibilityFrom(list, count) {
    console.log(`> ClearCompletedView -> setComponentVisibilityFrom: ${list.length} - ${count}`);
    this.dom.style.display = count >= list.length ? 'none' : 'block';
  }
}

export default ClearCompletedView;
