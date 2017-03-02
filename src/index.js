import React, {PureComponent, PropTypes} from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';
import {
  ALIGN_CENTER,
  ALIGN_END,
  ALIGN_START,
  DIRECTION_VERTICAL,
  DIRECTION_HORIZONTAL,
  positionProp,
  scrollProp,
  sizeProp,
} from './constants';

const STYLE_WRAPPER = {overflow: 'auto', willChange: 'transform', WebkitOverflowScrolling: 'touch'};
const STYLE_INNER = {position: 'relative', overflow: 'hidden', width: '100%', minHeight: '100%'};
const STYLE_ITEM = {position: 'absolute', left: 0, width: '100%'};

export default class VirtualList extends PureComponent {
  static defaultProps = {
    overscanCount: 3,
    scrollDirection: DIRECTION_VERTICAL,
    width: '100%',
  };
  static propTypes = {
    estimatedItemSize: PropTypes.number,
    height: PropTypes.number.isRequired,
    itemCount: PropTypes.number.isRequired,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.func]).isRequired,
    overscanCount: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    scrollOffset: PropTypes.number,
    scrollToIndex: PropTypes.number,
    scrollToAlignment: PropTypes.oneOf([ALIGN_START, ALIGN_CENTER, ALIGN_END]),
    scrollDirection: PropTypes.oneOf([DIRECTION_HORIZONTAL, DIRECTION_VERTICAL]).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  sizeAndPositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: ({index}) => this.getSize(index),
    estimatedItemSize: this.props.estimatedItemSize || typeof this.props.itemSize === "number" && this.props.itemSize || 50,
  });

  state = {
    offset: (
      this.props.scrollOffset ||
      this.props.scrollToIndex != null && this.getOffsetForIndex(this.props.scrollToIndex) ||
      0
    ),
  };

  _styleCache = {};

  _getRef = node => {
    this.rootNode = node;
  };

  componentDidMount() {
    const {scrollOffset, scrollToIndex} = this.props;

    if (scrollOffset != null) {
      this.scrollTo(scrollOffset);
    } else if (scrollToIndex != null) {
      this.scrollTo(this.getOffsetForIndex(scrollToIndex));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {itemCount, itemSize, scrollOffset, scrollToAlignment, scrollToIndex} = this.props;
    const scrollPropsHaveChanged = (
      nextProps.scrollToIndex !== scrollToIndex ||
      nextProps.scrollToAlignment !== scrollToAlignment
    );
    const itemPropsHaveChanged = (
      nextProps.itemCount !== itemCount ||
      nextProps.itemSize !== itemSize
    );

    if (nextProps.itemSize !== itemSize) {
      this.recomputeSizes();
    }
    if (nextProps.scrollOffset !== scrollOffset) {
      this.setState({
        offset: nextProps.scrollOffset,
      });
    } else if (
      scrollPropsHaveChanged ||
      nextProps.scrollToIndex && itemPropsHaveChanged
    ) {
      this.setState({
        offset: this.getOffsetForIndex(nextProps.scrollToIndex, nextProps.scrollToAlignment, nextProps.itemCount),
      });
    }
  }

  componentDidUpdate(nextProps, nextState) {
    const {offset} = this.state;

    if (nextState.offset !== offset) {
      this.scrollTo(offset);
    }
  }

  handleScroll = e => {
    const {onScroll} = this.props;
    const offset = this.getNodeOffset();

    this.setState({offset});

    if (typeof onScroll === 'function') {
      onScroll(offset, e);
    }
  };

  getNodeOffset() {
    const {scrollDirection} = this.props;
    return this.rootNode[scrollProp[scrollDirection]];
  }

  scrollTo(value) {
    const {scrollDirection} = this.props;
    this.rootNode[scrollProp[scrollDirection]] = value;
  }

  getOffsetForIndex(index, scrollToAlignment = this.props.scrollToAlignment, itemCount = this.props.itemCount) {
    const {scrollDirection} = this.props;

    if (index < 0 || index >= itemCount) {
      index = 0;
    }

    return this.sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: this.props[sizeProp[scrollDirection]],
      targetIndex: index,
    });
  }

  getSize(index) {
    const {itemSize} = this.props;

    if (typeof itemSize === 'function') { return itemSize(index); }

    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  }

  getStyle(index) {
    const style = this._styleCache[index];
    if (style) { return style; }

    const {scrollDirection} = this.props;
    const {size, offset} = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

    return this._styleCache[index] = {
      ...STYLE_ITEM,
      [sizeProp[scrollDirection]]: size,
      [positionProp[scrollDirection]]: offset,
    };
  }

  recomputeSizes(startIndex = 0) {
    this._styleCache = {};
    this.sizeAndPositionManager.resetItem(startIndex);
  }

  render() {
    /* eslint-disable no-unused-vars */
    const {
      estimatedItemSize,
      height,
      overscanCount,
      renderItem,
      itemCount,
      itemSize,
      scrollDirection,
      scrollOffset,
      scrollToIndex,
      scrollToAlignment,
      style,
      width,
      ...props
    } = this.props;
    const {offset} = this.state;
    const {start, stop} = this.sizeAndPositionManager.getVisibleRange({
      containerSize: this.props[sizeProp[scrollDirection]],
      offset,
      overscanCount,
    });
    const items = [];

    for (let index = start; index <= stop; index++) {
      items.push(renderItem({
        index,
        style: this.getStyle(index),
      }));
    }

    return (
      <div ref={this._getRef} {...props} onScroll={this.handleScroll} style={{...STYLE_WRAPPER, ...style, height, width}}>
        <div style={{...STYLE_INNER, [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize()}}>
          {items}
        </div>
      </div>
    );
  }
}
