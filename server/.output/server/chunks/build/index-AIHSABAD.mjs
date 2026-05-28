import { isFunction } from '@vue/shared';

const SCOPE = "_RepeatClick";
const vRepeatClick = {
  beforeMount(el, binding) {
    const value = binding.value;
    const { interval = 100, delay = 600 } = isFunction(value) ? {} : value;
    let intervalId;
    let delayId;
    const handler = () => isFunction(value) ? value() : value.handler();
    const clear = () => {
      if (delayId) {
        clearTimeout(delayId);
        delayId = void 0;
      }
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = void 0;
      }
    };
    const start = (evt) => {
      if (evt.button !== 0) return;
      clear();
      handler();
      (void 0).addEventListener("mouseup", clear, { once: true });
      delayId = setTimeout(() => {
        intervalId = setInterval(() => {
          handler();
        }, interval);
      }, delay);
    };
    el[SCOPE] = {
      start,
      clear
    };
    el.addEventListener("mousedown", start);
  },
  unmounted(el) {
    if (!el[SCOPE]) return;
    const { start, clear } = el[SCOPE];
    if (start) el.removeEventListener("mousedown", start);
    if (clear) {
      clear();
      (void 0).removeEventListener("mouseup", clear);
    }
    el[SCOPE] = null;
  }
};

export { vRepeatClick as v };
//# sourceMappingURL=index-AIHSABAD.mjs.map
