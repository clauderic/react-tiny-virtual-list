import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VirtualList from '../../src/';
import './demo.css';

class Demo extends React.Component {
  renderItem = ({style, index}: {style: React.CSSProperties, index: number}) => {
    return (
      <div className="Row" style={style} key={index}>
        Row #{index}
      </div>
    );
  }

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
        />
      </div>
    );
  }
}

ReactDOM.render(<Demo />, document.querySelector('#app'));
