import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VirtualList, {ItemStyle} from '../src';
import './demo.css';

const stickyIndices = [0, 5, 8, 15, 30, 50, 100, 200];

class StickyHeaders extends React.Component {
  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    const itemStyle = stickyIndices.includes(index)
      ? {
          ...style,
          backgroundColor: '#EEE',
        }
      : style;

    return (
      <div className="Row" style={itemStyle} key={index}>
        Row #{index}
      </div>
    );
  };

  render() {
    return (
      <div className="Root">
        <VirtualList
          width="auto"
          height={400}
          itemCount={1000}
          renderItem={this.renderItem}
          itemSize={50}
          className="VirtualList"
          stickyIndices={stickyIndices}
        />
      </div>
    );
  }
}

ReactDOM.render(<StickyHeaders />, document.querySelector('#app'));
