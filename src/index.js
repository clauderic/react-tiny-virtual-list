import React, {PureComponent, PropTypes} from 'react';
import SizeAndPositionManager from './SizeAndPositionManager';

const STYLE_WRAPPER = {overflow: 'auto', willChange: 'transform', WebkitOverflowScrolling: 'touch'};
const STYLE_INNER = {position: 'relative', overflow: 'hidden', width: '100%', minHeight: '100%'};
const STYLE_ITEM = {position: 'absolute', left: 0, width: '100%'};
const DIRECTION_VERTICAL = 'vertical';
const DIRECTION_HORIZONTAL = 'horizontal';
const scrollProp = {
  [DIRECTION_VERTICAL]: 'scrollTop',
  [DIRECTION_HORIZONTAL]: 'scrollLeft',
};

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
    scrollToAlignment: PropTypes.oneOf(['start', 'center', 'end']),
    scrollDirection: PropTypes.oneOf([DIRECTION_HORIZONTAL, DIRECTION_VERTICAL]).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  sizeAndPositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: ({index}) => this.getRowHeight(index),
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

  handleScroll = e => {
    const {onScroll} = this.props;
    const offset = this.getNodeOffset();

    this.setOffset(offset);

    if (typeof onScroll === 'function') {
      onScroll(offset, e);
    }
  };

  componentDidMount() {
    const {scrollDirection, scrollOffset, scrollToIndex} = this.props;

    if (scrollOffset != null) {
      this.scrollTo(scrollOffset);
    } else if (scrollToIndex != null) {
      this.scrollTo(this.getOffsetForIndex(scrollToIndex));
    }
  }

  componentWillReceiveProps(nextProps) {
    const {scrollOffset, scrollToAlignment, scrollToIndex} = this.props;

    if (nextProps.scrollOffset !== scrollOffset) {
      this.setOffset(nextProps.scrollOffset);
    } else if (
      nextProps.scrollToIndex !== scrollToIndex ||
      nextProps.scrollToAlignment !== scrollToAlignment
    ) {
      this.setOffset(this.getOffsetForIndex(nextProps.scrollToIndex, nextProps.scrollToAlignment));
    }
  }

  componentDidUpdate(nextProps, nextState) {
    const {scrollDirection, offset} = this.state;

    if (nextState.offset !== offset) {
      this.scrollTo(offset);
    }
  }

  getRowHeight(index) {
    const {itemSize} = this.props;

    if (typeof itemSize === 'function') { return itemSize(index); }

    return (Array.isArray(itemSize)) ? itemSize[index] : itemSize;
  }

  setOffset(offset) {
    this.setState({offset});
  }

  getNodeOffset() {
    const {scrollDirection} = this.props;
    return this.rootNode[scrollProp[scrollDirection]];
  }

  scrollTo(value) {
    const {scrollDirection} = this.props;
    this.rootNode[scrollProp[scrollDirection]] = value;
  }

  getOffsetForIndex(index, scrollToAlignment = this.props.scrollToAlignment) {
    const {height} = this.props;

    return this.sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: height,
      currentOffset: this.state && this.state.offset || 0,
      targetIndex: index,
    });
  }

  getRowsForOffset(offset) {
    const {height, overscanCount, itemCount} = this.props;
    let {start, stop} = this.sizeAndPositionManager.getVisibleRange({
      containerSize: height,
      offset,
    });

    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      stop = Math.min(stop + overscanCount, itemCount);
    }

    return {start, stop};
  }

  getRowStyle(index) {
    const style = this._styleCache[index];
    if (style) { return style; }

    const {size, offset} = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

    return this._styleCache[index] = {
      ...STYLE_ITEM,
      height: size,
      top: offset,
    };
  }
  cache = {};
  render() {
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
    const {start, stop} = this._indices = this.getRowsForOffset(offset);
    const rows = [];

    for (let index = start; index < stop; index++) {
      rows.push(renderItem({
        index,
        style: this.getRowStyle(index),
      }));
    }

    return (
      <div ref={this._getRef} {...props} onScroll={this.handleScroll} style={{...STYLE_WRAPPER, ...style, height, width}}>
        <div style={{...STYLE_INNER, height: this.sizeAndPositionManager.getTotalSize()}}>
          {rows}
        </div>
      </div>
    );
  }
}
