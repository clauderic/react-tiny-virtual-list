import React from 'react';
import {findDOMNode, render} from 'react-dom';
import { Simulate } from 'react-addons-test-utils';
import VirtualList from '../src/';
import { generateCalendar, genLeftPartCalendar } from './dateGenerator';

const HEIGHT = 100;
const ITEM_HEIGHT = 10;
const ITEM_COUNT = 500;

let childrenList = generateCalendar({count: ITEM_COUNT});

describe('VirtualList', () => {
  let node;
  function getComponent(props = {}) {
    return (
      <VirtualList
        height={HEIGHT}
        overscanCount={0}
        itemSize={ITEM_HEIGHT}
        itemCount={childrenList.length}
        renderItem={({index, style}) => (
          <div className="item" key={childrenList[index].id} style={style}>
            Item #{childrenList[index].strDate}
          </div>
        )}
        {...props}
      />
    );
  }

  beforeEach(() => {
    node = document.createElement('div');
  });

  describe('number of rendered children', () => {
    it('renders enough children to fill the view', () => {
      const rendered = findDOMNode(render(getComponent(), node));
      expect(rendered.querySelectorAll('.item').length).toEqual(
        HEIGHT / ITEM_HEIGHT,
      );
    });

    it('does not render more children than available if the list is not filled', () => {
      const rendered = findDOMNode(
        render(getComponent({itemCount: 5}), node),
      );
      expect(rendered.querySelectorAll('.item').length).toEqual(5);
    });

    it('handles dynamically updating the number of items', () => {
      for (let itemCount = 0; itemCount < 5; itemCount++) {
        const rendered = findDOMNode(render(getComponent({itemCount}), node));
        expect(rendered.querySelectorAll('.item').length).toEqual(itemCount);
      }
    });
  });

  /** Test scrolling via initial props */
  describe('scrollToIndex', () => {
    it('scrolls to the top', () => {
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 0}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[0].strDate}`);
    });

    it('scrolls down to the middle', () => {
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 49}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[49].strDate}`);
    });

    it('scrolls to the bottom', () => {
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 99}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[99].strDate}`);
    });

    it('scrolls to the correct position for :scrollToAlignment "start"', () => {
      const rendered = findDOMNode(
        render(
          getComponent({
            scrollToAlignment: 'start',
            scrollToIndex: 49,
          }),
          node,
        ),
      );
      // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
      expect(rendered.textContent).toContain(`Item #${childrenList[49].strDate}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[58].strDate}`);
    });

    it('scrolls to the correct position for :scrollToAlignment "end"', () => {
      render(getComponent({
        scrollToIndex: 99,
      }), node);
      const rendered = findDOMNode(
        render(getComponent({
          scrollToAlignment: 'end',
          scrollToIndex: 49,
        }), node)
      );
      // 100 items * 10 item height = 1,000 total item height; 10 items can be visible at a time.
      expect(rendered.textContent).toContain(`Item #${childrenList[40].strDate}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[49].strDate}`);
    });

    it('scrolls to the correct position for :scrollToAlignment "center"', () => {
      render(getComponent({
        scrollToIndex: 99,
      }), node);
      const rendered = findDOMNode(render(getComponent({
        scrollToAlignment: 'center',
        scrollToIndex: 49,
      }), node));
      // 100 items * 10 item height = 1,000 total item height; 11 items can be visible at a time (the first and last item are only partially visible)
      expect(rendered.textContent).toContain(`Item #${childrenList[44].strDate}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[54].strDate}`);
    });
  });

  describe('property updates', () => {
    it('updates :scrollToIndex position when :itemSize changes', () => {
      let rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50].strDate}`);
      // Making rows taller pushes name off/beyond the scrolled area
      rendered = findDOMNode(
        render(getComponent({scrollToIndex: 50, itemSize: 20}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[50].strDate}`);
    });

    it('updates :scrollToIndex position when :height changes', () => {
      let rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50].strDate}`);
      // Making the list shorter leaves only room for 1 item
      rendered = findDOMNode(
        render(getComponent({scrollToIndex: 50, height: 20}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[50].strDate}`);
    });

    it('updates :scrollToIndex position when :scrollToIndex changes', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      expect(rendered.textContent).not.toContain(`Item #${childrenList[50].strDate}`);
      rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50].strDate}`);
    });

    it('updates scroll position if size shrinks smaller than the current scroll', () => {
      findDOMNode(render(getComponent({scrollToIndex: 500}), node));
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 500, itemCount: 10}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[9].strDate}`);
    });
  });

  describe(':scrollOffset property', () => {
    it('renders correctly when an initial :scrollOffset property is specified', () => {
      const rendered = findDOMNode(render(getComponent({
        scrollOffset: 100,
      }), node));
      const items = rendered.querySelectorAll('.item');
      const first = items[0];
      const last = items[items.length - 1];

      expect(first.textContent).toContain(`Item #${childrenList[10].strDate}`);
      expect(last.textContent).toContain(`Item #${childrenList[19].strDate}`);
    });

    it('renders correctly when an initial :scrollOffset property is specified', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      let items = rendered.querySelectorAll('.item');
      let first = items[0];
      let last = items[items.length - 1];

      expect(first.textContent).toContain(`Item #${childrenList[0].strDate}`);
      expect(last.textContent).toContain(`Item #${childrenList[9].strDate}`);

      rendered = findDOMNode(render(getComponent({
        scrollOffset: 100,
      }), node));
      items = rendered.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];

      expect(first.textContent).toContain(`Item #${childrenList[10].strDate}`);
      expect(last.textContent).toContain(`Item #${childrenList[19].strDate}`);
    });

    it('updates :scrollOffSet position correctly when items have been changed and scrollOffset property is specified', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      let items = rendered.querySelectorAll('.item');
      let first = items[0];
      let last = items[items.length - 1];
      const itemsAdded = 25;
      const curDate = childrenList[0].strDate;
      expect(first.textContent).toContain(`Item #${childrenList[0].strDate}`);
      expect(last.textContent).toContain(`Item #${childrenList[9].strDate}`);
      childrenList = [ ...genLeftPartCalendar(curDate, itemsAdded), ...childrenList];
      const listComponent = getComponent({
        scrollOffset: itemsAdded * ITEM_HEIGHT,
      });
      rendered = findDOMNode(render(listComponent, node));

      items = rendered.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];
      console.log(first.textContent, '=', `Item #${childrenList[itemsAdded].strDate}`);
      expect(first.textContent).toContain(`Item #${childrenList[itemsAdded].strDate}`);
      expect(last.textContent).toContain(`Item #${childrenList[itemsAdded + 9].strDate}`);
    });
  });
});
