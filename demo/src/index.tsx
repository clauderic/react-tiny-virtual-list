import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VirtualList, {ItemStyle} from '../../src';
import './demo.css';

const range = N => Array.from({length: N}, (_, k) => k + 1);

class Demo extends React.Component {
  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    return (
      <div className="Row" style={style} key={index}>
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
        />
      </div>
    );
  }
}

class MixedHeight extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: range(1000).map(() => {
        return Math.max(Math.ceil(Math.random() * 1000), 50);
      }),
    };
  }

  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    return (
      <div className="Row" style={style} key={index}>
        Row #{index}. Height: #{this.state.items[index]}
      </div>
    );
  };

  render() {
    return (
      <div className="Root">
        <VirtualList
          preCalculateTotalHeight
          width="auto"
          height={400}
          itemCount={1000}
          renderItem={this.renderItem}
          itemSize={this.state.items}
          className="VirtualList"
        />
      </div>
    );
  }
}

class Demos extends React.Component {
  render() {
    return (
      <div className="Root">
        <Demo />
        <MixedHeight />
      </div>
    );
  }
}

ReactDOM.render(<Demos />, document.querySelector('#app'));
