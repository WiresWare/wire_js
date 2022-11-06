import { Wire } from 'cores.wire';
import DataKeys from '@/consts/DataKeys';
import DomElement from '@/mvc/view/base/DomElement';

class TodoCountView extends DomElement {
  constructor(dom) {
    super(dom);
    const countWD = Wire.data(DataKeys.NOT_COMPLETED_COUNT);
    const completedCountGetterWD = Wire.data(DataKeys.GET_COUNT_COMPLETED);
    console.log('> TodoCountView -> subscribe to DataKeys.GET_COUNT_COMPLETED');
    countWD.subscribe((value) => this.updateCount(value, completedCountGetterWD.value));
    console.log('> TodoCountView -> get value for: DataKeys.GET_COUNT_COMPLETED');
    this.updateCount(countWD.value || 0, completedCountGetterWD.value || 0);
  }
  updateCount(count, completedCount) {
    console.log('> TodoCountView -> updateCount', { count, completedCount });
    this.dom.innerText = `${count.toString()} | ${completedCount.toString()}`;
  }
}

export default TodoCountView;
