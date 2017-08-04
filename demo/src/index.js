import React from 'react';
import { render } from 'react-dom';
import './demo.css';
import VirtualList from '../../src';
import { generateArr } from '../../tests/arrGenerator';

const HEIGHT = 400;
const ITEM_HEIGHT = 50;
const ITEM_COUNT = 200;
const itemsAdded = 50;
const windowCenter = ITEM_COUNT * ITEM_HEIGHT / 2 - HEIGHT / 2;
const scrollOffset = windowCenter + ITEM_HEIGHT / 2;
// let scrollToIndex;

class Demo extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      childrenList: generateArr(ITEM_COUNT),
      scrollOffset,
      // scrollToIndex: null,
    };
    this.addItems=this.addItems.bind(this);
  }

  addItems () {
    // const scrollToIndex = itemsAdded;
    this.setState((prevState) => ({
      scrollOffset: itemsAdded * ITEM_HEIGHT,
      // scrollToIndex,
      childrenList: [ ...generateArr(itemsAdded), ...prevState.childrenList],
    }));
  }
  render() {
    return (
      <div className='Root'>
        <input type='button' name='addItemsBeforeFirst' value='addItemsBeforeFirst' onClick={this.addItems}/>
        <VirtualList
          height={HEIGHT}
          overscanCount={0}
          scrollOffset={this.state.scrollOffset}
          // scrollToIndex={this.state.scrollToIndex}
          itemSize={ITEM_HEIGHT}
          itemCount={this.state.childrenList.length}
          renderItem={({index, style}) => (
            <div className="Row" key={this.state.childrenList[index]} style={style}>
              Item #{this.state.childrenList[index]}
            </div>
          )}
          className='VirtualList'
        />
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
