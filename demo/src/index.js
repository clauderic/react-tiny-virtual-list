import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import './demo.css';
import VirtualList from '../../src';

class Demo extends PureComponent {
  render() {
    return (
      <div className='Root'>
        <VirtualList
          width='auto'
          height={400}
          itemCount={1000}
          renderItem={({style, index}) =>
            <div className='Row' style={style} key={index}>
              Row #{index}
            </div>
          }
          itemSize={50}
          className='VirtualList'
        />
      </div>
    );
  }
}

render(<Demo />, document.querySelector('#demo'));
