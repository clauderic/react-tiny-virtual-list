import SizeAndPositionManager from '../src/SizeAndPositionManager';
import {ALIGNMENT} from '../src/constants';

const ITEM_SIZE = 10;

describe('SizeAndPositionManager', () => {
  function getItemSizeAndPositionManager({
    itemCount = 100,
    estimatedItemSize = 15,
  } = {}) {
    const itemSizeGetterCalls: number[] = [];
    const sizeAndPositionManager = new SizeAndPositionManager({
      itemCount,
      itemSizeGetter: (index: number) => {
        itemSizeGetterCalls.push(index);
        return 10;
      },
      estimatedItemSize,
    });

    return {
      sizeAndPositionManager,
      itemSizeGetterCalls,
    };
  }

  describe('findNearestItem', () => {
    it('should error if given NaN', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(() => sizeAndPositionManager.findNearestItem(NaN)).toThrow();
    });

    it('should handle offets outisde of bounds (to account for elastic scrolling)', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.findNearestItem(-100)).toEqual(0);
      expect(sizeAndPositionManager.findNearestItem(1234567890)).toEqual(99);
    });

    it('should find the first item', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.findNearestItem(0)).toEqual(0);
      expect(sizeAndPositionManager.findNearestItem(9)).toEqual(0);
    });

    it('should find the last item', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.findNearestItem(990)).toEqual(99);
      expect(sizeAndPositionManager.findNearestItem(991)).toEqual(99);
    });

    it('should find the a item that exactly matches a specified offset in the middle', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.findNearestItem(100)).toEqual(10);
    });

    it('should find the item closest to (but before) the specified offset in the middle', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.findNearestItem(101)).toEqual(10);
    });
  });

  describe('getSizeAndPositionForIndex', () => {
    it('should error if an invalid index is specified', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(() =>
        sizeAndPositionManager.getSizeAndPositionForIndex(-1),
      ).toThrow();
      expect(() =>
        sizeAndPositionManager.getSizeAndPositionForIndex(100),
      ).toThrow();
    });

    it('should returnt he correct size and position information for the requested item', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(
        sizeAndPositionManager.getSizeAndPositionForIndex(0).offset,
      ).toEqual(0);
      expect(sizeAndPositionManager.getSizeAndPositionForIndex(0).size).toEqual(
        10,
      );
      expect(
        sizeAndPositionManager.getSizeAndPositionForIndex(1).offset,
      ).toEqual(10);
      expect(
        sizeAndPositionManager.getSizeAndPositionForIndex(2).offset,
      ).toEqual(20);
    });

    it('should only measure the necessary items to return the information requested', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls,
      } = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(0);
      expect(itemSizeGetterCalls).toEqual([0]);
    });

    it('should just-in-time measure all items up to the requested item if no items have yet been measured', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls,
      } = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      expect(itemSizeGetterCalls).toEqual([0, 1, 2, 3, 4, 5]);
    });

    it('should just-in-time measure items up to the requested item if some but not all items have been measured', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls,
      } = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      itemSizeGetterCalls.splice(0);
      sizeAndPositionManager.getSizeAndPositionForIndex(10);
      expect(itemSizeGetterCalls).toEqual([6, 7, 8, 9, 10]);
    });

    it('should return cached size and position data if item has already been measured', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls,
      } = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      itemSizeGetterCalls.splice(0);
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      expect(itemSizeGetterCalls).toEqual([]);
    });
  });

  describe('getSizeAndPositionOfLastMeasuredItem', () => {
    it('should return an empty object if no cached items are present', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(
        sizeAndPositionManager.getSizeAndPositionOfLastMeasuredItem(),
      ).toEqual({
        offset: 0,
        size: 0,
      });
    });

    it('should return size and position data for the highest/last measured item', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      expect(
        sizeAndPositionManager.getSizeAndPositionOfLastMeasuredItem(),
      ).toEqual({
        offset: 50,
        size: 10,
      });
    });
  });

  describe('getTotalSize', () => {
    it('should calculate total size based purely on :estimatedItemSize if no measurements have been done', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      expect(sizeAndPositionManager.getTotalSize()).toEqual(1500);
    });

    it('should calculate total size based on a mixture of actual item sizes and :estimatedItemSize if some items have been measured', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(49);
      expect(sizeAndPositionManager.getTotalSize()).toEqual(1250);
    });

    it('should calculate total size based on the actual measured sizes if all items have been measured', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(99);
      expect(sizeAndPositionManager.getTotalSize()).toEqual(1000);
    });
  });

  describe('getUpdatedOffsetForIndex', () => {
    function getUpdatedOffsetForIndexHelper({
      align = ALIGNMENT.START,
      itemCount = 10,
      itemSize = ITEM_SIZE,
      containerSize = 50,
      currentOffset = 0,
      estimatedItemSize = 15,
      targetIndex = 0,
    }: {
      align?: ALIGNMENT;
      itemCount?: number;
      itemSize?: number;
      containerSize?: number;
      currentOffset?: number;
      estimatedItemSize?: number;
      targetIndex?: number;
    }) {
      const sizeAndPositionManager = new SizeAndPositionManager({
        itemCount,
        itemSizeGetter: () => itemSize,
        estimatedItemSize,
      });

      return sizeAndPositionManager.getUpdatedOffsetForIndex({
        align,
        containerSize,
        currentOffset,
        targetIndex,
      });
    }

    it('should scroll to the beginning', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          currentOffset: 100,
          targetIndex: 0,
        }),
      ).toEqual(0);
    });

    it('should scroll to the end', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          currentOffset: 0,
          targetIndex: 9,
        }),
      ).toEqual(50);
    });

    it('should scroll forward to the middle', () => {
      const targetIndex = 6;

      expect(
        getUpdatedOffsetForIndexHelper({
          currentOffset: 0,
          targetIndex,
        }),
      ).toEqual(ITEM_SIZE * targetIndex);
    });

    it('should scroll backward to the middle', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          currentOffset: 50,
          targetIndex: 2,
        }),
      ).toEqual(20);
    });

    it('should not scroll if an item is already visible', () => {
      const targetIndex = 3;
      const currentOffset = targetIndex * ITEM_SIZE;

      expect(
        getUpdatedOffsetForIndexHelper({
          currentOffset,
          targetIndex,
        }),
      ).toEqual(currentOffset);
    });

    it('should honor specified :align values', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.START,
          currentOffset: 0,
          targetIndex: 5,
        }),
      ).toEqual(50);
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.END,
          currentOffset: 50,
          targetIndex: 5,
        }),
      ).toEqual(10);
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.CENTER,
          currentOffset: 50,
          targetIndex: 5,
        }),
      ).toEqual(30);
    });

    it('should not scroll past the safe bounds even if the specified :align requests it', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.END,
          currentOffset: 50,
          targetIndex: 0,
        }),
      ).toEqual(0);
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.CENTER,
          currentOffset: 50,
          targetIndex: 1,
        }),
      ).toEqual(0);
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.START,
          currentOffset: 0,
          targetIndex: 9,
        }),
      ).toEqual(50);

      // TRICKY: We would expect this to be positioned at 50.
      // But since the :estimatedItemSize is 15 and we only measure up to the 8th item,
      // The helper assumes it can scroll farther than it actually can.
      // Not sure if this edge case is worth "fixing" or just acknowledging...
      expect(
        getUpdatedOffsetForIndexHelper({
          align: ALIGNMENT.CENTER,
          currentOffset: 0,
          targetIndex: 8,
        }),
      ).toEqual(55);
    });

    it('should always return an offset of 0 when :containerSize is 0', () => {
      expect(
        getUpdatedOffsetForIndexHelper({
          containerSize: 0,
          currentOffset: 50,
          targetIndex: 2,
        }),
      ).toEqual(0);
    });
  });

  describe('getVisibleRange', () => {
    it('should not return any indices if :itemCount is 0', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager({
        itemCount: 0,
      });
      const {start, stop} = sizeAndPositionManager.getVisibleRange({
        containerSize: 50,
        offset: 0,
        overscanCount: 0,
      });
      expect(start).toBeUndefined();
      expect(stop).toBeUndefined();
    });

    it('should return a visible range of items for the beginning of the list', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      const {start, stop} = sizeAndPositionManager.getVisibleRange({
        containerSize: 50,
        offset: 0,
        overscanCount: 0,
      });
      expect(start).toEqual(0);
      expect(stop).toEqual(4);
    });

    it('should return a visible range of items for the middle of the list where some are partially visible', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      const {start, stop} = sizeAndPositionManager.getVisibleRange({
        containerSize: 50,
        offset: 425,
        overscanCount: 0,
      });
      // 42 and 47 are partially visible
      expect(start).toEqual(42);
      expect(stop).toEqual(47);
    });

    it('should return a visible range of items for the end of the list', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      const {start, stop} = sizeAndPositionManager.getVisibleRange({
        containerSize: 50,
        offset: 950,
        overscanCount: 0,
      });
      expect(start).toEqual(95);
      expect(stop).toEqual(99);
    });
  });

  describe('resetItem', () => {
    it('should clear size and position metadata for the specified index and all items after it', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      sizeAndPositionManager.resetItem(3);
      expect(sizeAndPositionManager.getLastMeasuredIndex()).toEqual(2);
      sizeAndPositionManager.resetItem(0);
      expect(sizeAndPositionManager.getLastMeasuredIndex()).toEqual(-1);
    });

    it('should not clear size and position metadata for items before the specified index', () => {
      const {
        sizeAndPositionManager,
        itemSizeGetterCalls,
      } = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      itemSizeGetterCalls.splice(0);
      sizeAndPositionManager.resetItem(3);
      sizeAndPositionManager.getSizeAndPositionForIndex(4);
      expect(itemSizeGetterCalls).toEqual([3, 4]);
    });

    it('should not skip over any unmeasured or previously-cleared items', () => {
      const {sizeAndPositionManager} = getItemSizeAndPositionManager();
      sizeAndPositionManager.getSizeAndPositionForIndex(5);
      sizeAndPositionManager.resetItem(2);
      expect(sizeAndPositionManager.getLastMeasuredIndex()).toEqual(1);
      sizeAndPositionManager.resetItem(4);
      expect(sizeAndPositionManager.getLastMeasuredIndex()).toEqual(1);
      sizeAndPositionManager.resetItem(0);
      expect(sizeAndPositionManager.getLastMeasuredIndex()).toEqual(-1);
    });
  });
});
