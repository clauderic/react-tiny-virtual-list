import * as React from 'react';
import {render} from 'react-dom';
import VirtualList from '../src';

const HEIGHT = 100;
const ITEM_HEIGHT = 10;

interface ItemAttributes {
  index: number;
  style: React.CSSProperties;
  className?: string;
}

describe('VirtualList', () => {
  let node: HTMLDivElement;
  function renderItem({index, style, ...props}: ItemAttributes) {
    return (
      <div className="item" key={index} style={style} {...props}>
        Item #{index}
      </div>
    );
  }
  function getComponent(props = {}) {
    return (
      <VirtualList
        height={HEIGHT}
        overscanCount={0}
        itemSize={ITEM_HEIGHT}
        itemCount={500}
        renderItem={renderItem}
        {...props}
      />
    );
  }

  beforeEach(() => {
    node = document.createElement('div');
  });

  describe('number of rendered children', () => {
    it('renders enough children to fill the view', () => {
      render(getComponent(), node);

      expect(node.querySelectorAll('.item')).toHaveLength(HEIGHT / ITEM_HEIGHT);
    });

    it('does not render more children than available if the list is not filled', () => {
      render(getComponent({itemCount: 5}), node);

      expect(node.querySelectorAll('.item')).toHaveLength(5);
    });

    it('handles dynamically updating the number of items', () => {
      for (let itemCount = 0; itemCount < 5; itemCount++) {
        render(getComponent({itemCount}), node);
        expect(node.querySelectorAll('.item')).toHaveLength(itemCount);
      }
    });

    describe('stickyIndices', () => {
      const stickyIndices = [0, 10, 20, 30, 50];

      function itemRenderer({index, style}) {
        return renderItem({
          index,
          style,
          className: stickyIndices.includes(index) ? 'item sticky' : 'item',
        });
      }

      it('renders all sticky indices when scrollTop is zero', () => {
        render(
          getComponent({
            itemCount: 100,
            stickyIndices,
            renderItem: itemRenderer,
          }),
          node,
        );

        expect(node.querySelectorAll('.sticky')).toHaveLength(
          stickyIndices.length,
        );
      });

      it('keeps sticky indices rendered when scrolling', () => {
        render(
          getComponent({
            itemCount: 100,
            stickyIndices,
            renderItem: itemRenderer,
            scrollOffset: 500,
          }),
          node,
        );

        expect(node.querySelectorAll('.sticky')).toHaveLength(
          stickyIndices.length,
        );
      });
    });
  });

  /** Test scrolling via initial props */
  describe('scrollToIndex', () => {
    it('scrolls to the top', () => {
      render(getComponent({scrollToIndex: 0}), node);

      expect(node.textContent).toContain('Item #0');
    });

    it('scrolls down to the middle', () => {
      render(getComponent({scrollToIndex: 49}), node);

      expect(node.textContent).toContain('Item #49');
    });

    it('scrolls to the bottom', () => {
      render(getComponent({scrollToIndex: 99}), node);

      expect(node.textContent).toContain('Item #99');
    });

    it('scrolls to the correct position for :scrollToAlignment "start"', () => {
      render(
        getComponent({
          scrollToAlignment: 'start',
          scrollToIndex: 49,
        }),
        node,
      );

      // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
      expect(node.textContent).toContain('Item #49');
      expect(node.textContent).toContain('Item #58');
    });

    it('scrolls to the correct position for :scrollToAlignment "end"', () => {
      render(
        getComponent({
          scrollToIndex: 99,
        }),
        node,
      );
      render(
        getComponent({
          scrollToAlignment: 'end',
          scrollToIndex: 49,
        }),
        node,
      );

      // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
      expect(node.textContent).toContain('Item #40');
      expect(node.textContent).toContain('Item #49');
    });

    it('scrolls to the correct position for :scrollToAlignment "center"', () => {
      render(
        getComponent({
          scrollToIndex: 99,
        }),
        node,
      );
      render(
        getComponent({
          scrollToAlignment: 'center',
          scrollToIndex: 49,
        }),
        node,
      );

      // 100 items * 10 item height = 1,000 total item height; 11 items can be visible at a time (the first and last item are only partially visible)
      expect(node.textContent).toContain('Item #44');
      expect(node.textContent).toContain('Item #54');
    });
  });

  describe('property updates', () => {
    it('updates :scrollToIndex position when :itemSize changes', () => {
      render(getComponent({scrollToIndex: 50}), node);
      expect(node.textContent).toContain('Item #50');

      // Making rows taller pushes name off/beyond the scrolled area
      render(getComponent({scrollToIndex: 50, itemSize: 20}), node);
      expect(node.textContent).toContain('Item #50');
    });

    it('updates :scrollToIndex position when :height changes', () => {
      render(getComponent({scrollToIndex: 50}), node);
      expect(node.textContent).toContain('Item #50');

      // Making the list shorter leaves only room for 1 item
      render(getComponent({scrollToIndex: 50, height: 20}), node);
      expect(node.textContent).toContain('Item #50');
    });

    it('updates :scrollToIndex position when :scrollToIndex changes', () => {
      render(getComponent(), node);
      expect(node.textContent).not.toContain('Item #50');

      render(getComponent({scrollToIndex: 50}), node);
      expect(node.textContent).toContain('Item #50');
    });

    it('updates scroll position if size shrinks smaller than the current scroll', () => {
      render(getComponent({scrollToIndex: 500}), node);
      render(getComponent({scrollToIndex: 500, itemCount: 10}), node);

      expect(node.textContent).toContain('Item #9');
    });
  });

  describe(':scrollOffset property', () => {
    it('renders correctly when an initial :scrollOffset property is specified', () => {
      render(
        getComponent({
          scrollOffset: 100,
        }),
        node,
      );
      const items = node.querySelectorAll('.item');
      const first = items[0];
      const last = items[items.length - 1];

      expect(first.textContent).toContain('Item #10');
      expect(last.textContent).toContain('Item #19');
    });

    it('renders correctly when an :scrollOffset property is specified after the component has initialized', () => {
      render(getComponent(), node);
      let items = node.querySelectorAll('.item');
      let first = items[0];
      let last = items[items.length - 1];

      expect(first.textContent).toContain('Item #0');
      expect(last.textContent).toContain('Item #9');

      render(
        getComponent({
          scrollOffset: 100,
        }),
        node,
      );
      items = node.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];

      expect(first.textContent).toContain('Item #10');
      expect(last.textContent).toContain('Item #19');
    });
  });
});
