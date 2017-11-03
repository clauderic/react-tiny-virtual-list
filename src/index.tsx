import * as React from 'react';
import * as PropTypes from 'prop-types';
import SizeAndPositionManager, {ItemSize} from './SizeAndPositionManager';
import {
  ALIGNMENT,
  ALIGN_AUTO,
  ALIGN_CENTER,
  ALIGN_END,
  ALIGN_START,
  DIRECTION,
  DIRECTION_VERTICAL,
  DIRECTION_HORIZONTAL,
  SCROLL_CHANGE_REASON,
  SCROLL_CHANGE_OBSERVED,
  SCROLL_CHANGE_REQUESTED,
  positionProp,
  scrollProp,
  sizeProp,
} from './constants';

const STYLE_WRAPPER: React.CSSProperties = {
  overflow: 'auto',
  willChange: 'transform',
  WebkitOverflowScrolling: 'touch',
};

const STYLE_INNER: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  width: '100%',
  minHeight: '100%',
};

const STYLE_ITEM: {position: 'absolute', left: number, width: string} = {
  position: 'absolute',
  left: 0,
  width: '100%',
};

export interface ItemStyle {
  position: 'absolute',
  top?: number,
  left: number,
  width: string | number,
  height?: number,
}

interface StyleCache {
  [id: number]: ItemStyle,
}

export interface ItemInfo {
  index: number,
  style: ItemStyle,
}

export interface RenderedRows {
  startIndex: number,
  stopIndex: number,
}

export interface Props {
  className?: string,
  estimatedItemSize?: number,
  height: number | string,
  itemCount: number,
  itemSize: ItemSize,
  overscanCount?: number,
  scrollOffset?: number,
  scrollToIndex?: number,
  scrollToAlignment?: ALIGNMENT,
  scrollDirection?: DIRECTION,
  style?: any,
  width?: number | string,
  onItemsRendered?({startIndex, stopIndex}: RenderedRows): void,
  onScroll?(offset: number, event: React.UIEvent<HTMLElement>): void,
  renderItem(itemInfo: ItemInfo): React.ReactNode,
  renderWrapper?(outerProps: any, ref: any, innerStyle: any, items: React.ReactNode[]): React.ReactElement<any>,
}

export interface State {
  offset: number,
  scrollChangeReason: SCROLL_CHANGE_REASON,
}

function defaultRenderWrapper(outerProps: any, ref: (node: HTMLElement) => void, innerStyle: React.CSSProperties , items: React.ReactNode[]) {
  return (
    <div ref={ref} {...outerProps}>
      <div style={innerStyle}>
        {items}
      </div>
    </div>);
}


export default class VirtualList extends React.PureComponent<Props, State> {
  static defaultProps = {
    overscanCount: 3,
    renderWrapper: defaultRenderWrapper,
    scrollDirection: DIRECTION_VERTICAL,
    width: '100%',
  };

  static propTypes = {
    estimatedItemSize: PropTypes.number,
    height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
    itemCount: PropTypes.number.isRequired,
    itemSize: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.func]).isRequired,
    onItemsRendered: PropTypes.func,
    overscanCount: PropTypes.number,
    renderItem: PropTypes.func.isRequired,
    renderWrapper: PropTypes.func,
    scrollOffset: PropTypes.number,
    scrollToIndex: PropTypes.number,
    scrollToAlignment: PropTypes.oneOf([ALIGN_AUTO, ALIGN_START, ALIGN_CENTER, ALIGN_END]),
    scrollDirection: PropTypes.oneOf([DIRECTION_HORIZONTAL, DIRECTION_VERTICAL]).isRequired,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  };

  sizeAndPositionManager = new SizeAndPositionManager({
    itemCount: this.props.itemCount,
    itemSizeGetter: (index) => this.getSize(index),
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

  private rootNode: HTMLElement;

  private styleCache: StyleCache = {};

  componentDidMount() {
    const {scrollOffset, scrollToIndex} = this.props;

    if (scrollOffset != null) {
      this.scrollTo(scrollOffset);
    } else if (scrollToIndex != null) {
      this.scrollTo(this.getOffsetForIndex(scrollToIndex));
    }
  }

  componentWillReceiveProps(nextProps: Props) {
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
        offset: nextProps.scrollOffset || 0,
        scrollChangeReason: SCROLL_CHANGE_REQUESTED,
      });
    } else if (
      typeof nextProps.scrollToIndex === 'number' && (
        scrollPropsHaveChanged || itemPropsHaveChanged
      )
    ) {
      this.setState({
        offset: this.getOffsetForIndex(nextProps.scrollToIndex, nextProps.scrollToAlignment, nextProps.itemCount),
        scrollChangeReason: SCROLL_CHANGE_REQUESTED,
      });
    }
  }

  componentDidUpdate(_: Props, prevState: State) {
    const {offset, scrollChangeReason} = this.state;

    if (prevState.offset !== offset && scrollChangeReason === SCROLL_CHANGE_REQUESTED) {
      this.scrollTo(offset);
    }
  }

  handleScroll = (e: React.UIEvent<HTMLElement>)  => {
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
  }

  getEstimatedItemSize(props = this.props) {
    return props.estimatedItemSize || typeof props.itemSize === 'number' && props.itemSize || 50;
  }

  getNodeOffset() {
    const {scrollDirection = DIRECTION_VERTICAL} = this.props;
    return this.rootNode[scrollProp[scrollDirection]];
  }

  scrollTo(value: number) {
    const {scrollDirection = DIRECTION_VERTICAL} = this.props;
    this.rootNode[scrollProp[scrollDirection]] = value;
  }

  getOffsetForIndex(index: number, scrollToAlignment = this.props.scrollToAlignment, itemCount: number = this.props.itemCount): number {
    const {scrollDirection = DIRECTION_VERTICAL} = this.props;

    if (index < 0 || index >= itemCount) {
      index = 0;
    }

    return this.sizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: this.props[sizeProp[scrollDirection]],
      currentOffset: this.state && this.state.offset || 0,
      targetIndex: index,
    });
  }

  getSize(index: number) {
    const {itemSize} = this.props;

    if (typeof itemSize === 'function') {
      return itemSize(index);
    }

    return Array.isArray(itemSize) ? itemSize[index] : itemSize;
  }

  getStyle(index: number) {
    const style = this.styleCache[index];
    if (style) { return style; }

    const {scrollDirection = DIRECTION_VERTICAL} = this.props;
    const {size, offset} = this.sizeAndPositionManager.getSizeAndPositionForIndex(index);

    return this.styleCache[index] = {
      ...STYLE_ITEM,
      [sizeProp[scrollDirection]]: size,
      [positionProp[scrollDirection]]: offset,
    };
  }

  recomputeSizes(startIndex = 0) {
    this.styleCache = {};
    this.sizeAndPositionManager.resetItem(startIndex);
  }

  render() {
    const {
      estimatedItemSize,
      height,
      overscanCount = 3,
      renderItem,
      renderWrapper = defaultRenderWrapper,
      itemCount,
      itemSize,
      onItemsRendered,
      onScroll,
      scrollDirection = DIRECTION_VERTICAL,
      scrollOffset,
      scrollToIndex,
      scrollToAlignment,
      style,
      width,
      ...props,
    } = this.props;
    const {offset} = this.state;
    const {start, stop} = this.sizeAndPositionManager.getVisibleRange({
      containerSize: this.props[sizeProp[scrollDirection]] || 0,
      offset,
      overscanCount,
    });
    const items: React.ReactNode[] = [];

    if (typeof start !== 'undefined' && typeof stop !== 'undefined') {
      for (let index = start; index <= stop; index++) {
        items.push(renderItem({
          index,
          style: this.getStyle(index),
        }));
      }

      if (typeof onItemsRendered === 'function') {
        onItemsRendered({
          startIndex: start,
          stopIndex: stop,
        });
      }
    }

    return renderWrapper(
      { ...props, onScroll: this.handleScroll, style: { ...STYLE_WRAPPER, ...style, height, width } },
      this.getRef,
      { ...STYLE_INNER, [sizeProp[scrollDirection]]: this.sizeAndPositionManager.getTotalSize() },
      items,
    );
  }

  private getRef = (node: HTMLElement): void => {
    this.rootNode = node;
  }
}
