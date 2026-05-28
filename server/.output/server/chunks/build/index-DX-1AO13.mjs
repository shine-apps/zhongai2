import { isArray, NOOP, isObject, isFunction, hasOwn, camelize } from '@vue/shared';
import { isUndefined, isNil, fromPairs } from 'lodash-unified';
import { d as debugWarn, p as useNamespace, m as useId, i as isBoolean, u as useGetDerivedNamespace, o as useIdInjection, c as isNumber, x as useZIndex } from './server.mjs';
import { isVNode, defineComponent, inject, withDirectives, cloneVNode, ref, toRef, computed, provide, unref, readonly, watch, openBlock, createBlock, withCtx, createVNode, renderSlot, createCommentVNode, createElementBlock, toDisplayString, Comment, Fragment, Text, normalizeClass, Teleport, Transition, mergeProps, vShow, normalizeStyle, nextTick, getCurrentInstance, shallowRef } from 'vue';
import { a7 as withInstall, j as buildProps, s as definePropType, v as focusElement, y as formItemContextKey, i as buildProp } from './base-C_ywmTr3.mjs';
import { computedEager, onClickOutside, tryOnScopeDispose, useResizeObserver, isClient, unrefElement } from '@vueuse/core';
import { u as useAriaProps, E as EVENT_CODE, c as composeEventHandlers, g as getEventCode } from './event-YY_EUtOs.mjs';
import { placements, createPopper } from '@popperjs/core';

const extractFirst = (arr) => {
  return isArray(arr) ? arr[0] : arr;
};
const castArray = (arr) => {
  if (!arr && arr !== 0) return [];
  return isArray(arr) ? arr : [arr];
};
var _plugin_vue_export_helper_default = (sfc, props) => {
  const target = sfc.__vccOpts || sfc;
  for (const [key, val] of props) target[key] = val;
  return target;
};
function useTimeout() {
  let timeoutHandle;
  const registerTimeout = (fn, delay) => {
    cancelTimeout();
    timeoutHandle = globalThis.setTimeout(fn, delay);
  };
  const cancelTimeout = () => {
    if (timeoutHandle === void 0) return;
    globalThis.clearTimeout(timeoutHandle);
    timeoutHandle = void 0;
  };
  tryOnScopeDispose(() => cancelTimeout());
  return {
    registerTimeout,
    cancelTimeout
  };
}
const useDelayedToggleProps = buildProps({
  /**
  * @description delay of appearance, in millisecond, not valid in controlled mode
  */
  showAfter: {
    type: Number,
    default: 0
  },
  /**
  * @description delay of disappear, in millisecond, not valid in controlled mode
  */
  hideAfter: {
    type: Number,
    default: 200
  },
  /**
  * @description disappear automatically, in millisecond, not valid in controlled mode
  */
  autoClose: {
    type: Number,
    default: 0
  }
});
const useDelayedToggle = ({ showAfter, hideAfter, autoClose, open, close }) => {
  const { registerTimeout } = useTimeout();
  const { registerTimeout: registerTimeoutForAutoClose, cancelTimeout: cancelTimeoutForAutoClose } = useTimeout();
  const onOpen = (event, delay = unref(showAfter)) => {
    registerTimeout(() => {
      open(event);
      const _autoClose = unref(autoClose);
      if (isNumber(_autoClose) && _autoClose > 0) registerTimeoutForAutoClose(() => {
        close(event);
      }, _autoClose);
    }, delay);
  };
  const onClose = (event, delay = unref(hideAfter)) => {
    cancelTimeoutForAutoClose();
    registerTimeout(() => {
      close(event);
    }, delay);
  };
  return {
    onOpen,
    onClose
  };
};
const popperArrowProps = buildProps({ arrowOffset: {
  type: Number,
  default: 5
} });
const popperCoreConfigProps = buildProps({
  boundariesPadding: {
    type: Number,
    default: 0
  },
  fallbackPlacements: {
    type: definePropType(Array),
    default: void 0
  },
  gpuAcceleration: {
    type: Boolean,
    default: true
  },
  /**
  * @description offset of the Tooltip
  */
  offset: {
    type: Number,
    default: 12
  },
  /**
  * @description position of Tooltip
  */
  placement: {
    type: String,
    values: placements,
    default: "bottom"
  },
  /**
  * @description [popper.js](https://popper.js.org/docs/v2/) parameters
  */
  popperOptions: {
    type: definePropType(Object),
    default: () => ({})
  },
  strategy: {
    type: String,
    values: ["fixed", "absolute"],
    default: "absolute"
  }
});
const popperContentProps = buildProps({
  ...popperCoreConfigProps,
  ...popperArrowProps,
  id: String,
  style: {
    type: definePropType([
      String,
      Array,
      Object,
      Boolean
    ]),
    default: void 0
  },
  className: { type: definePropType([
    String,
    Array,
    Object
  ]) },
  effect: {
    type: definePropType(String),
    default: "dark"
  },
  visible: Boolean,
  enterable: {
    type: Boolean,
    default: true
  },
  pure: Boolean,
  focusOnShow: Boolean,
  trapping: Boolean,
  popperClass: { type: definePropType([
    String,
    Array,
    Object
  ]) },
  popperStyle: {
    type: definePropType([
      String,
      Array,
      Object,
      Boolean
    ]),
    default: void 0
  },
  referenceEl: { type: definePropType(Object) },
  triggerTargetEl: { type: definePropType(Object) },
  stopPopperMouseEvent: {
    type: Boolean,
    default: true
  },
  virtualTriggering: Boolean,
  zIndex: Number,
  ...useAriaProps(["ariaLabel"]),
  loop: Boolean
});
const popperContentEmits = {
  mouseenter: (evt) => evt instanceof MouseEvent,
  mouseleave: (evt) => evt instanceof MouseEvent,
  focus: () => true,
  blur: () => true,
  close: () => true
};
const useTooltipContentProps = buildProps({
  ...useDelayedToggleProps,
  ...popperContentProps,
  /**
  * @description which element the tooltip CONTENT appends to
  */
  appendTo: { type: definePropType([String, Object]) },
  /**
  * @description display content, can be overridden by `slot#content`
  */
  content: {
    type: String,
    default: ""
  },
  /**
  * @description whether `content` is treated as HTML string
  */
  rawContent: Boolean,
  /**
  * @description when tooltip inactive and `persistent` is `false` , popconfirm will be destroyed
  */
  persistent: Boolean,
  /**
  * @description visibility of Tooltip
  */
  visible: {
    type: definePropType(Boolean),
    default: null
  },
  /**
  * @description animation name
  */
  transition: String,
  /**
  * @description whether tooltip content is teleported, if `true` it will be teleported to where `append-to` sets
  */
  teleported: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether Tooltip is disabled
  */
  disabled: Boolean,
  ...useAriaProps(["ariaLabel"])
});
const SCOPE = "utils/vue/vnode";
const getNormalizedProps = (node) => {
  if (!isVNode(node)) {
    debugWarn(SCOPE, "[getNormalizedProps] must be a VNode");
    return {};
  }
  const raw = node.props || {};
  const type = (isVNode(node.type) ? node.type.props : void 0) || {};
  const props = {};
  Object.keys(type).forEach((key) => {
    if (hasOwn(type[key], "default")) props[key] = type[key].default;
  });
  Object.keys(raw).forEach((key) => {
    props[camelize(key)] = raw[key];
  });
  return props;
};
const flattedChildren = (children) => {
  const vNodes = isArray(children) ? children : [children];
  const result = [];
  vNodes.forEach((child) => {
    if (isArray(child)) result.push(...flattedChildren(child));
    else if (isVNode(child) && child.component?.subTree) result.push(child, ...flattedChildren(child.component.subTree));
    else if (isVNode(child) && isArray(child.children)) result.push(...flattedChildren(child.children));
    else if (isVNode(child) && child.shapeFlag === 2) result.push(...flattedChildren(child.type()));
    else result.push(child);
  });
  return result;
};
const popperTriggerProps = buildProps({
  /** @description Indicates the reference element to which the popper is attached */
  virtualRef: { type: definePropType(Object) },
  /** @description Indicates whether virtual triggering is enabled */
  virtualTriggering: Boolean,
  onMouseenter: { type: definePropType(Function) },
  onMouseleave: { type: definePropType(Function) },
  onClick: { type: definePropType(Function) },
  onKeydown: { type: definePropType(Function) },
  onFocus: { type: definePropType(Function) },
  onBlur: { type: definePropType(Function) },
  onContextmenu: { type: definePropType(Function) },
  id: String,
  open: Boolean
});
const useTooltipTriggerProps = buildProps({
  ...popperTriggerProps,
  /**
  * @description whether Tooltip is disabled
  */
  disabled: Boolean,
  /**
  * @description How should the tooltip be triggered (to show), not valid in controlled mode
  */
  trigger: {
    type: definePropType([String, Array]),
    default: "hover"
  },
  /**
  * @description When you click the mouse to focus on the trigger element, you can define a set of keyboard codes to control the display of tooltip through the keyboard, not valid in controlled mode
  */
  triggerKeys: {
    type: definePropType(Array),
    default: () => [
      EVENT_CODE.enter,
      EVENT_CODE.numpadEnter,
      EVENT_CODE.space
    ]
  },
  /**
  * @description when triggering tooltips through hover, whether to focus the trigger element, which improves accessibility
  */
  focusOnTarget: Boolean
});
const _prop = buildProp({
  type: definePropType(Boolean),
  default: null
});
const _event = buildProp({ type: definePropType(Function) });
const createModelToggleComposable = (name) => {
  const updateEventKey = `update:${name}`;
  const updateEventKeyRaw = `onUpdate:${name}`;
  const useModelToggleEmits = [updateEventKey];
  const useModelToggleProps = {
    [name]: _prop,
    [updateEventKeyRaw]: _event
  };
  const useModelToggle = ({ indicator, toggleReason, shouldHideWhenRouteChanges, shouldProceed, onShow, onHide }) => {
    const instance = getCurrentInstance();
    const { emit } = instance;
    const props = instance.props;
    const hasUpdateHandler = computed(() => isFunction(props[updateEventKeyRaw]));
    const isModelBindingAbsent = computed(() => props[name] === null);
    const doShow = (event) => {
      if (indicator.value === true) return;
      indicator.value = true;
      if (toggleReason) toggleReason.value = event;
      if (isFunction(onShow)) onShow(event);
    };
    const doHide = (event) => {
      if (indicator.value === false) return;
      indicator.value = false;
      if (toggleReason) toggleReason.value = event;
      if (isFunction(onHide)) onHide(event);
    };
    const show = (event) => {
      if (props.disabled === true || isFunction(shouldProceed) && !shouldProceed()) return;
      const shouldEmit = hasUpdateHandler.value && isClient;
      if (shouldEmit) emit(updateEventKey, true);
      if (isModelBindingAbsent.value || !shouldEmit) doShow(event);
    };
    const hide = (event) => {
      if (props.disabled === true || !isClient) return;
      const shouldEmit = hasUpdateHandler.value && isClient;
      if (shouldEmit) emit(updateEventKey, false);
      if (isModelBindingAbsent.value || !shouldEmit) doHide(event);
    };
    const onChange = (val) => {
      if (!isBoolean(val)) return;
      if (props.disabled && val) {
        if (hasUpdateHandler.value) emit(updateEventKey, false);
      } else if (indicator.value !== val) if (val) doShow();
      else doHide();
    };
    const toggle = () => {
      if (indicator.value) hide();
      else show();
    };
    watch(() => props[name], onChange);
    if (shouldHideWhenRouteChanges && instance.appContext.config.globalProperties.$route !== void 0) watch(() => ({ ...instance.proxy.$route }), () => {
      if (shouldHideWhenRouteChanges.value && indicator.value) hide();
    });
    return {
      hide,
      show,
      toggle,
      hasUpdateHandler
    };
  };
  return {
    useModelToggle,
    useModelToggleProps,
    useModelToggleEmits
  };
};
const roleTypes = [
  "dialog",
  "grid",
  "group",
  "listbox",
  "menu",
  "navigation",
  "tooltip",
  "tree"
];
const popperProps = buildProps({ role: {
  type: String,
  values: roleTypes,
  default: "tooltip"
} });
const { useModelToggleProps: useTooltipModelToggleProps, useModelToggleEmits: useTooltipModelToggleEmits, useModelToggle: useTooltipModelToggle } = createModelToggleComposable("visible");
const useTooltipProps = buildProps({
  ...popperProps,
  ...useTooltipModelToggleProps,
  ...useTooltipContentProps,
  ...useTooltipTriggerProps,
  ...popperArrowProps,
  /**
  * @description whether the tooltip content has an arrow
  */
  showArrow: {
    type: Boolean,
    default: true
  }
});
const tooltipEmits = [
  ...useTooltipModelToggleEmits,
  "before-show",
  "before-hide",
  "show",
  "hide",
  "open",
  "close"
];
const TOOLTIP_INJECTION_KEY = /* @__PURE__ */ Symbol("elTooltip");
const usePopperContainerId = () => {
  const namespace = useGetDerivedNamespace();
  const idInjection = useIdInjection();
  const id = computed(() => {
    return `${namespace.value}-popper-container-${idInjection.prefix}`;
  });
  return {
    id,
    selector: computed(() => `#${id.value}`)
  };
};
const usePopperContainer = () => {
  const { id, selector } = usePopperContainerId();
  return {
    id,
    selector
  };
};
const POPPER_INJECTION_KEY = /* @__PURE__ */ Symbol("popper");
const POPPER_CONTENT_INJECTION_KEY = /* @__PURE__ */ Symbol("popperContent");
var arrow_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElPopperArrow",
  inheritAttrs: false,
  __name: "arrow",
  setup(__props, { expose: __expose }) {
    const ns = useNamespace("popper");
    const { arrowRef, arrowStyle } = inject(POPPER_CONTENT_INJECTION_KEY, void 0);
    __expose({
      /**
      * @description Arrow element
      */
      arrowRef
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("span", {
        ref_key: "arrowRef",
        ref: arrowRef,
        class: normalizeClass(unref(ns).e("arrow")),
        style: normalizeStyle(unref(arrowStyle)),
        "data-popper-arrow": ""
      }, null, 6);
    };
  }
});
var arrow_default = arrow_vue_vue_type_script_setup_true_lang_default;
var popper_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElPopper",
  inheritAttrs: false,
  __name: "popper",
  props: popperProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const popperProvides = {
      /**
      * @description trigger element
      */
      triggerRef: ref(),
      /**
      * @description popperjs instance
      */
      popperInstanceRef: ref(),
      /**
      * @description popper content element
      */
      contentRef: ref(),
      /**
      * @description popper reference element
      */
      referenceRef: ref(),
      /**
      * @description role determines how aria attributes are distributed
      */
      role: computed(() => props.role)
    };
    __expose(popperProvides);
    provide(POPPER_INJECTION_KEY, popperProvides);
    return (_ctx, _cache) => {
      return renderSlot(_ctx.$slots, "default");
    };
  }
});
var popper_default = popper_vue_vue_type_script_setup_true_lang_default;
const FORWARD_REF_INJECTION_KEY = /* @__PURE__ */ Symbol("elForwardRef");
const useForwardRef = (forwardRef) => {
  const setForwardRef = ((el) => {
    forwardRef.value = el;
  });
  provide(FORWARD_REF_INJECTION_KEY, { setForwardRef });
};
const useForwardRefDirective = (setForwardRef) => {
  return {
    mounted(el) {
      setForwardRef(el);
    },
    updated(el) {
      setForwardRef(el);
    },
    unmounted() {
      setForwardRef(null);
    }
  };
};
const NAME = "ElOnlyChild";
const OnlyChild = /* @__PURE__ */ defineComponent({
  name: NAME,
  setup(_, { slots, attrs }) {
    const forwardRefDirective = useForwardRefDirective(inject(FORWARD_REF_INJECTION_KEY)?.setForwardRef ?? NOOP);
    return () => {
      const defaultSlot = slots.default?.(attrs);
      if (!defaultSlot) return null;
      const [firstLegitNode, length] = findFirstLegitChild(defaultSlot);
      if (!firstLegitNode) {
        debugWarn(NAME, "no valid child node found");
        return null;
      }
      if (length > 1) debugWarn(NAME, "requires exact only one valid child.");
      return withDirectives(cloneVNode(firstLegitNode, attrs), [[forwardRefDirective]]);
    };
  }
});
function findFirstLegitChild(node) {
  if (!node) return [null, 0];
  const children = node;
  const len = children.filter((c) => c.type !== Comment).length;
  for (const child of children) {
    if (isObject(child)) switch (child.type) {
      case Comment:
        continue;
      case Text:
      case "svg":
        return [wrapTextContent(child), len];
      case Fragment:
        return findFirstLegitChild(child.children);
      default:
        return [child, len];
    }
    return [wrapTextContent(child), len];
  }
  return [null, 0];
}
function wrapTextContent(s) {
  return createVNode("span", { "class": useNamespace("only-child").e("content") }, [s]);
}
var trigger_vue_vue_type_script_setup_true_lang_default$1 = /* @__PURE__ */ defineComponent({
  name: "ElPopperTrigger",
  inheritAttrs: false,
  __name: "trigger",
  props: popperTriggerProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const { role, triggerRef } = inject(POPPER_INJECTION_KEY, void 0);
    useForwardRef(triggerRef);
    const ariaControls = computed(() => {
      return ariaHaspopup.value ? props.id : void 0;
    });
    const ariaDescribedby = computed(() => {
      if (role && role.value === "tooltip") return props.open && props.id ? props.id : void 0;
    });
    const ariaHaspopup = computed(() => {
      if (role && role.value !== "tooltip") return role.value;
    });
    const ariaExpanded = computed(() => {
      return ariaHaspopup.value ? `${props.open}` : void 0;
    });
    __expose({
      /**
      * @description trigger element
      */
      triggerRef
    });
    return (_ctx, _cache) => {
      return !__props.virtualTriggering ? (openBlock(), createBlock(unref(OnlyChild), mergeProps({ key: 0 }, _ctx.$attrs, {
        "aria-controls": ariaControls.value,
        "aria-describedby": ariaDescribedby.value,
        "aria-expanded": ariaExpanded.value,
        "aria-haspopup": ariaHaspopup.value
      }), {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 16, [
        "aria-controls",
        "aria-describedby",
        "aria-expanded",
        "aria-haspopup"
      ])) : createCommentVNode("v-if", true);
    };
  }
});
var trigger_default$1 = trigger_vue_vue_type_script_setup_true_lang_default$1;
const FOCUSOUT_PREVENTED = "focus-trap.focusout-prevented";
const FOCUSOUT_PREVENTED_OPTS = {
  cancelable: true,
  bubbles: false
};
const ON_TRAP_FOCUS_EVT = "focusAfterTrapped";
const ON_RELEASE_FOCUS_EVT = "focusAfterReleased";
const FOCUS_TRAP_INJECTION_KEY = /* @__PURE__ */ Symbol("elFocusTrap");
const focusReason = ref();
const lastUserFocusTimestamp = ref(0);
const lastAutomatedFocusTimestamp = ref(0);
const obtainAllFocusableElements = (element) => {
  const nodes = [];
  const walker = (void 0).createTreeWalker(element, NodeFilter.SHOW_ELEMENT, { acceptNode: (node) => {
    const isHiddenInput = node.tagName === "INPUT" && node.type === "hidden";
    if (node.disabled || node.hidden || isHiddenInput) return NodeFilter.FILTER_SKIP;
    return node.tabIndex >= 0 || node === (void 0).activeElement ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_SKIP;
  } });
  while (walker.nextNode()) nodes.push(walker.currentNode);
  return nodes;
};
const getVisibleElement = (elements, container) => {
  for (const element of elements) if (!isHidden(element, container)) return element;
};
const isHidden = (element, container) => {
  if (getComputedStyle(element).visibility === "hidden") return true;
  while (element) {
    if (container && element === container) return false;
    if (getComputedStyle(element).display === "none") return true;
    element = element.parentElement;
  }
  return false;
};
const getEdges = (container) => {
  const focusable = obtainAllFocusableElements(container);
  return [getVisibleElement(focusable, container), getVisibleElement(focusable.reverse(), container)];
};
const isSelectable = (element) => {
  return element instanceof HTMLInputElement && "select" in element;
};
const tryFocus = (element, shouldSelect) => {
  if (element) {
    const prevFocusedElement = (void 0).activeElement;
    focusElement(element, { preventScroll: true });
    lastAutomatedFocusTimestamp.value = (void 0).performance.now();
    if (element !== prevFocusedElement && isSelectable(element) && shouldSelect) element.select();
  }
};
const useFocusReason = () => {
  return {
    focusReason,
    lastUserFocusTimestamp,
    lastAutomatedFocusTimestamp
  };
};
const createFocusOutPreventedEvent = (detail) => {
  return new CustomEvent(FOCUSOUT_PREVENTED, {
    ...FOCUSOUT_PREVENTED_OPTS,
    detail
  });
};
var focus_trap_vue_vue_type_script_lang_default = defineComponent({
  name: "ElFocusTrap",
  inheritAttrs: false,
  props: {
    loop: Boolean,
    trapped: Boolean,
    focusTrapEl: Object,
    focusStartEl: {
      type: [Object, String],
      default: "first"
    }
  },
  emits: [
    ON_TRAP_FOCUS_EVT,
    ON_RELEASE_FOCUS_EVT,
    "focusin",
    "focusout",
    "focusout-prevented",
    "release-requested"
  ],
  setup(props, { emit }) {
    const forwardRef = ref();
    let lastFocusAfterTrapped;
    const { focusReason: focusReason2 } = useFocusReason();
    const onKeydown = (e) => {
      if (!props.loop && !props.trapped) return;
      const { altKey, ctrlKey, metaKey, currentTarget, shiftKey } = e;
      const { loop } = props;
      const isTabbing = getEventCode(e) === EVENT_CODE.tab && !altKey && !ctrlKey && !metaKey;
      const currentFocusingEl = (void 0).activeElement;
      if (isTabbing && currentFocusingEl) {
        const container = currentTarget;
        const [first, last] = getEdges(container);
        if (!(first && last)) {
          if (currentFocusingEl === container) {
            const focusoutPreventedEvent = createFocusOutPreventedEvent({ focusReason: focusReason2.value });
            emit("focusout-prevented", focusoutPreventedEvent);
            if (!focusoutPreventedEvent.defaultPrevented) e.preventDefault();
          }
        } else if (!shiftKey && currentFocusingEl === last) {
          const focusoutPreventedEvent = createFocusOutPreventedEvent({ focusReason: focusReason2.value });
          emit("focusout-prevented", focusoutPreventedEvent);
          if (!focusoutPreventedEvent.defaultPrevented) {
            e.preventDefault();
            if (loop) tryFocus(first, true);
          }
        } else if (shiftKey && [first, container].includes(currentFocusingEl)) {
          const focusoutPreventedEvent = createFocusOutPreventedEvent({ focusReason: focusReason2.value });
          emit("focusout-prevented", focusoutPreventedEvent);
          if (!focusoutPreventedEvent.defaultPrevented) {
            e.preventDefault();
            if (loop) tryFocus(last, true);
          }
        }
      }
    };
    provide(FOCUS_TRAP_INJECTION_KEY, {
      focusTrapRef: forwardRef,
      onKeydown
    });
    watch(() => props.focusTrapEl, (focusTrapEl) => {
      if (focusTrapEl) forwardRef.value = focusTrapEl;
    }, { immediate: true });
    watch([forwardRef], ([forwardRef2], [oldForwardRef]) => {
      if (forwardRef2) {
        forwardRef2.addEventListener("keydown", onKeydown);
        forwardRef2.addEventListener("focusin", onFocusIn);
        forwardRef2.addEventListener("focusout", onFocusOut);
      }
      if (oldForwardRef) {
        oldForwardRef.removeEventListener("keydown", onKeydown);
        oldForwardRef.removeEventListener("focusin", onFocusIn);
        oldForwardRef.removeEventListener("focusout", onFocusOut);
      }
    });
    const onFocusIn = (e) => {
      const trapContainer = unref(forwardRef);
      if (!trapContainer) return;
      const target = e.target;
      const relatedTarget = e.relatedTarget;
      const isFocusedInTrap = target && trapContainer.contains(target);
      if (!props.trapped) {
        if (!(relatedTarget && trapContainer.contains(relatedTarget))) ;
      }
      if (isFocusedInTrap) emit("focusin", e);
      if (props.trapped) if (isFocusedInTrap) lastFocusAfterTrapped = target;
      else tryFocus(lastFocusAfterTrapped, true);
    };
    const onFocusOut = (e) => {
      const trapContainer = unref(forwardRef);
      if (!trapContainer) return;
      if (props.trapped) {
        const relatedTarget = e.relatedTarget;
        if (!isNil(relatedTarget) && !trapContainer.contains(relatedTarget)) setTimeout(() => {
          if (props.trapped) {
            const focusoutPreventedEvent = createFocusOutPreventedEvent({ focusReason: focusReason2.value });
            emit("focusout-prevented", focusoutPreventedEvent);
            if (!focusoutPreventedEvent.defaultPrevented) tryFocus(lastFocusAfterTrapped, true);
          }
        }, 0);
      } else {
        const target = e.target;
        if (!(target && trapContainer.contains(target))) emit("focusout", e);
      }
    };
    return { onKeydown };
  }
});
function _sfc_render(_ctx, _cache, $props, $setup, $data, $options) {
  return renderSlot(_ctx.$slots, "default", { handleKeydown: _ctx.onKeydown });
}
var focus_trap_default = /* @__PURE__ */ _plugin_vue_export_helper_default(focus_trap_vue_vue_type_script_lang_default, [["render", _sfc_render]]);
var focus_trap_default$1 = focus_trap_default;
const usePopper = (referenceElementRef, popperElementRef, opts = {}) => {
  const stateUpdater = {
    name: "updateState",
    enabled: true,
    phase: "write",
    fn: ({ state }) => {
      const derivedState = deriveState(state);
      Object.assign(states.value, derivedState);
    },
    requires: ["computeStyles"]
  };
  const options = computed(() => {
    const { onFirstUpdate, placement, strategy, modifiers } = unref(opts);
    return {
      onFirstUpdate,
      placement: placement || "bottom",
      strategy: strategy || "absolute",
      modifiers: [
        ...modifiers || [],
        stateUpdater,
        {
          name: "applyStyles",
          enabled: false
        }
      ]
    };
  });
  const instanceRef = shallowRef();
  const states = ref({
    styles: {
      popper: {
        position: unref(options).strategy,
        left: "0",
        top: "0"
      },
      arrow: { position: "absolute" }
    },
    attributes: {}
  });
  const destroy = () => {
    if (!instanceRef.value) return;
    instanceRef.value.destroy();
    instanceRef.value = void 0;
  };
  watch(options, (newOptions) => {
    const instance = unref(instanceRef);
    if (instance) instance.setOptions(newOptions);
  }, { deep: true });
  watch([referenceElementRef, popperElementRef], ([referenceElement, popperElement]) => {
    destroy();
    if (!referenceElement || !popperElement) return;
    instanceRef.value = createPopper(referenceElement, popperElement, unref(options));
  });
  return {
    state: computed(() => ({ ...unref(instanceRef)?.state || {} })),
    styles: computed(() => unref(states).styles),
    attributes: computed(() => unref(states).attributes),
    update: () => unref(instanceRef)?.update(),
    forceUpdate: () => unref(instanceRef)?.forceUpdate(),
    instanceRef: computed(() => unref(instanceRef))
  };
};
function deriveState(state) {
  const elements = Object.keys(state.elements);
  return {
    styles: fromPairs(elements.map((element) => [element, state.styles[element] || {}])),
    attributes: fromPairs(elements.map((element) => [element, state.attributes[element]]))
  };
}
const buildPopperOptions = (props, modifiers = []) => {
  const { placement, strategy, popperOptions } = props;
  const options = {
    placement,
    strategy,
    ...popperOptions,
    modifiers: [...genModifiers(props), ...modifiers]
  };
  deriveExtraModifiers(options, popperOptions?.modifiers);
  return options;
};
const unwrapMeasurableEl = ($el) => {
  if (!isClient) return;
  return unrefElement($el);
};
function genModifiers(options) {
  const { offset, gpuAcceleration, fallbackPlacements } = options;
  return [
    {
      name: "offset",
      options: { offset: [0, offset ?? 12] }
    },
    {
      name: "preventOverflow",
      options: { padding: {
        top: 0,
        bottom: 0,
        left: 0,
        right: 0
      } }
    },
    {
      name: "flip",
      options: {
        padding: 5,
        fallbackPlacements
      }
    },
    {
      name: "computeStyles",
      options: { gpuAcceleration }
    }
  ];
}
function deriveExtraModifiers(options, modifiers) {
  if (modifiers) options.modifiers = [...options.modifiers, ...modifiers ?? []];
}
const DEFAULT_ARROW_OFFSET = 0;
const usePopperContent = (props) => {
  const { popperInstanceRef, contentRef, triggerRef, role } = inject(POPPER_INJECTION_KEY, void 0);
  const arrowRef = ref();
  const arrowOffset = computed(() => props.arrowOffset);
  const eventListenerModifier = computed(() => {
    return {
      name: "eventListeners",
      enabled: !!props.visible
    };
  });
  const arrowModifier = computed(() => {
    const arrowEl = unref(arrowRef);
    const offset = unref(arrowOffset) ?? DEFAULT_ARROW_OFFSET;
    return {
      name: "arrow",
      enabled: !isUndefined(arrowEl),
      options: {
        element: arrowEl,
        padding: offset
      }
    };
  });
  const options = computed(() => {
    return {
      onFirstUpdate: () => {
        update();
      },
      ...buildPopperOptions(props, [unref(arrowModifier), unref(eventListenerModifier)])
    };
  });
  const computedReference = computed(() => unwrapMeasurableEl(props.referenceEl) || unref(triggerRef));
  const { attributes, state, styles, update, forceUpdate, instanceRef } = usePopper(computedReference, contentRef, options);
  watch(instanceRef, (instance) => popperInstanceRef.value = instance, { flush: "sync" });
  let stopResizeObserver;
  watch(() => props.visible, (visible) => {
    stopResizeObserver?.();
    stopResizeObserver = void 0;
    if (visible) stopResizeObserver = useResizeObserver(contentRef, update).stop;
  });
  return {
    attributes,
    arrowRef,
    contentRef,
    instanceRef,
    state,
    styles,
    role,
    forceUpdate,
    update
  };
};
const usePopperContentDOM = (props, { attributes, styles, role }) => {
  const { nextZIndex } = useZIndex();
  const ns = useNamespace("popper");
  const contentAttrs = computed(() => unref(attributes).popper);
  const contentZIndex = ref(isNumber(props.zIndex) ? props.zIndex : nextZIndex());
  const contentClass = computed(() => [
    ns.b(),
    ns.is("pure", props.pure),
    ns.is(props.effect),
    props.popperClass
  ]);
  const contentStyle = computed(() => {
    return [
      { zIndex: unref(contentZIndex) },
      unref(styles).popper,
      props.popperStyle || {}
    ];
  });
  const ariaModal = computed(() => role.value === "dialog" ? "false" : void 0);
  const arrowStyle = computed(() => unref(styles).arrow || {});
  const updateZIndex = () => {
    contentZIndex.value = isNumber(props.zIndex) ? props.zIndex : nextZIndex();
  };
  return {
    ariaModal,
    arrowStyle,
    contentAttrs,
    contentClass,
    contentStyle,
    contentZIndex,
    updateZIndex
  };
};
const usePopperContentFocusTrap = (props, emit) => {
  const trapped = ref(false);
  const focusStartRef = ref();
  const onFocusAfterTrapped = () => {
    emit("focus");
  };
  const onFocusAfterReleased = (event) => {
    if (event.detail?.focusReason !== "pointer") {
      focusStartRef.value = "first";
      emit("blur");
    }
  };
  const onFocusInTrap = (event) => {
    if (props.visible && !trapped.value) {
      if (event.target) focusStartRef.value = event.target;
      trapped.value = true;
    }
  };
  const onFocusoutPrevented = (event) => {
    if (!props.trapping) {
      if (event.detail.focusReason === "pointer") event.preventDefault();
      trapped.value = false;
    }
  };
  const onReleaseRequested = () => {
    trapped.value = false;
    emit("close");
  };
  return {
    focusStartRef,
    trapped,
    onFocusAfterReleased,
    onFocusAfterTrapped,
    onFocusInTrap,
    onFocusoutPrevented,
    onReleaseRequested
  };
};
var content_vue_vue_type_script_setup_true_lang_default$1 = /* @__PURE__ */ defineComponent({
  name: "ElPopperContent",
  __name: "content",
  props: popperContentProps,
  emits: popperContentEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const emit = __emit;
    const props = __props;
    const { focusStartRef, trapped, onFocusAfterReleased, onFocusAfterTrapped, onFocusInTrap, onFocusoutPrevented, onReleaseRequested } = usePopperContentFocusTrap(props, emit);
    const { attributes, arrowRef, contentRef, styles, instanceRef, role, update } = usePopperContent(props);
    const { arrowStyle, contentAttrs, contentClass, contentStyle, updateZIndex } = usePopperContentDOM(props, {
      styles,
      attributes,
      role
    });
    const formItemContext = inject(formItemContextKey, void 0);
    provide(POPPER_CONTENT_INJECTION_KEY, {
      arrowStyle,
      arrowRef
    });
    if (formItemContext) provide(formItemContextKey, {
      ...formItemContext,
      addInputId: NOOP,
      removeInputId: NOOP
    });
    const updatePopper = (shouldUpdateZIndex = true) => {
      update();
      shouldUpdateZIndex && updateZIndex();
    };
    __expose({
      /**
      * @description popper content element
      */
      popperContentRef: contentRef,
      /**
      * @description popperjs instance
      */
      popperInstanceRef: instanceRef,
      /**
      * @description method for updating popper
      */
      updatePopper,
      /**
      * @description content style
      */
      contentStyle
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "contentRef",
        ref: contentRef
      }, unref(contentAttrs), {
        style: unref(contentStyle),
        class: unref(contentClass),
        tabindex: "-1",
        onMouseenter: _cache[0] || (_cache[0] = (e) => _ctx.$emit("mouseenter", e)),
        onMouseleave: _cache[1] || (_cache[1] = (e) => _ctx.$emit("mouseleave", e))
      }), [createVNode(unref(focus_trap_default$1), {
        loop: __props.loop,
        trapped: unref(trapped),
        "trap-on-focus-in": true,
        "focus-trap-el": unref(contentRef),
        "focus-start-el": unref(focusStartRef),
        onFocusAfterTrapped: unref(onFocusAfterTrapped),
        onFocusAfterReleased: unref(onFocusAfterReleased),
        onFocusin: unref(onFocusInTrap),
        onFocusoutPrevented: unref(onFocusoutPrevented),
        onReleaseRequested: unref(onReleaseRequested)
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "loop",
        "trapped",
        "focus-trap-el",
        "focus-start-el",
        "onFocusAfterTrapped",
        "onFocusAfterReleased",
        "onFocusin",
        "onFocusoutPrevented",
        "onReleaseRequested"
      ])], 16);
    };
  }
});
var content_default$1 = content_vue_vue_type_script_setup_true_lang_default$1;
const ElPopper = withInstall(popper_default);
const isTriggerType = (trigger, type) => {
  if (isArray(trigger)) return trigger.includes(type);
  return trigger === type;
};
const whenTrigger = (trigger, type, handler) => {
  return (e) => {
    isTriggerType(unref(trigger), type) && handler(e);
  };
};
var trigger_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElTooltipTrigger",
  __name: "trigger",
  props: useTooltipTriggerProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const ns = useNamespace("tooltip");
    const { controlled, id, open, onOpen, onClose, onToggle } = inject(TOOLTIP_INJECTION_KEY, void 0);
    const triggerRef = ref(null);
    const stopWhenControlledOrDisabled = () => {
      if (unref(controlled) || props.disabled) return true;
    };
    const trigger = toRef(props, "trigger");
    const onMouseenter = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "hover", (e) => {
      onOpen(e);
      if (props.focusOnTarget && e.target) nextTick(() => {
        focusElement(e.target, { preventScroll: true });
      });
    }));
    const onMouseleave = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "hover", onClose));
    const onClick = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "click", (e) => {
      if (e.button === 0) onToggle(e);
    }));
    const onFocus = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "focus", onOpen));
    const onBlur = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "focus", onClose));
    const onContextMenu = composeEventHandlers(stopWhenControlledOrDisabled, whenTrigger(trigger, "contextmenu", (e) => {
      e.preventDefault();
      onToggle(e);
    }));
    const onKeydown = composeEventHandlers(stopWhenControlledOrDisabled, (e) => {
      const code = getEventCode(e);
      if (props.triggerKeys.includes(code)) {
        e.preventDefault();
        onToggle(e);
      }
    });
    __expose({
      /**
      * @description trigger element
      */
      triggerRef
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(trigger_default$1), {
        id: unref(id),
        "virtual-ref": __props.virtualRef,
        open: unref(open),
        "virtual-triggering": __props.virtualTriggering,
        class: normalizeClass(unref(ns).e("trigger")),
        onBlur: unref(onBlur),
        onClick: unref(onClick),
        onContextmenu: unref(onContextMenu),
        onFocus: unref(onFocus),
        onMouseenter: unref(onMouseenter),
        onMouseleave: unref(onMouseleave),
        onKeydown: unref(onKeydown)
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, [
        "id",
        "virtual-ref",
        "open",
        "virtual-triggering",
        "class",
        "onBlur",
        "onClick",
        "onContextmenu",
        "onFocus",
        "onMouseenter",
        "onMouseleave",
        "onKeydown"
      ]);
    };
  }
});
var trigger_default = trigger_vue_vue_type_script_setup_true_lang_default;
var content_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElTooltipContent",
  inheritAttrs: false,
  __name: "content",
  props: useTooltipContentProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const { selector } = usePopperContainerId();
    const ns = useNamespace("tooltip");
    const contentRef = ref();
    const popperContentRef = computedEager(() => contentRef.value?.popperContentRef);
    let stopHandle;
    const { controlled, id, open, trigger, onClose, onOpen, onShow, onHide, onBeforeShow, onBeforeHide } = inject(TOOLTIP_INJECTION_KEY, void 0);
    const transitionClass = computed(() => {
      return props.transition || `${ns.namespace.value}-fade-in-linear`;
    });
    const persistentRef = computed(() => {
      return props.persistent;
    });
    const shouldRender = computed(() => {
      return unref(persistentRef) ? true : unref(open);
    });
    const shouldShow = computed(() => {
      return props.disabled ? false : unref(open);
    });
    const appendTo = computed(() => {
      return props.appendTo || selector.value;
    });
    const contentStyle = computed(() => props.style ?? {});
    const ariaHidden = ref(true);
    const onTransitionLeave = () => {
      onHide();
      isFocusInsideContent() && focusElement((void 0).body, { preventScroll: true });
      ariaHidden.value = true;
    };
    const stopWhenControlled = () => {
      if (unref(controlled)) return true;
    };
    const onContentEnter = composeEventHandlers(stopWhenControlled, () => {
      if (props.enterable && isTriggerType(unref(trigger), "hover")) onOpen();
    });
    const onContentLeave = composeEventHandlers(stopWhenControlled, () => {
      if (isTriggerType(unref(trigger), "hover")) onClose();
    });
    const onBeforeEnter = () => {
      contentRef.value?.updatePopper?.();
      onBeforeShow?.();
    };
    const onBeforeLeave = () => {
      onBeforeHide?.();
    };
    const onAfterShow = () => {
      onShow();
    };
    const onBlur = () => {
      if (!props.virtualTriggering) onClose();
    };
    const isFocusInsideContent = (event) => {
      const popperContent = contentRef.value?.popperContentRef;
      const activeElement = event?.relatedTarget || (void 0).activeElement;
      return popperContent?.contains(activeElement);
    };
    watch(() => unref(open), (val) => {
      if (!val) stopHandle?.();
      else {
        ariaHidden.value = false;
        stopHandle = onClickOutside(popperContentRef, () => {
          if (unref(controlled)) return;
          if (castArray(unref(trigger)).every((item) => {
            return item !== "hover" && item !== "focus";
          })) onClose();
        }, { detectIframe: true });
      }
    }, { flush: "post" });
    __expose({
      /**
      * @description el-popper-content component instance
      */
      contentRef,
      /**
      * @description validate current focus event is trigger inside el-popper-content
      */
      isFocusInsideContent
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, {
        disabled: !__props.teleported,
        to: appendTo.value
      }, [shouldRender.value || !ariaHidden.value ? (openBlock(), createBlock(Transition, {
        key: 0,
        name: transitionClass.value,
        appear: !persistentRef.value,
        onAfterLeave: onTransitionLeave,
        onBeforeEnter,
        onAfterEnter: onAfterShow,
        onBeforeLeave,
        persisted: ""
      }, {
        default: withCtx(() => [withDirectives(createVNode(unref(content_default$1), mergeProps({
          id: unref(id),
          ref_key: "contentRef",
          ref: contentRef
        }, _ctx.$attrs, {
          "aria-label": __props.ariaLabel,
          "aria-hidden": ariaHidden.value,
          "boundaries-padding": __props.boundariesPadding,
          "fallback-placements": __props.fallbackPlacements,
          "gpu-acceleration": __props.gpuAcceleration,
          offset: __props.offset,
          placement: __props.placement,
          "popper-options": __props.popperOptions,
          "arrow-offset": __props.arrowOffset,
          strategy: __props.strategy,
          effect: __props.effect,
          enterable: __props.enterable,
          pure: __props.pure,
          "popper-class": __props.popperClass,
          "popper-style": [__props.popperStyle, contentStyle.value],
          "reference-el": __props.referenceEl,
          "trigger-target-el": __props.triggerTargetEl,
          visible: shouldShow.value,
          "z-index": __props.zIndex,
          loop: __props.loop,
          onMouseenter: unref(onContentEnter),
          onMouseleave: unref(onContentLeave),
          onBlur,
          onClose: unref(onClose)
        }), {
          default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
          _: 3
        }, 16, [
          "id",
          "aria-label",
          "aria-hidden",
          "boundaries-padding",
          "fallback-placements",
          "gpu-acceleration",
          "offset",
          "placement",
          "popper-options",
          "arrow-offset",
          "strategy",
          "effect",
          "enterable",
          "pure",
          "popper-class",
          "popper-style",
          "reference-el",
          "trigger-target-el",
          "visible",
          "z-index",
          "loop",
          "onMouseenter",
          "onMouseleave",
          "onClose"
        ]), [[vShow, shouldShow.value]])]),
        _: 3
      }, 8, ["name", "appear"])) : createCommentVNode("v-if", true)], 8, ["disabled", "to"]);
    };
  }
});
var content_default = content_vue_vue_type_script_setup_true_lang_default;
const _hoisted_1 = ["innerHTML"];
const _hoisted_2 = { key: 1 };
var tooltip_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElTooltip",
  __name: "tooltip",
  props: useTooltipProps,
  emits: tooltipEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    usePopperContainer();
    const ns = useNamespace("tooltip");
    const id = useId();
    const popperRef = ref();
    const contentRef = ref();
    const updatePopper = () => {
      const popperComponent = unref(popperRef);
      if (popperComponent) popperComponent.popperInstanceRef?.update();
    };
    const open = ref(false);
    const toggleReason = ref();
    const { show, hide, hasUpdateHandler } = useTooltipModelToggle({
      indicator: open,
      toggleReason
    });
    const { onOpen, onClose } = useDelayedToggle({
      showAfter: toRef(props, "showAfter"),
      hideAfter: toRef(props, "hideAfter"),
      autoClose: toRef(props, "autoClose"),
      open: show,
      close: hide
    });
    const controlled = computed(() => isBoolean(props.visible) && !hasUpdateHandler.value);
    const kls = computed(() => {
      return [ns.b(), props.popperClass];
    });
    provide(TOOLTIP_INJECTION_KEY, {
      controlled,
      id,
      open: readonly(open),
      trigger: toRef(props, "trigger"),
      onOpen,
      onClose,
      onToggle: (event) => {
        if (unref(open)) onClose(event);
        else onOpen(event);
      },
      onShow: () => {
        emit("show", toggleReason.value);
      },
      onHide: () => {
        emit("hide", toggleReason.value);
      },
      onBeforeShow: () => {
        emit("before-show", toggleReason.value);
      },
      onBeforeHide: () => {
        emit("before-hide", toggleReason.value);
      },
      updatePopper
    });
    watch(() => props.disabled, (disabled) => {
      if (disabled && open.value) open.value = false;
      if (!disabled && isBoolean(props.visible)) open.value = props.visible;
    });
    const isFocusInsideContent = (event) => {
      return contentRef.value?.isFocusInsideContent(event);
    };
    __expose({
      /**
      * @description el-popper component instance
      */
      popperRef,
      /**
      * @description el-tooltip-content component instance
      */
      contentRef,
      /**
      * @description validate current focus event is trigger inside el-tooltip-content
      */
      isFocusInsideContent,
      /**
      * @description update el-popper component instance
      */
      updatePopper,
      /**
      * @description expose onOpen function to mange el-tooltip open state
      */
      onOpen,
      /**
      * @description expose onClose function to manage el-tooltip close state
      */
      onClose,
      /**
      * @description expose hide function
      */
      hide
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(unref(ElPopper), {
        ref_key: "popperRef",
        ref: popperRef,
        role: __props.role
      }, {
        default: withCtx(() => [createVNode(trigger_default, {
          disabled: __props.disabled,
          trigger: __props.trigger,
          "trigger-keys": __props.triggerKeys,
          "virtual-ref": __props.virtualRef,
          "virtual-triggering": __props.virtualTriggering,
          "focus-on-target": __props.focusOnTarget
        }, {
          default: withCtx(() => [_ctx.$slots.default ? renderSlot(_ctx.$slots, "default", { key: 0 }) : createCommentVNode("v-if", true)]),
          _: 3
        }, 8, [
          "disabled",
          "trigger",
          "trigger-keys",
          "virtual-ref",
          "virtual-triggering",
          "focus-on-target"
        ]), createVNode(content_default, {
          ref_key: "contentRef",
          ref: contentRef,
          "aria-label": __props.ariaLabel,
          "boundaries-padding": __props.boundariesPadding,
          content: __props.content,
          disabled: __props.disabled,
          effect: __props.effect,
          enterable: __props.enterable,
          "fallback-placements": __props.fallbackPlacements,
          "hide-after": __props.hideAfter,
          "gpu-acceleration": __props.gpuAcceleration,
          offset: __props.offset,
          persistent: __props.persistent,
          "popper-class": kls.value,
          "popper-style": __props.popperStyle,
          placement: __props.placement,
          "popper-options": __props.popperOptions,
          "arrow-offset": __props.arrowOffset,
          pure: __props.pure,
          "raw-content": __props.rawContent,
          "reference-el": __props.referenceEl,
          "trigger-target-el": __props.triggerTargetEl,
          "show-after": __props.showAfter,
          strategy: __props.strategy,
          teleported: __props.teleported,
          transition: __props.transition,
          "virtual-triggering": __props.virtualTriggering,
          "z-index": __props.zIndex,
          "append-to": __props.appendTo,
          loop: __props.loop
        }, {
          default: withCtx(() => [renderSlot(_ctx.$slots, "content", {}, () => [__props.rawContent ? (openBlock(), createElementBlock("span", {
            key: 0,
            innerHTML: __props.content
          }, null, 8, _hoisted_1)) : (openBlock(), createElementBlock("span", _hoisted_2, toDisplayString(__props.content), 1))]), __props.showArrow ? (openBlock(), createBlock(unref(arrow_default), { key: 0 })) : createCommentVNode("v-if", true)]),
          _: 3
        }, 8, [
          "aria-label",
          "boundaries-padding",
          "content",
          "disabled",
          "effect",
          "enterable",
          "fallback-placements",
          "hide-after",
          "gpu-acceleration",
          "offset",
          "persistent",
          "popper-class",
          "popper-style",
          "placement",
          "popper-options",
          "arrow-offset",
          "pure",
          "raw-content",
          "reference-el",
          "trigger-target-el",
          "show-after",
          "strategy",
          "teleported",
          "transition",
          "virtual-triggering",
          "z-index",
          "append-to",
          "loop"
        ])]),
        _: 3
      }, 8, ["role"]);
    };
  }
});
var tooltip_default = tooltip_vue_vue_type_script_setup_true_lang_default;
const ElTooltip = withInstall(tooltip_default);

export { ElTooltip as E, FOCUS_TRAP_INJECTION_KEY as F, OnlyChild as O, _plugin_vue_export_helper_default as _, focus_trap_default$1 as a, useTooltipTriggerProps as b, castArray as c, extractFirst as e, flattedChildren as f, getNormalizedProps as g, roleTypes as r, useTooltipContentProps as u };
//# sourceMappingURL=index-DX-1AO13.mjs.map
