import React from 'react';
import {render} from 'react-dom';
import './demo.css';
import VirtualList from '../../src';

// const possibleHeights = [50, 100, 200, 50, 50];
// const rowHeights = data.map(() => possibleHeights[Math.floor(Math.random()*possibleHeights.length)]);

let Demo = React.createClass({
  render() {
    return (
      <div className='Root'>
        <header>
          <img src={require('./logo@2x.png')} width='40' height='28' />
          Tiny Virtual List
        </header>
        <VirtualList
          width='auto'
          height={400}
          rowCount={300000}
          renderRow={({style, index}) =>
            <div className='Row' style={style} key={index}>
              Row #{index}
            </div>
          }
          rowHeight={50}
          className='VirtualList'
        />
      </div>
    );
  },
});

render(<Demo />, document.querySelector('#demo'));
