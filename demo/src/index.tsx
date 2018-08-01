import * as React from 'react';
import * as ReactDOM from 'react-dom';

import VirtualList, {ItemStyle} from '../../src';
import './demo.css';

const range = N => Array.from({length: N}, (_, k) => k + 1);

class FixedItemSize extends React.Component {
  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    return (
      <div
        className="Row"
        style={{...style, backgroundColor: index % 2 ? '#eee' : 'white'}}
        key={index}
      >
        Row #{index + 1}
      </div>
    );
  };

  render() {
    return (
      <VirtualList
        width="auto"
        height={400}
        itemCount={10000}
        renderItem={this.renderItem}
        itemSize={50}
        className="VirtualList"
      />
    );
  }
}

class ArrayItemSize extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: range(10000).map(() => {
        return Math.max(Math.ceil(Math.random() * 200), 50);
      }),
    };
  }

  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    return (
      <div
        className="Row"
        style={{...style, backgroundColor: index % 2 ? '#eee' : 'white'}}
        key={index}
      >
        Row #{index + 1}. Height: {this.state.items[index]}
      </div>
    );
  };

  render() {
    return (
      <VirtualList
        width="auto"
        height={400}
        itemCount={this.state.items.length}
        renderItem={this.renderItem}
        itemSize={this.state.items}
        className="VirtualList"
      />
    );
  }
}

class FunctionItemSize extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      items: range(10000).map(() => {
        return Math.max(Math.ceil(Math.random() * 100), 50);
      }),
    };
  }

  renderItem = ({style, index}: {style: ItemStyle; index: number}) => {
    return (
      <div
        className="Row"
        style={{...style, backgroundColor: index % 2 ? '#eee' : 'white'}}
        key={index}
      >
        Row #{index + 1}. Height: {this.state.items[index]}
      </div>
    );
  };

  render() {
    return (
      <VirtualList
        width="auto"
        height={400}
        itemCount={this.state.items.length}
        renderItem={this.renderItem}
        estimatedItemSize={75}
        itemSize={index => this.state.items[index]}
        className="VirtualList"
      />
    );
  }
}

class Demos extends React.Component {
  render() {
    return (
      <div className="Root">
        <h2>Fixed itemSize</h2>
        <FixedItemSize />
        <h2>Array itemSize (mixed heights)</h2>
        <ArrayItemSize />
        <h2>Function itemSize (just-in-time calculation)</h2>
        <FunctionItemSize />
      </div>
    );
  }
}

ReactDOM.render(<Demos />, document.querySelector('#app'));
