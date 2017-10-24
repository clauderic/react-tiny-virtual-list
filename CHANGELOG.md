Changelog
------------
### 2.1.3
Fix misuse of second argument of `componentDidUpdate` as `nextState` (the actual argument is `prevState`) [#27](https://github.com/clauderic/react-tiny-virtual-list/pull/27). Thanks [@gabrielecirulli](https://github.com/gabrielecirulli)!

### 2.1.3
Include TypeScript type definitions in npm package [#26](https://github.com/clauderic/react-tiny-virtual-list/issues/26)

### 2.1.2
Fixed build script for es modules build [#22](https://github.com/clauderic/react-tiny-virtual-list/issues/22)

### 2.1.1
Renamed `onRowsRendered` prop to `onItemsRendered`.

### 2.1.0
- Added `scrollToAlignment="auto"` option, which scrolls the least amount possible to ensure that the specified `scrollToIndex` item is fully visible [#19](https://github.com/clauderic/react-tiny-virtual-list/issues/19)
- Added `onRowsRendered` prop that is invoked with information about the slice of rows that were just rendered [#14](https://github.com/clauderic/react-tiny-virtual-list/issues/13)
- Converted project to TypeScript and added `types` entry to `package.json`

### 2.0.6
Fix PropType definitions for `width` and `height` props ([#13](https://github.com/clauderic/react-tiny-virtual-list/issues/13))

### 2.0.5
Fixes slow wheel scrolling / scroll-interruption issues with browsers such as Firefox (see [#7](https://github.com/clauderic/react-tiny-virtual-list/pull/7)). Thanks for the contribution [Magnitus-](https://github.com/Magnitus-)!

### 2.0.4
Use `prop-types` package for PropType validation for compatibility with React ^15.5

### 2.0.3
Fixes a bug introduced in `2.0.2` where `nextProps.estimatedItemSize` wasn't being passed down properly in `componentWillReceiveProps`

### 2.0.2
Added support for dynamic property updates to `itemCount` and `estimatedItemSize` [#3](https://github.com/clauderic/react-tiny-virtual-list/issues/3)

### 2.0.1
Fix certain unhandled scenarios in `componentWillReceiveProps`

### 2.0.0
Added support for horizontal lists via the `scrollDirection` prop

### 1.0.0
Initial release
