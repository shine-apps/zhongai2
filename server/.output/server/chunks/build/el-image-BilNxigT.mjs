import { a7 as withInstall, a3 as useLocale, j as buildProps, s as definePropType, O as mutable, X as scale_to_original_default, z as full_screen_default, E as ElIcon, n as close_default, e as arrow_left_default, f as arrow_right_default, ab as zoom_out_default, aa as zoom_in_default, S as refresh_left_default, U as refresh_right_default, J as keysOf } from './base-C_ywmTr3.mjs';
import { isClient, useThrottleFn, useIntersectionObserver, clamp, useEventListener } from '@vueuse/core';
import { p as useNamespace, c as isNumber, a as isElement, j as isWindow, x as useZIndex } from './server.mjs';
import { b as getScrollContainer } from './el-select-Bnkp58fp.mjs';
import { e as useAttrs$1 } from './index-DjsCpFrD.mjs';
import { u as useLockscreen } from './index-DU43QBNU.mjs';
import { a as focus_trap_default$1 } from './index-DX-1AO13.mjs';
import { fromPairs, throttle } from 'lodash-unified';
import { defineComponent, useAttrs, computed, ref, watch, openBlock, createElementBlock, mergeProps, unref, renderSlot, createElementVNode, normalizeClass, toDisplayString, Fragment, createCommentVNode, createBlock, createSlots, withCtx, normalizeProps, guardReactiveProps, nextTick, markRaw, effectScope, shallowRef, Teleport, createVNode, Transition, normalizeStyle, withModifiers, createTextVNode, resolveDynamicComponent } from 'vue';
import { isArray, isString } from '@vue/shared';

const imageProps = buildProps({
  /**
  * @description when enabling preview, use this flag to control whether clicking on backdrop can exit preview mode.
  */
  hideOnClickModal: Boolean,
  /**
  * @description image source, same as native.
  */
  src: {
    type: String,
    default: ""
  },
  /**
  * @description indicate how the image should be resized to fit its container, same as [object-fit](https://developer.mozilla.org/en-US/docs/Web/CSS/object-fit).
  */
  fit: {
    type: String,
    values: [
      "",
      "contain",
      "cover",
      "fill",
      "none",
      "scale-down"
    ],
    default: ""
  },
  /**
  * @description Indicates how the browser should load the image, same as [native](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/img#loading)
  */
  loading: {
    type: String,
    values: ["eager", "lazy"]
  },
  /**
  * @description whether to use lazy load.
  */
  lazy: Boolean,
  /**
  * @description the container to add scroll listener when using lazy load.
  */
  scrollContainer: { type: definePropType([String, Object]) },
  /**
  * @description allow big image preview.
  */
  previewSrcList: {
    type: definePropType(Array),
    default: () => mutable([])
  },
  /**
  * @description whether to append image-viewer to body. A nested parent element attribute transform should have this attribute set to `true`.
  */
  previewTeleported: Boolean,
  /**
  * @description set image preview z-index.
  */
  zIndex: { type: Number },
  /**
  * @description initial preview image index, less than the length of `url-list`.
  */
  initialIndex: {
    type: Number,
    default: 0
  },
  /**
  * @description whether the viewer preview is infinite.
  */
  infinite: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether the image-viewer can be closed by pressing ESC.
  */
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  /**
  * @description the zoom rate of the image viewer zoom event
  */
  zoomRate: {
    type: Number,
    default: 1.2
  },
  /**
  * @description preview image scale.
  */
  scale: {
    type: Number,
    default: 1
  },
  /**
  * @description the min scale of the image viewer zoom event.
  */
  minScale: {
    type: Number,
    default: 0.2
  },
  /**
  * @description the max scale of the image viewer zoom event.
  */
  maxScale: {
    type: Number,
    default: 7
  },
  /**
  * @description show preview image progress content.
  */
  showProgress: Boolean,
  /**
  * @description set HTML attribute: crossorigin.
  */
  crossorigin: { type: definePropType(String) }
});
const imageEmits = {
  load: (evt) => evt instanceof Event,
  error: (evt) => evt instanceof Event,
  switch: (val) => isNumber(val),
  close: () => true,
  show: () => true
};
const imageViewerProps = buildProps({
  /**
  * @description preview link list.
  */
  urlList: {
    type: definePropType(Array),
    default: () => mutable([])
  },
  /**
  * @description preview backdrop z-index.
  */
  zIndex: { type: Number },
  /**
  * @description the initial preview image index, less than or equal to the length of `url-list`.
  */
  initialIndex: {
    type: Number,
    default: 0
  },
  /**
  * @description whether preview is infinite.
  */
  infinite: {
    type: Boolean,
    default: true
  },
  /**
  * @description whether user can emit close event when clicking backdrop.
  */
  hideOnClickModal: Boolean,
  /**
  * @description whether to append image itself to body. A nested parent element attribute transform should have this attribute set to `true`.
  */
  teleported: Boolean,
  /**
  * @description whether the image-viewer can be closed by pressing ESC.
  */
  closeOnPressEscape: {
    type: Boolean,
    default: true
  },
  /**
  * @description the zoom rate of the image viewer zoom event.
  */
  zoomRate: {
    type: Number,
    default: 1.2
  },
  /**
  * @description preview image scale.
  */
  scale: {
    type: Number,
    default: 1
  },
  /**
  * @description the min scale of the image viewer zoom event.
  */
  minScale: {
    type: Number,
    default: 0.2
  },
  /**
  * @description the max scale of the image viewer zoom event.
  */
  maxScale: {
    type: Number,
    default: 7
  },
  /**
  * @description show preview image progress content.
  */
  showProgress: Boolean,
  /**
  * @description set HTML attribute: crossorigin.
  */
  crossorigin: { type: definePropType(String) }
});
const imageViewerEmits = {
  close: () => true,
  error: (evt) => evt instanceof Event,
  switch: (index) => isNumber(index),
  rotate: (deg) => isNumber(deg)
};
const _hoisted_1$1 = ["src", "crossorigin"];
var image_viewer_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElImageViewer",
  __name: "image-viewer",
  props: imageViewerProps,
  emits: imageViewerEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const modes = {
      CONTAIN: {
        name: "contain",
        icon: markRaw(full_screen_default)
      },
      ORIGINAL: {
        name: "original",
        icon: markRaw(scale_to_original_default)
      }
    };
    const props = __props;
    const emit = __emit;
    const { t } = useLocale();
    const ns = useNamespace("image-viewer");
    const { nextZIndex } = useZIndex();
    const wrapper = ref();
    const imgRef = ref();
    const scopeEventListener = effectScope();
    const scaleClamped = computed(() => {
      const { scale, minScale, maxScale } = props;
      return clamp(scale, minScale, maxScale);
    });
    const loading = ref(true);
    const loadError = ref(false);
    const visible = ref(false);
    const activeIndex = ref(props.initialIndex);
    const mode = shallowRef(modes.CONTAIN);
    const transform = ref({
      scale: scaleClamped.value,
      deg: 0,
      offsetX: 0,
      offsetY: 0,
      enableTransition: false
    });
    const zIndex = ref(props.zIndex ?? nextZIndex());
    useLockscreen(visible, { ns });
    const isSingle = computed(() => {
      const { urlList } = props;
      return urlList.length <= 1;
    });
    const isFirst = computed(() => activeIndex.value === 0);
    const isLast = computed(() => activeIndex.value === props.urlList.length - 1);
    const currentImg = computed(() => props.urlList[activeIndex.value]);
    const arrowPrevKls = computed(() => [
      ns.e("btn"),
      ns.e("prev"),
      ns.is("disabled", !props.infinite && isFirst.value)
    ]);
    const arrowNextKls = computed(() => [
      ns.e("btn"),
      ns.e("next"),
      ns.is("disabled", !props.infinite && isLast.value)
    ]);
    const imgStyle = computed(() => {
      const { scale, deg, offsetX, offsetY, enableTransition } = transform.value;
      let translateX = offsetX / scale;
      let translateY = offsetY / scale;
      const radian = deg * Math.PI / 180;
      const cosRadian = Math.cos(radian);
      const sinRadian = Math.sin(radian);
      translateX = translateX * cosRadian + translateY * sinRadian;
      translateY = translateY * cosRadian - offsetX / scale * sinRadian;
      const style = {
        transform: `scale(${scale}) rotate(${deg}deg) translate(${translateX}px, ${translateY}px)`,
        transition: enableTransition ? "transform .3s" : ""
      };
      if (mode.value.name === modes.CONTAIN.name) style.maxWidth = style.maxHeight = "100%";
      return style;
    });
    const progress = computed(() => `${activeIndex.value + 1} / ${props.urlList.length}`);
    function hide() {
      unregisterEventListener();
      visible.value = false;
      emit("close");
    }
    function unregisterEventListener() {
      scopeEventListener.stop();
    }
    function handleImgLoad() {
      loading.value = false;
    }
    function handleImgError(e) {
      loadError.value = true;
      loading.value = false;
      emit("error", e);
      e.target.alt = t("el.image.error");
    }
    function handleMouseDown(e) {
      if (loading.value || e.button !== 0 || !wrapper.value) return;
      transform.value.enableTransition = false;
      const { offsetX, offsetY } = transform.value;
      const startX = e.pageX;
      const startY = e.pageY;
      const dragHandler = throttle((ev) => {
        transform.value = {
          ...transform.value,
          offsetX: offsetX + ev.pageX - startX,
          offsetY: offsetY + ev.pageY - startY
        };
      });
      const removeMousemove = useEventListener(void 0, "mousemove", dragHandler);
      const removeMouseup = useEventListener(void 0, "mouseup", () => {
        removeMousemove();
        removeMouseup();
      });
      e.preventDefault();
    }
    function handleTouchStart(e) {
      if (loading.value || !wrapper.value || e.touches.length !== 1) return;
      transform.value.enableTransition = false;
      const { offsetX, offsetY } = transform.value;
      const { pageX: startX, pageY: startY } = e.touches[0];
      const dragHandler = throttle((ev) => {
        const targetTouch = ev.touches[0];
        transform.value = {
          ...transform.value,
          offsetX: offsetX + targetTouch.pageX - startX,
          offsetY: offsetY + targetTouch.pageY - startY
        };
      });
      const removeTouchmove = useEventListener(void 0, "touchmove", dragHandler);
      const removeTouchend = useEventListener(void 0, "touchend", () => {
        removeTouchmove();
        removeTouchend();
      });
      e.preventDefault();
    }
    function reset() {
      transform.value = {
        scale: scaleClamped.value,
        deg: 0,
        offsetX: 0,
        offsetY: 0,
        enableTransition: false
      };
    }
    function toggleMode() {
      if (loading.value || loadError.value) return;
      const modeNames = keysOf(modes);
      const modeValues = Object.values(modes);
      const currentMode = mode.value.name;
      mode.value = modes[modeNames[(modeValues.findIndex((i) => i.name === currentMode) + 1) % modeNames.length]];
      reset();
    }
    function setActiveItem(index) {
      loadError.value = false;
      const len = props.urlList.length;
      activeIndex.value = (index + len) % len;
    }
    function prev() {
      if (isFirst.value && !props.infinite) return;
      setActiveItem(activeIndex.value - 1);
    }
    function next() {
      if (isLast.value && !props.infinite) return;
      setActiveItem(activeIndex.value + 1);
    }
    function handleActions(action, options = {}) {
      if (loading.value || loadError.value) return;
      const { minScale, maxScale } = props;
      const { zoomRate, rotateDeg, enableTransition } = {
        zoomRate: props.zoomRate,
        rotateDeg: 90,
        enableTransition: true,
        ...options
      };
      switch (action) {
        case "zoomOut":
          if (transform.value.scale > minScale) transform.value.scale = Number.parseFloat((transform.value.scale / zoomRate).toFixed(3));
          break;
        case "zoomIn":
          if (transform.value.scale < maxScale) transform.value.scale = Number.parseFloat((transform.value.scale * zoomRate).toFixed(3));
          break;
        case "clockwise":
          transform.value.deg += rotateDeg;
          emit("rotate", transform.value.deg);
          break;
        case "anticlockwise":
          transform.value.deg -= rotateDeg;
          emit("rotate", transform.value.deg);
          break;
      }
      transform.value.enableTransition = enableTransition;
    }
    function onFocusoutPrevented(event) {
      if (event.detail?.focusReason === "pointer") event.preventDefault();
    }
    function onCloseRequested() {
      if (props.closeOnPressEscape) hide();
    }
    watch(() => scaleClamped.value, (val) => {
      transform.value.scale = val;
    });
    watch(currentImg, () => {
      nextTick(() => {
        if (!imgRef.value?.complete) loading.value = true;
      });
    });
    watch(activeIndex, (val) => {
      reset();
      emit("switch", val);
    });
    __expose({
      /**
      * @description manually switch image
      */
      setActiveItem
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(Teleport, {
        to: "body",
        disabled: !__props.teleported
      }, [createVNode(Transition, {
        name: "viewer-fade",
        appear: ""
      }, {
        default: withCtx(() => [createElementVNode("div", {
          ref_key: "wrapper",
          ref: wrapper,
          tabindex: -1,
          class: normalizeClass(unref(ns).e("wrapper")),
          style: normalizeStyle({ zIndex: zIndex.value })
        }, [createVNode(unref(focus_trap_default$1), {
          loop: "",
          trapped: "",
          "focus-trap-el": wrapper.value,
          "focus-start-el": "container",
          onFocusoutPrevented,
          onReleaseRequested: onCloseRequested
        }, {
          default: withCtx(() => [
            createElementVNode("div", {
              class: normalizeClass(unref(ns).e("mask")),
              onClick: _cache[0] || (_cache[0] = withModifiers(($event) => __props.hideOnClickModal && hide(), ["self"]))
            }, null, 2),
            createCommentVNode(" CLOSE "),
            createElementVNode("span", {
              class: normalizeClass([unref(ns).e("btn"), unref(ns).e("close")]),
              onClick: hide
            }, [createVNode(unref(ElIcon), null, {
              default: withCtx(() => [createVNode(unref(close_default))]),
              _: 1
            })], 2),
            createCommentVNode(" ARROW "),
            !isSingle.value ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createElementVNode("span", {
              class: normalizeClass(arrowPrevKls.value),
              onClick: prev
            }, [createVNode(unref(ElIcon), null, {
              default: withCtx(() => [createVNode(unref(arrow_left_default))]),
              _: 1
            })], 2), createElementVNode("span", {
              class: normalizeClass(arrowNextKls.value),
              onClick: next
            }, [createVNode(unref(ElIcon), null, {
              default: withCtx(() => [createVNode(unref(arrow_right_default))]),
              _: 1
            })], 2)], 64)) : createCommentVNode("v-if", true),
            _ctx.$slots.progress || __props.showProgress ? (openBlock(), createElementBlock("div", {
              key: 1,
              class: normalizeClass([unref(ns).e("btn"), unref(ns).e("progress")])
            }, [renderSlot(_ctx.$slots, "progress", {
              activeIndex: activeIndex.value,
              total: __props.urlList.length
            }, () => [createTextVNode(toDisplayString(progress.value), 1)])], 2)) : createCommentVNode("v-if", true),
            createCommentVNode(" ACTIONS "),
            createElementVNode("div", { class: normalizeClass([unref(ns).e("btn"), unref(ns).e("actions")]) }, [createElementVNode("div", { class: normalizeClass(unref(ns).e("actions__inner")) }, [renderSlot(_ctx.$slots, "toolbar", {
              actions: handleActions,
              prev,
              next,
              reset: toggleMode,
              activeIndex: activeIndex.value,
              setActiveItem
            }, () => [
              createVNode(unref(ElIcon), { onClick: _cache[1] || (_cache[1] = ($event) => handleActions("zoomOut")) }, {
                default: withCtx(() => [createVNode(unref(zoom_out_default))]),
                _: 1
              }),
              createVNode(unref(ElIcon), { onClick: _cache[2] || (_cache[2] = ($event) => handleActions("zoomIn")) }, {
                default: withCtx(() => [createVNode(unref(zoom_in_default))]),
                _: 1
              }),
              createElementVNode("i", { class: normalizeClass(unref(ns).e("actions__divider")) }, null, 2),
              createVNode(unref(ElIcon), { onClick: toggleMode }, {
                default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(mode.value.icon)))]),
                _: 1
              }),
              createElementVNode("i", { class: normalizeClass(unref(ns).e("actions__divider")) }, null, 2),
              createVNode(unref(ElIcon), { onClick: _cache[3] || (_cache[3] = ($event) => handleActions("anticlockwise")) }, {
                default: withCtx(() => [createVNode(unref(refresh_left_default))]),
                _: 1
              }),
              createVNode(unref(ElIcon), { onClick: _cache[4] || (_cache[4] = ($event) => handleActions("clockwise")) }, {
                default: withCtx(() => [createVNode(unref(refresh_right_default))]),
                _: 1
              })
            ])], 2)], 2),
            createCommentVNode(" CANVAS "),
            createElementVNode("div", { class: normalizeClass(unref(ns).e("canvas")) }, [loadError.value && _ctx.$slots["viewer-error"] ? renderSlot(_ctx.$slots, "viewer-error", {
              key: 0,
              activeIndex: activeIndex.value,
              src: currentImg.value
            }) : (openBlock(), createElementBlock("img", {
              ref_key: "imgRef",
              ref: imgRef,
              key: currentImg.value,
              src: currentImg.value,
              style: normalizeStyle(imgStyle.value),
              class: normalizeClass(unref(ns).e("img")),
              crossorigin: __props.crossorigin,
              onLoad: handleImgLoad,
              onError: handleImgError,
              onMousedown: handleMouseDown,
              onTouchstart: handleTouchStart
            }, null, 46, _hoisted_1$1))], 2),
            renderSlot(_ctx.$slots, "default")
          ]),
          _: 3
        }, 8, ["focus-trap-el"])], 6)]),
        _: 3
      })], 8, ["disabled"]);
    };
  }
});
var image_viewer_default = image_viewer_vue_vue_type_script_setup_true_lang_default;
const ElImageViewer = withInstall(image_viewer_default);
const _hoisted_1 = [
  "src",
  "loading",
  "crossorigin"
];
const _hoisted_2 = { key: 0 };
var image_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElImage",
  inheritAttrs: false,
  __name: "image",
  props: imageProps,
  emits: imageEmits,
  setup(__props, { expose: __expose, emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const { t } = useLocale();
    const ns = useNamespace("image");
    const rawAttrs = useAttrs();
    const containerAttrs = computed(() => {
      return fromPairs(Object.entries(rawAttrs).filter(([key]) => /^(data-|on[A-Z])/i.test(key) || ["id", "style"].includes(key)));
    });
    const imgAttrs = useAttrs$1({
      excludeListeners: true,
      excludeKeys: computed(() => {
        return Object.keys(containerAttrs.value);
      })
    });
    const imageSrc = ref();
    const hasLoadError = ref(false);
    const isLoading = ref(true);
    const showViewer = ref(false);
    const container = ref();
    const _scrollContainer = ref();
    const supportLoading = isClient && "loading" in HTMLImageElement.prototype;
    let stopScrollListener;
    const imageKls = computed(() => [
      ns.e("inner"),
      preview.value && ns.e("preview"),
      isLoading.value && ns.is("loading")
    ]);
    const imageStyle = computed(() => {
      const { fit } = props;
      if (isClient && fit) return { objectFit: fit };
      return {};
    });
    const preview = computed(() => {
      const { previewSrcList } = props;
      return isArray(previewSrcList) && previewSrcList.length > 0;
    });
    const imageIndex = computed(() => {
      const { previewSrcList, initialIndex } = props;
      let previewIndex = initialIndex;
      if (initialIndex > previewSrcList.length - 1) previewIndex = 0;
      return previewIndex;
    });
    const isManual = computed(() => {
      if (props.loading === "eager") return false;
      return !supportLoading && props.loading === "lazy" || props.lazy;
    });
    const loadImage = () => {
      if (!isClient) return;
      isLoading.value = true;
      hasLoadError.value = false;
      imageSrc.value = props.src;
    };
    function handleLoad(event) {
      isLoading.value = false;
      hasLoadError.value = false;
      emit("load", event);
    }
    function handleError(event) {
      isLoading.value = false;
      hasLoadError.value = true;
      emit("error", event);
    }
    function handleLazyLoad(isIntersecting) {
      if (isIntersecting) {
        loadImage();
        removeLazyLoadListener();
      }
    }
    const lazyLoadHandler = useThrottleFn(handleLazyLoad, 200, true);
    async function addLazyLoadListener() {
      if (!isClient) return;
      await nextTick();
      const { scrollContainer } = props;
      if (isElement(scrollContainer)) _scrollContainer.value = scrollContainer;
      else if (isString(scrollContainer) && scrollContainer !== "") _scrollContainer.value = (void 0).querySelector(scrollContainer) ?? void 0;
      else if (container.value) {
        const scrollContainer2 = getScrollContainer(container.value);
        _scrollContainer.value = isWindow(scrollContainer2) ? void 0 : scrollContainer2;
      }
      const { stop } = useIntersectionObserver(container, ([entry]) => {
        lazyLoadHandler(entry.isIntersecting);
      }, { root: _scrollContainer });
      stopScrollListener = stop;
    }
    function removeLazyLoadListener() {
      if (!isClient || !lazyLoadHandler) return;
      stopScrollListener?.();
      _scrollContainer.value = void 0;
      stopScrollListener = void 0;
    }
    function clickHandler() {
      if (!preview.value) return;
      showViewer.value = true;
      emit("show");
    }
    function closeViewer() {
      showViewer.value = false;
      emit("close");
    }
    function switchViewer(val) {
      emit("switch", val);
    }
    watch(() => props.src, () => {
      if (isManual.value) {
        isLoading.value = true;
        hasLoadError.value = false;
        removeLazyLoadListener();
        addLazyLoadListener();
      } else loadImage();
    });
    __expose({
      /** @description manually open preview */
      showPreview: clickHandler
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", mergeProps({
        ref_key: "container",
        ref: container
      }, containerAttrs.value, { class: [unref(ns).b(), _ctx.$attrs.class] }), [hasLoadError.value ? renderSlot(_ctx.$slots, "error", { key: 0 }, () => [createElementVNode("div", { class: normalizeClass(unref(ns).e("error")) }, toDisplayString(unref(t)("el.image.error")), 3)]) : (openBlock(), createElementBlock(Fragment, { key: 1 }, [imageSrc.value !== void 0 ? (openBlock(), createElementBlock("img", mergeProps({ key: 0 }, unref(imgAttrs), {
        src: imageSrc.value,
        loading: __props.loading,
        style: imageStyle.value,
        class: imageKls.value,
        crossorigin: __props.crossorigin,
        onClick: clickHandler,
        onLoad: handleLoad,
        onError: handleError
      }), null, 16, _hoisted_1)) : createCommentVNode("v-if", true), isLoading.value ? (openBlock(), createElementBlock("div", {
        key: 1,
        class: normalizeClass(unref(ns).e("wrapper"))
      }, [renderSlot(_ctx.$slots, "placeholder", {}, () => [createElementVNode("div", { class: normalizeClass(unref(ns).e("placeholder")) }, null, 2)])], 2)) : createCommentVNode("v-if", true)], 64)), preview.value ? (openBlock(), createElementBlock(Fragment, { key: 2 }, [showViewer.value ? (openBlock(), createBlock(unref(ElImageViewer), {
        key: 0,
        "z-index": __props.zIndex,
        "initial-index": imageIndex.value,
        infinite: __props.infinite,
        "zoom-rate": __props.zoomRate,
        "min-scale": __props.minScale,
        "max-scale": __props.maxScale,
        "show-progress": __props.showProgress,
        "url-list": __props.previewSrcList,
        scale: __props.scale,
        crossorigin: __props.crossorigin,
        "hide-on-click-modal": __props.hideOnClickModal,
        teleported: __props.previewTeleported,
        "close-on-press-escape": __props.closeOnPressEscape,
        onClose: closeViewer,
        onSwitch: switchViewer
      }, createSlots({
        toolbar: withCtx((toolbar) => [renderSlot(_ctx.$slots, "toolbar", normalizeProps(guardReactiveProps(toolbar)))]),
        default: withCtx(() => [_ctx.$slots.viewer ? (openBlock(), createElementBlock("div", _hoisted_2, [renderSlot(_ctx.$slots, "viewer")])) : createCommentVNode("v-if", true)]),
        _: 2
      }, [_ctx.$slots.progress ? {
        name: "progress",
        fn: withCtx((progress) => [renderSlot(_ctx.$slots, "progress", normalizeProps(guardReactiveProps(progress)))]),
        key: "0"
      } : void 0, _ctx.$slots["viewer-error"] ? {
        name: "viewer-error",
        fn: withCtx((viewerError) => [renderSlot(_ctx.$slots, "viewer-error", normalizeProps(guardReactiveProps(viewerError)))]),
        key: "1"
      } : void 0]), 1032, [
        "z-index",
        "initial-index",
        "infinite",
        "zoom-rate",
        "min-scale",
        "max-scale",
        "show-progress",
        "url-list",
        "scale",
        "crossorigin",
        "hide-on-click-modal",
        "teleported",
        "close-on-press-escape"
      ])) : createCommentVNode("v-if", true)], 64)) : createCommentVNode("v-if", true)], 16);
    };
  }
});
var image_default = image_vue_vue_type_script_setup_true_lang_default;
const ElImage = withInstall(image_default);

export { ElImage as E };
//# sourceMappingURL=el-image-BilNxigT.mjs.map
