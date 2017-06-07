import React, {PureComponent} from 'react';
import PropTypes from 'prop-types';
import SizeAndPositionManager from './SizeAndPositionManager';
import {
  ALIGN_CENTER,
  ALIGN_END,
  ALIGN_START,
  CLIENT_WIDTH,
  DEFAULT_SCROLL_DIRECTION,
  DIRECTION_VERTICAL,
  DIRECTION_HORIZONTAL,
  LANGUAGE_DIRECTION_LTR,
  LANGUAGE_DIRECTION_RTL,
  SCROLL_CHANGE_OBSERVED,
  SCROLL_CHANGE_REQUESTED,
  SCROLL_WIDTH,
  SCROLL_IMPLEMENTATION_DEFAULT,
  SCROLL_IMPLEMENTATION_NEGATIVE,
  SCROLL_IMPLEMENTATION_REVERSE,
  positionProp,
  scrollProp,
  sizeProp,
} from './constants';

const STYLE_WRAPPER = {overflow: 'auto', willChange: 'transform', WebkitOverflowScrolling: 'touch'};
const STYLE_INNER = {position: 'relative', overflow: 'hidden', width: '100%', minHeight: '100%'};
const STYLE_ITEM = {position: 'absolute', width: '100%'};

export function testScrollImplementaion() {
  /* 
    Different browsers have different implementaions of scrollLeft on elements with direction='rtl', this tests for an implementation
    inspired by 
      https://github.com/othree/jquery.rtl-scroll-type/blob/master/src/jquery.rtl-scroll.js &&
      https://stackoverflow.com/questions/24276619/better-way-to-get-the-viewport-of-a-scrollable-div-in-rtl-mode/24394376#24394376 
  */
  let scrollImplementation = SCROLL_IMPLEMENTATION_DEFAULT;

  const testDiv = document.createElement('div');
  testDiv.innerHTML = '<div dir="rtl" class="test" style="font-size: 14px; width: 4px; height: 1px; position: absolute; top: 0px; overflow: scroll">ABCDEFASDASD</div>';
  document.body.appendChild(testDiv);
  const tester = testDiv.querySelector('.test');

  if (tester.scrollLeft > 0) {
    scrollImplementation = SCROLL_IMPLEMENTATION_REVERSE;
  } else {
    tester.scrollLeft = -1;
    if (tester.scrollLeft === -1) {
      scrollImplementation = SCROLL_IMPLEMENTATION_NEGATIVE;
    } else {
      scrollImplementation = SCROLL_IMPLEMENTATION_REVERSE;
    }
  }

  document.body.removeChild(testDiv);
  return scrollImplementation;
}

const scrollImplementation = testScrollImplementaion();

export default class VirtualList extends PureComponent {
  static defaultProps = {
    overscanCount: 3,
    languageDirection: LANGUAGE_DIRECTION_LTR,
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
    languageDirection: PropTypes.oneOf([LANGUAGE_DIRECTION_RTL, LANGUAGE_DIRECTION_LTR]),
    scrollOffset: PropTypes.number,
    scrollToIndex: PropTypes.number,
    scrollToAlignment: PropTypes.oneOf([ALIGN_START, ALIGN_CENTER, ALIGN_END]),
    scrollDirection: PropTypes.oneOf([DIRECTION_HORIZONTAL, DIRECTION_VERTICAL]).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  sizeAndPositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: ({index}) => this.getSize(index),
    estimatedItemSize: this.getEstimatedItemSize(),
  });

  state = {
    offset: (
      this.props.scrollOffset ||
      this.props.scrollToIndex != null && this.getOffsetForIndex(this.props.scrollToIndex) ||
      0
    ),
    scrollChangeReason: SCROLL_CHANGE_REQUESTED,
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
    const {
      estimatedItemSize,
      itemCount,
      itemSize,
      scrollOffset,
      scrollToAlignment,
      scrollToIndex,
    } = this.props;
    const scrollPropsHaveChanged = (
      nextProps.scrollToIndex !== scrollToIndex ||
      nextProps.scrollToAlignment !== scrollToAlignment
    );
    const itemPropsHaveChanged = (
      nextProps.itemCount !== itemCount ||
      nextProps.itemSize !== itemSize ||
      nextProps.estimatedItemSize !== estimatedItemSize
    );

    if (
      nextProps.itemCount !== itemCount ||
      nextProps.estimatedItemSize !== estimatedItemSize
    ) {
      this.sizeAndPositionManager.updateConfig({
        itemCount: nextProps.itemCount,
        estimatedItemSize: this.getEstimatedItemSize(nextProps),
      });
    }

    if (itemPropsHaveChanged) {
      this.recomputeSizes();
    }

    if (nextProps.scrollOffset !== scrollOffset) {
      this.setState({
        offset: nextProps.scrollOffset,
        scrollChangeReason: SCROLL_CHANGE_REQUESTED,
      });
    } else if (
      scrollPropsHaveChanged ||
      nextProps.scrollToIndex && itemPropsHaveChanged
    ) {
      this.setState({
        offset: this.getOffsetForIndex(nextProps.scrollToIndex, nextProps.scrollToAlignment, nextProps.itemCount),
        scrollChangeReason: SCROLL_CHANGE_REQUESTED,
      });
    }
  }

  componentDidUpdate(nextProps, nextState) {
    const {offset} = this.state;

    if (nextState.offset !== offset && nextState.scrollChangeReason === SCROLL_CHANGE_REQUESTED) {
      this.scrollTo(offset);
    }
  }

  handleScroll = e => {
    const {onScroll} = this.props;
    const offset = this.getNodeOffset();

    if (offset < 0 || this.state.offset === offset || e.target !== this.rootNode) {
      return;
    }

    this.setState({
      offset,
      scrollChangeReason: SCROLL_CHANGE_OBSERVED,
    });

    if (typeof onScroll === 'function') {
      onScroll(offset, e);
    }
  };

  getEstimatedItemSize(props = this.props) {
    return props.estimatedItemSize || typeof props.itemSize === "number" && props.itemSize || 50;
  }

  getNodeOffset() {
    const {scrollDirection, languageDirection} = this.props;
    
    let offset;
    
    if (languageDirection === 'rtl') {
      
      if (scrollImplementation === SCROLL_IMPLEMENTATION_NEGATIVE) {
     
        offset = -this.rootNode[scrollProp[scrollDirection]];
      } else if (scrollImplementation === SCROLL_IMPLEMENTATION_REVERSE) {
     
        offset = this.rootNode[SCROLL_WIDTH] - this.rootNode[scrollProp[scrollDirection]] - this.rootNode[CLIENT_WIDTH];
      } else {

        offset = this.rootNode[scrollProp[DEFAULT_SCROLL_DIRECTION]];
      }
    } else {
      offset = this.rootNode[scrollProp[scrollDirection]];
    }

    return offset;
  }

  scrollTo(value) {
    const {scrollDirection, languageDirection} = this.props;
    if (languageDirection === 'rtl') {

      this.rootNode[scrollProp[scrollDirection]] = this.rootNode[SCROLL_WIDTH] - value;
    } else {
      this.rootNode[scrollProp[scrollDirection]] = value;
    }

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

    const {scrollDirection, languageDirection} = this.props;
    const {size, offset} = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

    const LOCALIZED_STYLE_INNER = Object.assign({}, STYLE_ITEM, 
      { 
        left: languageDirection === 'rtl' ? 'auto' : 0, 
        right: languageDirection === 'rtl' ? 0 : 'auto' ,
      });

    const offsetProp = (scrollDirection === DIRECTION_HORIZONTAL ? positionProp[scrollDirection][languageDirection] : positionProp[scrollDirection]);

    return this._styleCache[index] = {
      ...LOCALIZED_STYLE_INNER,
      [offsetProp]: offset,
      [sizeProp[scrollDirection]]: size,
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
      languageDirection,
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

    const LOCALIZED_STYLE_WRAPPER = Object.assign({}, STYLE_WRAPPER, { direction: languageDirection });

    return (
      <div ref={this._getRef} {...props} onScroll={this.handleScroll} style={{...LOCALIZED_STYLE_WRAPPER, ...style, height, width}}>
        <div style={{...STYLE_INNER, [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize()}}>
          {items}
        </div>
      </div>
    );
  }
}
