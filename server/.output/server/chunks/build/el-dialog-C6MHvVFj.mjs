import { a7 as withInstall, j as buildProps, s as definePropType, a1 as useGlobalConfig, c as addUnit, a3 as useLocale, E as ElIcon, C as CloseComponents, G as iconPropType } from './base-C_ywmTr3.mjs';
import { u as useDeprecated } from './el-button-DIpjTHL8.mjs';
import { p as useNamespace, i as isBoolean, x as useZIndex, m as useId, d as debugWarn } from './server.mjs';
import { isObject, isArray, isFunction, NOOP } from '@vue/shared';
import { a as focus_trap_default$1, F as FOCUS_TRAP_INJECTION_KEY } from './index-DX-1AO13.mjs';
import { U as UPDATE_MODEL_EVENT } from './index-DjsCpFrD.mjs';
import { defineComponent, useSlots, computed, ref, provide, openBlock, createBlock, Teleport, createVNode, Transition, mergeProps, unref, withCtx, withDirectives, createElementVNode, normalizeStyle, normalizeClass, createSlots, renderSlot, createCommentVNode, vShow, getCurrentInstance, watch, nextTick, h, inject, createElementBlock, toDisplayString, resolveDynamicComponent } from 'vue';
import { c as composeRefs } from './refs-CxYYXu5Q.mjs';
import { clamp } from 'lodash-unified';
import { useTimeoutFn, isClient } from '@vueuse/core';
import { u as useLockscreen } from './index-DU43QBNU.mjs';

const dialogContentProps = buildProps({
  /**
  * @description whether to align the header and footer in center
  */
  center: Boolean,
  /**
  * @description whether to align the dialog both horizontally and vertically
  */
  alignCenter: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description custom close icon, default is Close
  */
  closeIcon: { type: iconPropType },
  /**
  * @description enable dragging feature for Dialog
  */
  draggable: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description draggable Dialog can overflow the viewport
  */
  overflow: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description whether the Dialog takes up full screen
  */
  fullscreen: Boolean,
  /**
  * @description custom class names for header wrapper
  */
  headerClass: String,
  /**
  * @description custom class names for body wrapper
  */
  bodyClass: String,
  /**
  * @description custom class names for footer wrapper
  */
  footerClass: String,
  /**
  * @description whether to show a close button
  */
  showClose: {
    type: Boolean,
    default: true
  },
  /**
  * @description title of Dialog. Can also be passed with a named slot (see the following table)
  */
  title: {
    type: String,
    default: ""
  },
  /**
  * @description header's aria-level attribute
  */
  ariaLevel: {
    type: String,
    default: "2"
  }
});
const dialogContentEmits = { close: () => true };
const dialogProps = buildProps({
  ...dialogContentProps,
  /**
  * @description whether to append Dialog itself to body. A nested Dialog should have this attribute set to `true`
  */
  appendToBody: Boolean,
  /**
  * @description which element the Dialog appends to
  */
  appendTo: {
    type: definePropType([String, Object]),
    default: "body"
  },
  /**
  * @description callback before Dialog closes, and it will prevent Dialog from closing, use done to close the dialog
  */
  beforeClose: { type: definePropType(Function) },
  /**
  * @description destroy elements in Dialog when closed
  */
  destroyOnClose: Boolean,
  /**
  * @description whether the Dialog can be closed by clicking the mask
  */
  closeOnClickModal: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether the Dialog can be closed by pressing ESC
  */
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether scroll of body is disabled while Dialog is displayed
  */
  lockScroll: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether a mask is displayed
  */
  modal: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether the mask is penetrable
  */
  modalPenetrable: Boolean,
  /**
  * @description the Time(milliseconds) before open
  */
  openDelay: {
    type: Number,
    default: 0
  },
  /**
  * @description the Time(milliseconds) before close
  */
  closeDelay: {
    type: Number,
    default: 0
  },
  /**
  * @description value for `margin-top` of Dialog CSS, default is 15vh
  */
  top: { type: String },
  /**
  * @description visibility of Dialog
  */
  modelValue: Boolean,
  /**
  * @description custom class names for mask
  */
  modalClass: String,
  /**
  * @description custom class names for header wrapper
  */
  headerClass: String,
  /**
  * @description custom class names for body wrapper
  */
  bodyClass: String,
  /**
  * @description custom class names for footer wrapper
  */
  footerClass: String,
  /**
  * @description width of Dialog, default is 50%
  */
  width: { type: [String, Number] },
  /**
  * @description same as z-index in native CSS, z-order of dialog
  */
  zIndex: { type: Number },
  trapFocus: Boolean,
  /**
  * @description header's aria-level attribute
  */
  headerAriaLevel: {
    type: String,
    default: "2"
  },
  /**
  * @description custom transition configuration for dialog animation, it can be a string (transition name) or an object with Vue transition props
  */
  transition: {
    type: definePropType([String, Object]),
    default: void 0
  }
});
const dialogEmits = {
  open: () => true,
  opened: () => true,
  close: () => true,
  closed: () => true,
  [UPDATE_MODEL_EVENT]: (value) => isBoolean(value),
  openAutoFocus: () => true,
  closeAutoFocus: () => true
};
const dialogInjectionKey = /* @__PURE__ */ Symbol("dialogInjectionKey");
const DEFAULT_DIALOG_TRANSITION = "dialog-fade";
const COMPONENT_NAME = "ElDialog";
const useDialog = (props, targetRef) => {
  const emit = getCurrentInstance().emit;
  const { nextZIndex } = useZIndex();
  let lastPosition = "";
  const titleId = useId();
  const bodyId = useId();
  const visible = ref(false);
  const closed = ref(false);
  const rendered = ref(false);
  const zIndex = ref(props.zIndex ?? nextZIndex());
  const closing = ref(false);
  let openTimer = void 0;
  let closeTimer = void 0;
  const config = useGlobalConfig();
  const namespace = computed(() => config.value?.namespace ?? "el");
  const globalConfig = computed(() => config.value?.dialog);
  const style = computed(() => {
    const style2 = {};
    const varPrefix = `--${namespace.value}-dialog`;
    if (!props.fullscreen) {
      if (props.top) style2[`${varPrefix}-margin-top`] = props.top;
      const width = addUnit(props.width);
      if (width) style2[`${varPrefix}-width`] = width;
    }
    return style2;
  });
  const _draggable = computed(() => (props.draggable ?? globalConfig.value?.draggable ?? false) && !props.fullscreen);
  const _alignCenter = computed(() => props.alignCenter ?? globalConfig.value?.alignCenter ?? false);
  const _overflow = computed(() => props.overflow ?? globalConfig.value?.overflow ?? false);
  const penetrable = computed(() => props.modalPenetrable && !props.modal && !props.fullscreen);
  const overlayDialogStyle = computed(() => {
    if (_alignCenter.value) return { display: "flex" };
    return {};
  });
  const transitionConfig = computed(() => {
    const transition = props.transition ?? globalConfig.value?.transition ?? "dialog-fade";
    const baseConfig = {
      name: transition,
      onAfterEnter: afterEnter,
      onBeforeLeave: beforeLeave,
      onAfterLeave: afterLeave
    };
    if (isObject(transition)) {
      const config2 = { ...transition };
      const _mergeHook = (userHook, defaultHook) => {
        return (el) => {
          if (isArray(userHook)) userHook.forEach((fn) => {
            if (isFunction(fn)) fn(el);
          });
          else if (isFunction(userHook)) userHook(el);
          defaultHook();
        };
      };
      config2.onAfterEnter = _mergeHook(config2.onAfterEnter, afterEnter);
      config2.onBeforeLeave = _mergeHook(config2.onBeforeLeave, beforeLeave);
      config2.onAfterLeave = _mergeHook(config2.onAfterLeave, afterLeave);
      if (!config2.name) {
        config2.name = DEFAULT_DIALOG_TRANSITION;
        debugWarn(COMPONENT_NAME, `transition.name is missing when using object syntax, fallback to '${DEFAULT_DIALOG_TRANSITION}'`);
      }
      return config2;
    }
    return baseConfig;
  });
  function afterEnter() {
    emit("opened");
  }
  function afterLeave() {
    emit("closed");
    emit(UPDATE_MODEL_EVENT, false);
    if (props.destroyOnClose) rendered.value = false;
    closing.value = false;
  }
  function beforeLeave() {
    closing.value = true;
    emit("close");
  }
  function open() {
    closeTimer?.();
    openTimer?.();
    if (props.openDelay && props.openDelay > 0) ({ stop: openTimer } = useTimeoutFn(() => doOpen(), props.openDelay));
    else doOpen();
  }
  function close() {
    openTimer?.();
    closeTimer?.();
    if (props.closeDelay && props.closeDelay > 0) ({ stop: closeTimer } = useTimeoutFn(() => doClose(), props.closeDelay));
    else doClose();
  }
  function handleClose() {
    function hide(shouldCancel) {
      if (shouldCancel) return;
      closed.value = true;
      visible.value = false;
    }
    if (props.beforeClose) props.beforeClose(hide);
    else close();
  }
  function onModalClick() {
    if (props.closeOnClickModal) handleClose();
  }
  function doOpen() {
    if (!isClient) return;
    visible.value = true;
  }
  function doClose() {
    visible.value = false;
  }
  function onOpenAutoFocus() {
    emit("openAutoFocus");
  }
  function onCloseAutoFocus() {
    emit("closeAutoFocus");
  }
  function onFocusoutPrevented(event) {
    if (event.detail?.focusReason === "pointer") event.preventDefault();
  }
  if (props.lockScroll) useLockscreen(visible);
  function onCloseRequested() {
    if (props.closeOnPressEscape) handleClose();
  }
  function bringToFront() {
    if (!visible.value || !penetrable.value || props.zIndex !== void 0) return;
    zIndex.value = nextZIndex();
  }
  watch(() => props.zIndex, () => {
    zIndex.value = props.zIndex ?? nextZIndex();
  });
  watch(() => props.modelValue, (val) => {
    if (val) {
      closed.value = false;
      closing.value = false;
      open();
      rendered.value = true;
      zIndex.value = props.zIndex ?? nextZIndex();
      nextTick(() => {
        emit("open");
        if (targetRef.value) {
          targetRef.value.parentElement.scrollTop = 0;
          targetRef.value.parentElement.scrollLeft = 0;
          targetRef.value.scrollTop = 0;
        }
      });
    } else if (visible.value) close();
  });
  watch(() => props.fullscreen, (val) => {
    if (!targetRef.value) return;
    if (val) {
      lastPosition = targetRef.value.style.transform;
      targetRef.value.style.transform = "";
    } else targetRef.value.style.transform = lastPosition;
  });
  return {
    afterEnter,
    afterLeave,
    beforeLeave,
    handleClose,
    onModalClick,
    close,
    doClose,
    onOpenAutoFocus,
    onCloseAutoFocus,
    onCloseRequested,
    onFocusoutPrevented,
    bringToFront,
    titleId,
    bodyId,
    closed,
    style,
    overlayDialogStyle,
    rendered,
    visible,
    zIndex,
    transitionConfig,
    _draggable,
    _alignCenter,
    _overflow,
    closing,
    penetrable
  };
};
const useSameTarget = (handleClick) => {
  if (!handleClick) return {
    onClick: NOOP,
    onMousedown: NOOP,
    onMouseup: NOOP
  };
  let mousedownTarget = false;
  let mouseupTarget = false;
  const onClick = (e) => {
    if (mousedownTarget && mouseupTarget) handleClick(e);
    mousedownTarget = mouseupTarget = false;
  };
  const onMousedown = (e) => {
    mousedownTarget = e.target === e.currentTarget;
  };
  const onMouseup = (e) => {
    mouseupTarget = e.target === e.currentTarget;
  };
  return {
    onClick,
    onMousedown,
    onMouseup
  };
};
const overlayProps = buildProps({
  mask: {
    type: Boolean,
    default: true
  },
  customMaskEvent: Boolean,
  overlayClass: { type: definePropType([
    String,
    Array,
    Object
  ]) },
  zIndex: { type: definePropType([String, Number]) }
});
const overlayEmits = { click: (evt) => evt instanceof MouseEvent };
const BLOCK = "overlay";
var overlay_default = defineComponent({
  name: "ElOverlay",
  props: overlayProps,
  emits: overlayEmits,
  setup(props, { slots, emit }) {
    const ns = useNamespace(BLOCK);
    const onMaskClick = (e) => {
      emit("click", e);
    };
    const { onClick, onMousedown, onMouseup } = useSameTarget(props.customMaskEvent ? void 0 : onMaskClick);
    return () => {
      return props.mask ? createVNode("div", {
        class: [ns.b(), props.overlayClass],
        style: { zIndex: props.zIndex },
        onClick,
        onMousedown,
        onMouseup
      }, [renderSlot(slots, "default")], 14, [
        "onClick",
        "onMouseup",
        "onMousedown"
      ]) : h("div", {
        class: props.overlayClass,
        style: {
          zIndex: props.zIndex,
          position: "fixed",
          top: "0px",
          right: "0px",
          bottom: "0px",
          left: "0px"
        }
      }, [renderSlot(slots, "default")]);
    };
  }
});
const ElOverlay = overlay_default;
const useDraggable = (targetRef, dragRef, draggable, overflow) => {
  const transform = {
    offsetX: 0,
    offsetY: 0
  };
  const isDragging = ref(false);
  const adjustPosition = (moveX, moveY) => {
    if (targetRef.value) {
      const { offsetX, offsetY } = transform;
      const targetRect = targetRef.value.getBoundingClientRect();
      const targetLeft = Math.max(targetRect.left, 0);
      const targetTop = Math.max(targetRect.top, 0);
      const targetWidth = targetRect.width;
      const targetHeight = targetRect.height;
      const clientWidth = (void 0).documentElement.clientWidth;
      const clientHeight = (void 0).documentElement.clientHeight;
      const minLeft = -targetLeft + offsetX;
      const minTop = -targetTop + offsetY;
      const maxLeft = clientWidth - targetLeft - targetWidth + offsetX;
      const maxTop = clientHeight - targetTop - (targetHeight < clientHeight ? targetHeight : 0) + offsetY;
      if (!overflow?.value) {
        moveX = clamp(moveX, minLeft, maxLeft);
        moveY = clamp(moveY, minTop, maxTop);
      }
      transform.offsetX = moveX;
      transform.offsetY = moveY;
      targetRef.value.style.transform = `translate(${addUnit(moveX)}, ${addUnit(moveY)})`;
    }
  };
  const resetPosition = () => {
    transform.offsetX = 0;
    transform.offsetY = 0;
    if (targetRef.value) targetRef.value.style.transform = "";
  };
  const updatePosition = () => {
    const { offsetX, offsetY } = transform;
    adjustPosition(offsetX, offsetY);
  };
  return {
    isDragging,
    resetPosition,
    updatePosition
  };
};
const _hoisted_1$1 = ["aria-level"];
const _hoisted_2 = ["aria-label"];
const _hoisted_3 = ["id"];
var dialog_content_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDialogContent",
  __name: "dialog-content",
  props: dialogContentProps,
  emits: dialogContentEmits,
  setup(__props, { expose: __expose }) {
    const { t } = useLocale();
    const { Close } = CloseComponents;
    const props = __props;
    const { dialogRef, headerRef, bodyId, ns, style } = inject(dialogInjectionKey);
    const { focusTrapRef } = inject(FOCUS_TRAP_INJECTION_KEY);
    const composedDialogRef = composeRefs(focusTrapRef, dialogRef);
    const draggable = computed(() => !!props.draggable);
    const { resetPosition, updatePosition, isDragging } = useDraggable(dialogRef, headerRef, draggable, computed(() => !!props.overflow));
    const dialogKls = computed(() => [
      ns.b(),
      ns.is("fullscreen", props.fullscreen),
      ns.is("draggable", draggable.value),
      ns.is("dragging", isDragging.value),
      ns.is("align-center", !!props.alignCenter),
      { [ns.m("center")]: props.center }
    ]);
    __expose({
      resetPosition,
      updatePosition
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        ref: unref(composedDialogRef),
        class: normalizeClass(dialogKls.value),
        style: normalizeStyle(unref(style)),
        tabindex: "-1"
      }, [
        createElementVNode("header", {
          ref_key: "headerRef",
          ref: headerRef,
          class: normalizeClass([
            unref(ns).e("header"),
            __props.headerClass,
            { "show-close": __props.showClose }
          ])
        }, [renderSlot(_ctx.$slots, "header", {}, () => [createElementVNode("span", {
          role: "heading",
          "aria-level": __props.ariaLevel,
          class: normalizeClass(unref(ns).e("title"))
        }, toDisplayString(__props.title), 11, _hoisted_1$1)]), __props.showClose ? (openBlock(), createElementBlock("button", {
          key: 0,
          "aria-label": unref(t)("el.dialog.close"),
          class: normalizeClass(unref(ns).e("headerbtn")),
          type: "button",
          onClick: _cache[0] || (_cache[0] = ($event) => _ctx.$emit("close"))
        }, [createVNode(unref(ElIcon), { class: normalizeClass(unref(ns).e("close")) }, {
          default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.closeIcon || unref(Close))))]),
          _: 1
        }, 8, ["class"])], 10, _hoisted_2)) : createCommentVNode("v-if", true)], 2),
        createElementVNode("div", {
          id: unref(bodyId),
          class: normalizeClass([unref(ns).e("body"), __props.bodyClass])
        }, [renderSlot(_ctx.$slots, "default")], 10, _hoisted_3),
        _ctx.$slots.footer ? (openBlock(), createElementBlock("footer", {
          key: 0,
          class: normalizeClass([unref(ns).e("footer"), __props.footerClass])
        }, [renderSlot(_ctx.$slots, "footer")], 2)) : createCommentVNode("v-if", true)
      ], 6);
    };
  }
});
var dialog_content_default = dialog_content_vue_vue_type_script_setup_true_lang_default;
const _hoisted_1 = [
  "aria-label",
  "aria-labelledby",
  "aria-describedby"
];
var dialog_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDialog",
  inheritAttrs: false,
  __name: "dialog",
  props: dialogProps,
  emits: dialogEmits,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const slots = useSlots();
    useDeprecated({
      scope: "el-dialog",
      from: "the title slot",
      replacement: "the header slot",
      version: "3.0.0",
      ref: "https://element-plus.org/en-US/component/dialog.html#slots"
    }, computed(() => !!slots.title));
    const ns = useNamespace("dialog");
    const dialogRef = ref();
    const headerRef = ref();
    const dialogContentRef = ref();
    const { visible, titleId, bodyId, style, overlayDialogStyle, rendered, transitionConfig, zIndex, _draggable, _alignCenter, _overflow, penetrable, handleClose, onModalClick, onOpenAutoFocus, onCloseAutoFocus, onCloseRequested, onFocusoutPrevented, bringToFront, closing } = useDialog(props, dialogRef);
    provide(dialogInjectionKey, {
      dialogRef,
      headerRef,
      bodyId,
      ns,
      rendered,
      style
    });
    const overlayEvent = useSameTarget(onModalClick);
    const resetPosition = () => {
      dialogContentRef.value?.resetPosition();
    };
    __expose({
      /** @description whether the dialog is visible */
      visible,
      dialogContentRef,
      resetPosition,
      handleClose
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, {
        to: __props.appendTo,
        disabled: __props.appendTo !== "body" ? false : !__props.appendToBody
      }, [createVNode(Transition, mergeProps(unref(transitionConfig), { persisted: "" }), {
        default: withCtx(() => [withDirectives(createVNode(unref(ElOverlay), {
          "custom-mask-event": "",
          mask: __props.modal,
          "overlay-class": [
            __props.modalClass ?? "",
            `${unref(ns).namespace.value}-modal-dialog`,
            unref(ns).is("penetrable", unref(penetrable))
          ],
          "z-index": unref(zIndex)
        }, {
          default: withCtx(() => [createElementVNode("div", {
            role: "dialog",
            "aria-modal": "true",
            "aria-label": __props.title || void 0,
            "aria-labelledby": !__props.title ? unref(titleId) : void 0,
            "aria-describedby": unref(bodyId),
            class: normalizeClass([`${unref(ns).namespace.value}-overlay-dialog`, unref(ns).is("closing", unref(closing))]),
            style: normalizeStyle(unref(overlayDialogStyle)),
            onClick: _cache[0] || (_cache[0] = (...args) => unref(overlayEvent).onClick && unref(overlayEvent).onClick(...args)),
            onMousedown: _cache[1] || (_cache[1] = (...args) => unref(overlayEvent).onMousedown && unref(overlayEvent).onMousedown(...args)),
            onMouseup: _cache[2] || (_cache[2] = (...args) => unref(overlayEvent).onMouseup && unref(overlayEvent).onMouseup(...args))
          }, [createVNode(unref(focus_trap_default$1), {
            loop: "",
            trapped: unref(visible),
            "focus-start-el": "container",
            onFocusAfterTrapped: unref(onOpenAutoFocus),
            onFocusAfterReleased: unref(onCloseAutoFocus),
            onFocusoutPrevented: unref(onFocusoutPrevented),
            onReleaseRequested: unref(onCloseRequested)
          }, {
            default: withCtx(() => [unref(rendered) ? (openBlock(), createBlock(dialog_content_default, mergeProps({
              key: 0,
              ref_key: "dialogContentRef",
              ref: dialogContentRef
            }, _ctx.$attrs, {
              center: __props.center,
              "align-center": unref(_alignCenter),
              "close-icon": __props.closeIcon,
              draggable: unref(_draggable),
              overflow: unref(_overflow),
              fullscreen: __props.fullscreen,
              "header-class": __props.headerClass,
              "body-class": __props.bodyClass,
              "footer-class": __props.footerClass,
              "show-close": __props.showClose,
              title: __props.title,
              "aria-level": __props.headerAriaLevel,
              onClose: unref(handleClose),
              onMousedown: unref(bringToFront)
            }), createSlots({
              header: withCtx(() => [!_ctx.$slots.title ? renderSlot(_ctx.$slots, "header", {
                key: 0,
                close: unref(handleClose),
                titleId: unref(titleId),
                titleClass: unref(ns).e("title")
              }) : renderSlot(_ctx.$slots, "title", { key: 1 })]),
              default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
              _: 2
            }, [_ctx.$slots.footer ? {
              name: "footer",
              fn: withCtx(() => [renderSlot(_ctx.$slots, "footer")]),
              key: "0"
            } : void 0]), 1040, [
              "center",
              "align-center",
              "close-icon",
              "draggable",
              "overflow",
              "fullscreen",
              "header-class",
              "body-class",
              "footer-class",
              "show-close",
              "title",
              "aria-level",
              "onClose",
              "onMousedown"
            ])) : createCommentVNode("v-if", true)]),
            _: 3
          }, 8, [
            "trapped",
            "onFocusAfterTrapped",
            "onFocusAfterReleased",
            "onFocusoutPrevented",
            "onReleaseRequested"
          ])], 46, _hoisted_1)]),
          _: 3
        }, 8, [
          "mask",
          "overlay-class",
          "z-index"
        ]), [[vShow, unref(visible)]])]),
        _: 3
      }, 16)], 8, ["to", "disabled"]);
    };
  }
});
var dialog_default = dialog_vue_vue_type_script_setup_true_lang_default;
const ElDialog = withInstall(dialog_default);

export { ElDialog as E };
//# sourceMappingURL=el-dialog-C6MHvVFj.mjs.map
