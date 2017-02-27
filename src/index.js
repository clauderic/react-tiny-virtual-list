import React, {PureComponent, PropTypes} from 'react';
import CellSizeAndPositionManager from './CellSizeAndPositionManager';

const STYLE_WRAPPER = {overflow: 'auto', willChange: 'transform'};
const STYLE_INNER = {position: 'relative', overflow: 'hidden', width: '100%', minHeight: '100%'};
const STYLE_ROW = {position: 'absolute', left: 0, width: '100%'};

export default class VirtualList extends PureComponent {
  static defaultProps = {
    overscanCount: 3,
    renderRow: () => { return null; },
    width: '100%',
  };
  static propTypes = {
    estimatedRowHeight: PropTypes.number,
    height: PropTypes.number.isRequired,
    data: PropTypes.array.isRequired,
    overscanCount: PropTypes.number,
    renderRow: PropTypes.func.isRequired,
    rowHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.array, PropTypes.func]).isRequired,
    scrollTop: PropTypes.number,
    scrollToIndex: PropTypes.number,
    scrollToAlignment: PropTypes.oneOf(['auto', 'start', 'center', 'end']),
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  }

  state = {
    offset: 0,
  };

  rowSizeAndPositionManager = new CellSizeAndPositionManager({
    cellCount: this.props.data.length,
    cellSizeGetter: ({index}) => this.getRowHeight(index),
    estimatedCellSize: this.props.estimatedRowHeight || typeof this.props.rowHeight === "number" && this.props.rowHeight || 100,
  });

  _styleCache = {};

  _getRef = node => {
    this.rootNode = node;
  };

  handleScroll = e => {
    const {onScroll} = this.props;
    const offset = this.rootNode.scrollTop;

    this.setState({offset});

    if (typeof onScroll === 'function') { onScroll(offset, e); }
  };

  componentDidMount() {
    const {scrollTop, scrollToIndex} = this.props;

    if (scrollTop != null) {
      this.scrollTo(scrollTop);
    } else if (scrollToIndex != null) {
      this.scrollToIndex(scrollToIndex);
    }
  }

  componentWillReceiveProps(nextProps) {
    const {scrollTop, scrollToIndex} = this.props;

    if (nextProps.scrollTop !== scrollTop) {
      this.scrollTo(nextProps.scrollTop);
    } else if (nextProps.scrollToIndex !== scrollToIndex) {
      this.scrollToIndex(nextProps.scrollToIndex);
    }
  }

  componentDidUpdate(nextProps, nextState) {
    const {scrollTop} = this.state;

    if (nextState.scrollTop !== scrollTop) {
      this.rootNode.scrollTop = scrollTop;
    }
  }

  getRowHeight(index) {
    const {rowHeight} = this.props;

    if (typeof rowHeight === 'function') { return rowHeight(index); }

    return (Array.isArray(rowHeight)) ? rowHeight[index] : rowHeight;
  }

  getRowOffset(index) {
    const {offset} = this.rowSizeAndPositionManager.getSizeAndPositionOfCell(index);

    return offset;
  }

  scrollTo(offset) {
    this.setState({
      offset,
      scrollTop: offset,
    });
  }

  scrollToIndex(index) {
    const {offset} = this.state;
    const {height, scrollToAlignment} = this.props;
    const rowOffset = this.rowSizeAndPositionManager.getUpdatedOffsetForIndex({
      align: scrollToAlignment,
      containerSize: height,
      currentOffset: offset,
      targetIndex: index,
    });

    this.scrollTo(rowOffset);
  }

  getRowsForOffset(offset) {
    const {height, overscanCount} = this.props;
    let {start, stop} = this.rowSizeAndPositionManager.getVisibleCellRange({
      containerSize: height,
      offset,
    });

    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      stop += overscanCount;
    }

    return {start, stop};
  }

  getTotalHeight() {
    return this.rowSizeAndPositionManager.getTotalSize();
  }

  getRowStyle(index) {
    const style = this._styleCache[index];
    if (style) { return style; }

    return this._styleCache[index] = {
      ...STYLE_ROW,
      height: this.getRowHeight(index),
      top: this.getRowOffset(index),
    };
  }

  render() {
    const {
      estimatedRowHeight,
      height,
      data,
      overscanCount,
      renderRow,
      rowHeight,
      scrollTop,
      scrollToIndex,
      scrollToAlignment,
      style,
      width,
      ...props
    } = this.props;
    const {offset} = this.state;
    const {start, stop} = this._indices = this.getRowsForOffset(offset);
    const rows = data.slice(start, stop);

    return (
      <div ref={this._getRef} {...props} onScroll={this.handleScroll} style={{...STYLE_WRAPPER, ...style, height, width}}>
        <div style={{...STYLE_INNER, height: this.getTotalHeight()}}>
          {rows.map((row, i) => {
            const index = start + i;

            return renderRow({
              index,
              row,
              style: this.getRowStyle(index),
            });
          })}
        </div>
      </div>
    );
  }
}
