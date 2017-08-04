import React from 'react';
import {findDOMNode, render} from 'react-dom';
import { Simulate } from 'react-addons-test-utils';
import VirtualList from '../src/';
import { generateArr } from './arrGenerator';

const HEIGHT = 100;
const ITEM_HEIGHT = 10;
const ITEM_COUNT = 500;

let childrenList = generateArr(ITEM_COUNT);

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
          <div className="item" key={childrenList[index]} style={style}>
            Item #{childrenList[index]}
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
      expect(rendered.textContent).toContain(`Item #${childrenList[0]}`);
    });

    it('scrolls down to the middle', () => {
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 49}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[49]}`);
    });

    it('scrolls to the bottom', () => {
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 99}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[99]}`);
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
      expect(rendered.textContent).toContain(`Item #${childrenList[49]}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[58]}`);
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
      expect(rendered.textContent).toContain(`Item #${childrenList[40]}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[49]}`);
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
      expect(rendered.textContent).toContain(`Item #${childrenList[44]}`);
      expect(rendered.textContent).toContain(`Item #${childrenList[54]}`);
    });
  });

  describe('property updates', () => {
    it('updates :scrollToIndex position when :itemSize changes', () => {
      let rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50]}`);
      // Making rows taller pushes name off/beyond the scrolled area
      rendered = findDOMNode(
        render(getComponent({scrollToIndex: 50, itemSize: 20}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[50]}`);
    });

    it('updates :scrollToIndex position when :height changes', () => {
      let rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50]}`);
      // Making the list shorter leaves only room for 1 item
      rendered = findDOMNode(
        render(getComponent({scrollToIndex: 50, height: 20}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[50]}`);
    });

    it('updates :scrollToIndex position when :scrollToIndex changes', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      expect(rendered.textContent).not.toContain(`Item #${childrenList[50]}`);
      rendered = findDOMNode(render(getComponent({scrollToIndex: 50}), node));
      expect(rendered.textContent).toContain(`Item #${childrenList[50]}`);
    });

    it('updates scroll position if size shrinks smaller than the current scroll', () => {
      findDOMNode(render(getComponent({scrollToIndex: 500}), node));
      const rendered = findDOMNode(
        render(getComponent({scrollToIndex: 500, itemCount: 10}), node),
      );
      expect(rendered.textContent).toContain(`Item #${childrenList[9]}`);
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

      expect(first.textContent).toContain(`Item #${childrenList[10]}`);
      expect(last.textContent).toContain(`Item #${childrenList[19]}`);
    });

    it('renders correctly when an initial :scrollOffset property is specified', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      let items = rendered.querySelectorAll('.item');
      let first = items[0];
      let last = items[items.length - 1];

      expect(first.textContent).toContain(`Item #${childrenList[0]}`);
      expect(last.textContent).toContain(`Item #${childrenList[9]}`);

      rendered = findDOMNode(render(getComponent({
        scrollOffset: 100,
      }), node));
      items = rendered.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];

      expect(first.textContent).toContain(`Item #${childrenList[10]}`);
      expect(last.textContent).toContain(`Item #${childrenList[19]}`);
    });

    it('updates :scrollOffSet position correctly when items have been changed and scrollOffset property is specified and was not changed', () => {
      let rendered = findDOMNode(render(getComponent(), node));
      let items = rendered.querySelectorAll('.item');
      let first = items[0];
      let last = items[items.length - 1];
      const itemsAddedFirst = ITEM_COUNT / 2;
      const itemsAddedSecond = ITEM_COUNT;
      expect(first.textContent).toContain(`Item #${childrenList[0]}`);
      expect(last.textContent).toContain(`Item #${childrenList[9]}`);

      childrenList = [ ...generateArr(itemsAddedFirst, 'firstAdd'), ...childrenList];
      const listComponent = getComponent({
        scrollOffset: itemsAddedFirst * ITEM_HEIGHT,
      });
      rendered = findDOMNode(render(listComponent, node));
      items = rendered.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];
      expect(first.textContent).toContain(`Item #${childrenList[itemsAddedFirst]}`);
      expect(last.textContent).toContain(`Item #${childrenList[itemsAddedFirst + 9]}`);

      childrenList = [ ...generateArr(itemsAddedSecond, 'secondAdd'), ...childrenList];
      rendered = findDOMNode(render(getComponent({
        scrollOffset: itemsAddedSecond * ITEM_HEIGHT,
      }), node));
      items = rendered.querySelectorAll('.item');
      first = items[0];
      last = items[items.length - 1];
      expect(first.textContent).toContain(`Item #${childrenList[itemsAddedSecond]}`);
      expect(last.textContent).toContain(`Item #${childrenList[itemsAddedSecond + 9]}`);
    });
  });
});
