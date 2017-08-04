import React, {PureComponent} from 'react';
import { findDOMNode, render } from 'react-dom';
import './demo.css';
import VirtualList from '../../src';
import { generateCalendar, genLeftPartCalendar } from '../../tests/dateGenerator';

const HEIGHT = 400;
const ITEM_HEIGHT = 50;
const ITEM_COUNT = 500;
const itemsAdded = 50;
let childrenList = generateCalendar({count: ITEM_COUNT});
let windowCenter = HEIGHT / 2;
let scrollOffset = windowCenter;

const addItems = () => {
  const curDate = childrenList[0].strDate;
  childrenList = [ ...genLeftPartCalendar(curDate, itemsAdded), ...childrenList];
  scrollOffset = itemsAdded * ITEM_HEIGHT;
  console.log('scrollOffset ', scrollOffset);
};

class Demo extends PureComponent {
  render() {
    return (
      <div className='Root'>
        <input type='button' name='addItemsBeforeFirst' value='addItemsBeforeFirst' onClick={addItems}/>
        <VirtualList
          height={HEIGHT}
          overscanCount={0}
          scrollOffset={scrollOffset}
          itemSize={ITEM_HEIGHT}
          itemCount={childrenList.length}
          renderItem={({index, style}) => (
            <div className="Row" key={childrenList[index].id} style={style}>
              Item #{childrenList[index].strDate}
            </div>
          )}
          className='VirtualList'
        />
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
