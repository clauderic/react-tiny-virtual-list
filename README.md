<div align="center" style="margin-bottom: 30px;">
<img src="https://cloud.githubusercontent.com/assets/1416436/23347339/b7094992-fc6f-11e6-93bf-13b60538f142.png" width="150"/>
</div>

# react-tiny-virtual-list
> A tiny but mighty 2kb list virtualization component, with zero dependencies 💪

[![npm version](https://img.shields.io/npm/v/react-mighty-infinite-list.svg)](https://www.npmjs.com/package/react-tiny-virtual-list)
[![license](https://img.shields.io/github/license/mashape/apistatus.svg?maxAge=2592000)](https://github.com/clauderic/react-tiny-virtual-list/blob/master/LICENSE)
[![Gitter](https://badges.gitter.im/clauderic/react-tiny-virtual-list.svg)](https://gitter.im/clauderic/react-tiny-virtual-list)

* **Tiny & dependency free** – 5kb minified, ~2kb gzipped
* **Render millions of rows**, without breaking a sweat
* **Scroll to index** or **set the initial scroll offset**
* **Supports fixed** or **variable row heights**

Getting Started
---------------

Using [npm](https://www.npmjs.com/):
```
npm install react-tiny-virtual-list --save
```

ES6, CommonJS, and UMD builds are available with each distribution. For example:
```js
import VirtualList from 'react-tiny-virtual-list';
```

You can also use a global-friendly UMD build:
```html
<script src="react-tiny-virtual-list/umd/react-tiny-virtual-list.js"></script>
<script>
var VirtualList = window.VirtualList.default;
...
</script>
```

Example usage
-------------

```js
import React from 'react';
import {render} from 'react-dom';
import VirtualList from 'react-tiny-virtual-list';

const data = ['A', 'B', 'C', 'D', 'E', 'F', ...];

render(
  <VirtualList
    height={600}
    rowCount={data.length}
    rowHeight={50} // Also supports variable heights (array or function getter)
    renderRow={({index, style}) =>
      <div key={index} style={style}> // The style property contains the row's absolute position
        Letter: {data[index]}, Row: #{index}
      </div>
    }
  />,
  document.getElementById('root')
);
```

### Prop Types
| Property           | Type             | Required? | Description                                                                                                                                                                                 |
|:-------------------|:-----------------|:----------|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| width              | Number or String |           | Width of List. Defaults to `100%`                                                                                                                                                           |
| height             | Number           | ✓         | Height of List; this property will determine the number of rendered vs virtualized rows.                                                                                                    |
| rowCount           | Number           | ✓         | The number of rows you want to render                                                                                                                                                       |
| renderRow          | Function         | ✓         | Responsible for rendering a row: `({index: number, style: Object}): React.PropTypes.node`. The returned element must handle key and style.                                                  |
| rowHeight          |                  | ✓         | Either a fixed row height (number), an array containing the heights of all the rows in your list, or a function that returns the height of a row given its index: `(index: number): number` |
| scrollTop          | Number           |           | Can be used to control the vertical scroll offset; Useful for setting an initial scroll offset                                                                                              |
| scrollToIndex      | Number           |           | Row index to ensure visible (by forcefully scrolling if necessary)                                                                                                                          |
| scrollToAlignment  |                  |           | Used in combination with `scrollToIndex`, this prop controls the alignment of the scrolled to row. One of: 'auto', 'start', 'center' or 'end'                                               |
| overscanCount      | Number           |           | Number of extra buffer rows to render above/below the visible rows. Tweaking this can help reduce scroll flickering on certain browers/devices.                                             |
| estimatedRowHeight | Number           |           | Used to estimate the total height of the list before all of its rows have actually been measured. The estimated total height is progressively adjusted as rows are rendered.                |

## Reporting Issues
Found an issue? Please [report it](https://github.com/clauderic/react-tiny-virtual-list/issues) along with any relevant details to reproduce it.

## Contributions
Feature requests / pull requests are welcome, though please take a moment to make sure your contributions fits within the scope of the project. [Learn how to contribute](https://github.com/clauderic/react-tiny-virtual-list/blob/master/CONTRIBUTING.md)

## Acknowledgments
This library draws inspiration from [react-virtualized](https://github.com/bvaughn/react-virtualized), and is meant as a bare-minimum replacement for the [List](https://github.com/bvaughn/react-virtualized/blob/master/docs/List.md) component. If you're looking for a tiny, lightweight and dependency-free list virtualization library that supports variable heights, you're in the right place! If you're looking for something that supports more use-cases, I highly encourage you to check out [react-virtualized](https://github.com/bvaughn/react-virtualized) instead, it's a fantastic library ❤️

## License
react-tiny-virtual-list is available under the MIT License.
