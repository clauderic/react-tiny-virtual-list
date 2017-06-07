export const ALIGN_START = 'start';
export const ALIGN_CENTER = 'center';
export const ALIGN_END = 'end';

export const DIRECTION_VERTICAL = 'vertical';
export const DIRECTION_HORIZONTAL = 'horizontal';
export const DEFAULT_SCROLL_DIRECTION = 'ltr';

export const LANGUAGE_DIRECTION_RTL = 'rtl';
export const LANGUAGE_DIRECTION_LTR = 'ltr';

export const SCROLL_CHANGE_OBSERVED = 'observed';
export const SCROLL_CHANGE_REQUESTED = 'requested';

export const SCROLL_IMPLEMENTATION_DEFAULT = 'default';
export const SCROLL_IMPLEMENTATION_REVERSE = 'reverse';
export const SCROLL_IMPLEMENTATION_NEGATIVE = 'negative';

export const scrollProp = {
  [DIRECTION_VERTICAL]: 'scrollTop',
  [DIRECTION_HORIZONTAL]: 'scrollLeft',
};

export const SCROLL_WIDTH = 'scrollWidth';
export const CLIENT_WIDTH = 'clientWidth';

export const sizeProp = {
  [DIRECTION_VERTICAL]: 'height',
  [DIRECTION_HORIZONTAL]: 'width',
};
export const positionProp = {
  [DIRECTION_VERTICAL]: 'top',
  [DIRECTION_HORIZONTAL]: {
    [LANGUAGE_DIRECTION_RTL]: 'right',
    [LANGUAGE_DIRECTION_LTR]: 'left',
  },
};
