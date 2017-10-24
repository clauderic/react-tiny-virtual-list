export type ALIGNMENT = 'auto' | 'center' | 'end' | 'start';
export const ALIGN_AUTO: ALIGNMENT = 'auto';
export const ALIGN_START: ALIGNMENT = 'start';
export const ALIGN_CENTER: ALIGNMENT = 'center';
export const ALIGN_END: ALIGNMENT = 'end';

export type DIRECTION = 'horizontal' | 'vertical';
export const DIRECTION_VERTICAL: DIRECTION = 'vertical';
export const DIRECTION_HORIZONTAL: DIRECTION = 'horizontal';

export type SCROLL_CHANGE_REASON = 'observed' | 'requested';
export const SCROLL_CHANGE_OBSERVED: SCROLL_CHANGE_REASON = 'observed';
export const SCROLL_CHANGE_REQUESTED: SCROLL_CHANGE_REASON = 'requested';

export const scrollProp = {
  [DIRECTION_VERTICAL]: 'scrollTop',
  [DIRECTION_HORIZONTAL]: 'scrollLeft',
};

export const sizeProp = {
  [DIRECTION_VERTICAL]: 'height',
  [DIRECTION_HORIZONTAL]: 'width',
};

export const positionProp = {
  [DIRECTION_VERTICAL]: 'top',
  [DIRECTION_HORIZONTAL]: 'left',
};

export const transformProp = {
  [DIRECTION_VERTICAL]: 'translateY',
  [DIRECTION_HORIZONTAL]: 'translateX',
};
