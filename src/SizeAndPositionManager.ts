/* Forked from react-virtualized 💖 */
import {ALIGNMENT} from './constants';

export type ItemSizeGetter = (index: number) => number;
export type ItemSize = number | number[] | ItemSizeGetter;

export interface SizeAndPosition {
  size: number;
  offset: number;
}

interface SizeAndPositionData {
  [id: number]: SizeAndPosition;
}

export interface Options {
  itemSize: ItemSize;
  itemCount: number;
  estimatedItemSize: number;
}

export default class SizeAndPositionManager {
  private itemCount: number;
  private itemSize: ItemSize;
  private lastMeasuredIndex: number;
  private justInTime: boolean;
  private estimatedItemSize: number;
  private totalSize?: number;
  private itemSizeAndPositionData: SizeAndPositionData;

  constructor({itemSize, itemCount, estimatedItemSize}: Options) {
    this.itemSize = itemSize;
    this.itemCount = itemCount;
    this.estimatedItemSize = estimatedItemSize;

    // Cache of size and position data for items, mapped by item index.
    this.itemSizeAndPositionData = {};

    // Measurements for items up to this index can be trusted; items afterward should be estimated.
    this.lastMeasuredIndex = -1;

    this.processConfig();
  }

  updateConfig({itemSize, itemCount, estimatedItemSize}: Partial<Options>) {
    if (itemCount != null) {
      this.itemCount = itemCount;
    }

    if (estimatedItemSize != null) {
      this.estimatedItemSize = estimatedItemSize;
    }

    if (itemSize != null) {
      this.itemSize = itemSize;
    }

    this.processConfig();
  }

  /**
   * This is called when the SizeAndPositionManager is created and updated.
   */
  processConfig() {
    const {itemSize} = this;

    if (typeof itemSize === 'function') {
      this.totalSize = undefined;
      this.justInTime = true;
    } else {
      this.justInTime = false;
      this.computeTotalSizeAndPositionData();
    }
  }

  /**
   * Compute the totalSize and itemSizeAndPositionData at the start,
   * when itemSize is a number or array.
   */
  computeTotalSizeAndPositionData() {
    const {itemSize, itemCount} = this;
    const itemSizeIsArray = Array.isArray(itemSize);
    const itemSizeIsNumber = typeof itemSize === 'number';

    let totalSize = 0;
    for (let i = 0; i < itemCount; i++) {
      let size;
      if (itemSizeIsNumber) {
        size = itemSize;
      } else if (itemSizeIsArray) {
        size = itemSize[i];

        // Break when you are not supplying the same itemCount as available itemSizes.
        if (typeof size === 'undefined') {
          break;
        }
      }

      const offset = totalSize;
      totalSize += size;

      this.itemSizeAndPositionData[i] = {
        offset,
        size,
      };
    }

    this.totalSize = totalSize;
  }

  getLastMeasuredIndex() {
    return this.lastMeasuredIndex;
  }

  /**
   * This method returns the size and position for the item at the specified index.
   */
  getSizeAndPositionForIndex(index: number) {
    if (index < 0 || index >= this.itemCount) {
      throw Error(
        `Requested index ${index} is outside of range 0..${this.itemCount}`,
      );
    }

    if (this.justInTime) {
      return this.getJustInTimeSizeAndPositionForIndex(index);
    }

    return this.itemSizeAndPositionData[index];
  }

  /**
   * This is used when itemSize is a function.
   * just-in-time calculates (or used cached values) for items leading up to the index.
   */
  getJustInTimeSizeAndPositionForIndex(index: number) {
    if (index > this.lastMeasuredIndex) {
      const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
      const itemSizeGetter = this.itemSize as ItemSizeGetter;
      let offset =
        lastMeasuredSizeAndPosition.offset + lastMeasuredSizeAndPosition.size;

      for (let i = this.lastMeasuredIndex + 1; i <= index; i++) {
        const size = itemSizeGetter(i);

        if (size == null || isNaN(size)) {
          throw Error(`Invalid size returned for index ${i} of value ${size}`);
        }

        this.itemSizeAndPositionData[i] = {
          offset,
          size,
        };

        offset += size;
      }

      this.lastMeasuredIndex = index;
    }

    return this.itemSizeAndPositionData[index];
  }

  getSizeAndPositionOfLastMeasuredItem() {
    return this.lastMeasuredIndex >= 0
      ? this.itemSizeAndPositionData[this.lastMeasuredIndex]
      : {offset: 0, size: 0};
  }

  /**
   * Total size of all items being measured.
   */
  getTotalSize(): number {
    /**
     * Return the pre computed totalSize when itemSize is number or array.
     */
    if (this.totalSize) return this.totalSize;

    /**
     * When itemSize is a function,
     * This value will be completedly estimated initially.
     * As items as measured the estimate will be updated.
     */
    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();

    return (
      lastMeasuredSizeAndPosition.offset +
      lastMeasuredSizeAndPosition.size +
      (this.itemCount - this.lastMeasuredIndex - 1) * this.estimatedItemSize
    );
  }

  /**
   * Determines a new offset that ensures a certain item is visible, given the alignment.
   *
   * @param align Desired alignment within container; one of "start" (default), "center", or "end"
   * @param containerSize Size (width or height) of the container viewport
   * @return Offset to use to ensure the specified item is visible
   */
  getUpdatedOffsetForIndex({
    align = ALIGNMENT.START,
    containerSize,
    currentOffset,
    targetIndex,
  }: {
    align: ALIGNMENT | undefined;
    containerSize: number;
    currentOffset: number;
    targetIndex: number;
  }): number {
    if (containerSize <= 0) {
      return 0;
    }

    const datum = this.getSizeAndPositionForIndex(targetIndex);
    const maxOffset = datum.offset;
    const minOffset = maxOffset - containerSize + datum.size;

    let idealOffset;

    switch (align) {
      case ALIGNMENT.END:
        idealOffset = minOffset;
        break;
      case ALIGNMENT.CENTER:
        idealOffset = maxOffset - (containerSize - datum.size) / 2;
        break;
      case ALIGNMENT.START:
        idealOffset = maxOffset;
        break;
      default:
        idealOffset = Math.max(minOffset, Math.min(maxOffset, currentOffset));
    }

    const totalSize = this.getTotalSize();

    return Math.max(0, Math.min(totalSize - containerSize, idealOffset));
  }

  getVisibleRange({
    containerSize,
    offset,
    overscanCount,
  }: {
    containerSize: number;
    offset: number;
    overscanCount: number;
  }): {start?: number; stop?: number} {
    const totalSize = this.getTotalSize();

    if (totalSize === 0) {
      return {};
    }

    const maxOffset = offset + containerSize;
    let start = this.findNearestItem(offset);

    if (typeof start === 'undefined') {
      throw Error(`Invalid offset ${offset} specified`);
    }

    const datum = this.getSizeAndPositionForIndex(start);
    offset = datum.offset + datum.size;

    let stop = start;

    while (offset < maxOffset && stop < this.itemCount - 1) {
      stop++;
      offset += this.getSizeAndPositionForIndex(stop).size;
    }

    if (overscanCount) {
      start = Math.max(0, start - overscanCount);
      stop = Math.min(stop + overscanCount, this.itemCount - 1);
    }

    return {
      start,
      stop,
    };
  }

  /**
   * Clear all cached values for items after the specified index.
   * This method should be called for any item that has changed its size.
   * It will not immediately perform any calculations; they'll be performed the next time getSizeAndPositionForIndex() is called.
   */
  resetItem(index: number) {
    this.lastMeasuredIndex = Math.min(this.lastMeasuredIndex, index - 1);
  }

  /**
   * Searches for the item (index) nearest the specified offset.
   *
   * If no exact match is found the next lowest item index will be returned.
   * This allows partially visible items (with offsets just before/above the fold) to be visible.
   */
  findNearestItem(offset: number) {
    if (isNaN(offset)) {
      throw Error(`Invalid offset ${offset} specified`);
    }

    // Our search algorithms find the nearest match at or below the specified offset.
    // So make sure the offset is at least 0 or no match will be found.
    offset = Math.max(0, offset);

    const lastMeasuredSizeAndPosition = this.getSizeAndPositionOfLastMeasuredItem();
    const lastMeasuredIndex = Math.max(0, this.lastMeasuredIndex);

    if (lastMeasuredSizeAndPosition.offset >= offset) {
      // If we've already measured items within this range just use a binary search as it's faster.
      return this.binarySearch({
        high: lastMeasuredIndex,
        low: 0,
        offset,
      });
    } else {
      // If we haven't yet measured this high, fallback to an exponential search with an inner binary search.
      // The exponential search avoids pre-computing sizes for the full set of items as a binary search would.
      // The overall complexity for this approach is O(log n).
      return this.exponentialSearch({
        index: lastMeasuredIndex,
        offset,
      });
    }
  }

  private binarySearch({
    low,
    high,
    offset,
  }: {
    low: number;
    high: number;
    offset: number;
  }) {
    let middle = 0;
    let currentOffset = 0;

    while (low <= high) {
      middle = low + Math.floor((high - low) / 2);
      currentOffset = this.getSizeAndPositionForIndex(middle).offset;

      if (currentOffset === offset) {
        return middle;
      } else if (currentOffset < offset) {
        low = middle + 1;
      } else if (currentOffset > offset) {
        high = middle - 1;
      }
    }

    if (low > 0) {
      return low - 1;
    }

    return 0;
  }

  private exponentialSearch({index, offset}: {index: number; offset: number}) {
    let interval = 1;

    while (
      index < this.itemCount &&
      this.getSizeAndPositionForIndex(index).offset < offset
    ) {
      index += interval;
      interval *= 2;
    }

    return this.binarySearch({
      high: Math.min(index, this.itemCount - 1),
      low: Math.floor(index / 2),
      offset,
    });
  }
}
