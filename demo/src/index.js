import React from 'react';
import {render} from 'react-dom';

import VirtualList from '../../src';

const data = Array.apply(null, Array(1000)).map((_, i) => i);
const possibleHeights = [50, 100, 200, 300, 50];
const rowHeights = data.map(() => possibleHeights[Math.floor(Math.random()*possibleHeights.length)]);

let Demo = React.createClass({
  render() {
    return (
      <VirtualList
        data={data}
        height={600}
        width={400}
        renderRow={(row, index) =>
          <div style={{height: rowHeights[index]}} key={index}>{row}</div>
        }
        rowHeight={rowHeights}
        scrollToIndex={50}
        scrollToAlignment='center'
      />
    );
  },
});

render(<Demo />, document.querySelector('#demo'));
