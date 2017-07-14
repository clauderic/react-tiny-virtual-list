Changelog
------------
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
