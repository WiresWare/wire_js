import { Wire } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';
import DomElement from '@/mvc/view/base/DomElement';

const SELECTED_CLASS = 'selected';

class TodoFilterView extends DomElement {
  constructor(dom) {
    super(dom);
    const filterWD = Wire.data(DataKeys.FILTER);
    filterWD.subscribe(this.processFilter);
    this.processFilter(filterWD.value);
  }

  async processFilter(filter) {
    if (filter == null) return;
    console.log(`> TodoFilterView -> DataKeys.FILTER subscribe: ${filter}`);
    this.dom.querySelector(`.${SELECTED_CLASS}`).className = '';
    this.dom.children[filter].children[0].className = SELECTED_CLASS;
  }
}

export default TodoFilterView;
