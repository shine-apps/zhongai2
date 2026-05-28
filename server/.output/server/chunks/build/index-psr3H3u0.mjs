import { E as ElIcon, Q as plus_default, a7 as withInstall, a9 as withNoopInstall, j as buildProps, s as definePropType, e as arrow_left_default, f as arrow_right_default, n as close_default, O as mutable } from './base-C_ywmTr3.mjs';
import { g as getEventCode, E as EVENT_CODE, i as isFirefox } from './event-YY_EUtOs.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth, U as UPDATE_MODEL_EVENT, r as rAF, d as cAF } from './index-DjsCpFrD.mjs';
import { _ as _export_sfc, t as throwError, p as useNamespace, h as isUndefined, c as isNumber } from './server.mjs';
import { f as flattedChildren } from './index-DX-1AO13.mjs';
import { defineComponent, ref, reactive, mergeProps, isRef, unref, withCtx, createVNode, createTextVNode, toDisplayString, withDirectives, openBlock, createBlock, getCurrentInstance, useSlots, inject, computed, watch, createElementBlock, normalizeClass, renderSlot, vShow, createCommentVNode, nextTick, provide, shallowRef, h, triggerRef, isVNode, normalizeStyle, useSSRContext } from 'vue';
import { i as isGreaterThan } from './el-popper-jQIHRSBm.mjs';
import { a as ElSelect, E as ElOption, c as capitalize } from './el-select-Bnkp58fp.mjs';
import { useDocumentVisibility, useWindowFocus, useElementSize, useResizeObserver } from '@vueuse/core';
import { omit, clamp } from 'lodash-unified';
import { isString } from '@vue/shared';
import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { E as ElTable, v as vLoading, a as ElTableColumn } from './el-loading-D9GVmp6R.mjs';
import { E as ElInputNumber } from './el-input-number-BAvHfJiI.mjs';
import { E as ElDialog } from './el-dialog-C6MHvVFj.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDirectiveProps, ssrInterpolate } from 'vue/server-renderer';
import 'async-validator';
import '../nitro/nitro.mjs';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import 'node:fs';
import 'node:path';
import 'node:crypto';
import 'node:url';
import 'jose';
import '../routes/renderer.mjs';
import 'vue-bundle-renderer/runtime';
import 'unhead/server';
import 'devalue';
import 'unhead/utils';
import 'vue-router';
import '@popperjs/core';
import './el-tag-C3TbsKo4.mjs';
import '@ctrl/tinycolor';
import 'normalize-wheel-es';
import './index-AIHSABAD.mjs';
import './refs-CxYYXu5Q.mjs';
import './index-DU43QBNU.mjs';

const tabsRootContextKey = /* @__PURE__ */ Symbol("tabsRootContextKey");
const tabBarProps = buildProps({
  tabs: {
    type: definePropType(Array),
    default: () => mutable([])
  },
  tabRefs: {
    type: definePropType(Object),
    default: () => mutable({})
  }
});
const useWheel = ({ atEndEdge, atStartEdge, layout }, onWheelDelta) => {
  let frameHandle;
  let offset = 0;
  const hasReachedEdge = (offset2) => {
    return offset2 < 0 && atStartEdge.value || offset2 > 0 && atEndEdge.value;
  };
  const onWheel = (e) => {
    cAF(frameHandle);
    let { deltaX, deltaY } = e;
    if (e.shiftKey && deltaY !== 0) {
      deltaX = deltaY;
      deltaY = 0;
    }
    const newOffset = layout.value === "horizontal" ? deltaX : deltaY;
    if (hasReachedEdge(newOffset)) return;
    offset += newOffset;
    if (!isFirefox() && newOffset !== 0) e.preventDefault();
    frameHandle = rAF(() => {
      onWheelDelta(offset);
      offset = 0;
    });
  };
  return {
    hasReachedEdge,
    onWheel
  };
};
const COMPONENT_NAME$2 = "ElTabBar";
var tab_bar_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: COMPONENT_NAME$2,
  __name: "tab-bar",
  props: tabBarProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const rootTabs = inject(tabsRootContextKey);
    if (!rootTabs) throwError(COMPONENT_NAME$2, "<el-tabs><el-tab-bar /></el-tabs>");
    const ns = useNamespace("tabs");
    const barRef = ref();
    const barStyle = ref();
    const renderActiveBar = computed(() => isUndefined(rootTabs.props.defaultValue) || Boolean(barStyle.value?.transform));
    const getBarStyle = () => {
      let offset = 0;
      let tabSize = 0;
      const sizeName = ["top", "bottom"].includes(rootTabs.props.tabPosition) ? "width" : "height";
      const sizeDir = sizeName === "width" ? "x" : "y";
      const position = sizeDir === "x" ? "left" : "top";
      props.tabs.every((tab) => {
        if (isUndefined(tab.paneName)) return false;
        const $el = props.tabRefs[tab.paneName];
        if (!$el) return false;
        if (!tab.active) return true;
        offset = $el[`offset${capitalize(position)}`];
        tabSize = $el[`client${capitalize(sizeName)}`];
        const tabStyles = (void 0).getComputedStyle($el);
        if (sizeName === "width") {
          tabSize -= Number.parseFloat(tabStyles.paddingLeft) + Number.parseFloat(tabStyles.paddingRight);
          offset += Number.parseFloat(tabStyles.paddingLeft);
        }
        return false;
      });
      return {
        [sizeName]: `${tabSize}px`,
        transform: `translate${capitalize(sizeDir)}(${offset}px)`
      };
    };
    const update = () => barStyle.value = getBarStyle();
    const tabObservers = [];
    const observerTabs = () => {
      tabObservers.forEach((observer) => observer.stop());
      tabObservers.length = 0;
      Object.values(props.tabRefs).forEach((tab) => {
        tabObservers.push(useResizeObserver(tab, update));
      });
    };
    watch(() => props.tabs, async () => {
      await nextTick();
      update();
      observerTabs();
    }, { immediate: true });
    useResizeObserver(barRef, () => update());
    __expose({
      /** @description tab root html element */
      ref: barRef,
      /** @description method to manually update tab bar style, return the updated style */
      update
    });
    return (_ctx, _cache) => {
      return renderActiveBar.value ? (openBlock(), createElementBlock("div", {
        key: 0,
        ref_key: "barRef",
        ref: barRef,
        class: normalizeClass([unref(ns).e("active-bar"), unref(ns).is(unref(rootTabs).props.tabPosition)]),
        style: normalizeStyle(barStyle.value)
      }, null, 6)) : createCommentVNode("v-if", true);
    };
  }
});
var tab_bar_default = tab_bar_vue_vue_type_script_setup_true_lang_default;
const tabNavProps = buildProps({
  panes: {
    type: definePropType(Array),
    default: () => mutable([])
  },
  currentName: {
    type: [String, Number],
    default: ""
  },
  editable: Boolean,
  type: {
    type: String,
    values: [
      "card",
      "border-card",
      ""
    ],
    default: ""
  },
  stretch: Boolean,
  /**
  * @description tab-nav tabindex
  */
  tabindex: {
    type: [String, Number],
    default: void 0
  }
});
const tabNavEmits = {
  tabClick: (tab, tabName, ev) => ev instanceof Event,
  tabRemove: (tab, ev) => ev instanceof Event
};
const COMPONENT_NAME$1 = "ElTabNav";
const TabNav = /* @__PURE__ */ defineComponent({
  name: COMPONENT_NAME$1,
  props: tabNavProps,
  emits: tabNavEmits,
  setup(props, { expose, emit }) {
    const rootTabs = inject(tabsRootContextKey);
    if (!rootTabs) throwError(COMPONENT_NAME$1, `<el-tabs><tab-nav /></el-tabs>`);
    const ns = useNamespace("tabs");
    const visibility = useDocumentVisibility();
    const focused = useWindowFocus();
    const navScroll$ = ref();
    const nav$ = ref();
    const el$ = ref();
    const tabRefsMap = ref({});
    const tabBarRef = ref();
    const scrollable = ref(false);
    const navOffset = ref(0);
    const isFocus = ref(false);
    const focusable = ref(true);
    const isWheelScrolling = ref(false);
    const tracker = shallowRef();
    const isHorizontal = computed(() => ["top", "bottom"].includes(rootTabs.props.tabPosition));
    const sizeName = computed(() => isHorizontal.value ? "width" : "height");
    const navStyle = computed(() => {
      const dir = sizeName.value === "width" ? "X" : "Y";
      return {
        transition: isWheelScrolling.value ? "none" : void 0,
        transform: `translate${dir}(-${navOffset.value}px)`
      };
    });
    const { width: navContainerWidth, height: navContainerHeight } = useElementSize(navScroll$);
    const { width: navWidth, height: navHeight } = useElementSize(nav$, {
      width: 0,
      height: 0
    }, { box: "border-box" });
    const navContainerSize = computed(() => isHorizontal.value ? navContainerWidth.value : navContainerHeight.value);
    const navSize = computed(() => isHorizontal.value ? navWidth.value : navHeight.value);
    const { onWheel } = useWheel({
      atStartEdge: computed(() => navOffset.value <= 0),
      atEndEdge: computed(() => navSize.value - navOffset.value <= navContainerSize.value),
      layout: computed(() => isHorizontal.value ? "horizontal" : "vertical")
    }, (offset) => {
      navOffset.value = clamp(navOffset.value + offset, 0, navSize.value - navContainerSize.value);
    });
    const handleWheel = (event) => {
      isWheelScrolling.value = true;
      onWheel(event);
      rAF(() => {
        isWheelScrolling.value = false;
      });
    };
    const scrollPrev = () => {
      if (!navScroll$.value) return;
      const containerSize = navScroll$.value.getBoundingClientRect()[sizeName.value];
      const currentOffset = navOffset.value;
      if (!currentOffset) return;
      navOffset.value = currentOffset > containerSize ? currentOffset - containerSize : 0;
    };
    const scrollNext = () => {
      if (!navScroll$.value || !nav$.value) return;
      const navSize2 = nav$.value.getBoundingClientRect()[sizeName.value];
      const containerSize = navScroll$.value.getBoundingClientRect()[sizeName.value];
      const currentOffset = navOffset.value;
      if (!isGreaterThan(navSize2 - currentOffset, containerSize)) return;
      navOffset.value = navSize2 - currentOffset > containerSize * 2 ? currentOffset + containerSize : navSize2 - containerSize;
    };
    const scrollToActiveTab = async () => {
      const nav = nav$.value;
      if (!scrollable.value || !el$.value || !navScroll$.value || !nav) return;
      await nextTick();
      const activeTab = tabRefsMap.value[props.currentName];
      if (!activeTab) return;
      const navScroll = navScroll$.value;
      const activeTabBounding = activeTab.getBoundingClientRect();
      const navScrollBounding = navScroll.getBoundingClientRect();
      const navScrollLeft = navScrollBounding.left + 1;
      const navScrollRight = navScrollBounding.right - 1;
      const navBounding = nav.getBoundingClientRect();
      const maxOffset = isHorizontal.value ? navBounding.width - navScrollBounding.width : navBounding.height - navScrollBounding.height;
      const currentOffset = navOffset.value;
      let newOffset = currentOffset;
      if (isHorizontal.value) {
        if (activeTabBounding.left < navScrollLeft) newOffset = currentOffset - (navScrollLeft - activeTabBounding.left);
        if (activeTabBounding.right > navScrollRight) newOffset = currentOffset + activeTabBounding.right - navScrollRight;
      } else {
        if (activeTabBounding.top < navScrollBounding.top) newOffset = currentOffset - (navScrollBounding.top - activeTabBounding.top);
        if (activeTabBounding.bottom > navScrollBounding.bottom) newOffset = currentOffset + (activeTabBounding.bottom - navScrollBounding.bottom);
      }
      newOffset = Math.max(newOffset, 0);
      navOffset.value = Math.min(newOffset, maxOffset);
    };
    const update = () => {
      if (!nav$.value || !navScroll$.value) return;
      props.stretch && tabBarRef.value?.update();
      const navSize2 = nav$.value.getBoundingClientRect()[sizeName.value];
      const containerSize = navScroll$.value.getBoundingClientRect()[sizeName.value];
      const currentOffset = navOffset.value;
      if (containerSize < navSize2) {
        scrollable.value = scrollable.value || {};
        scrollable.value.prev = currentOffset;
        scrollable.value.next = isGreaterThan(navSize2, currentOffset + containerSize);
        if (isGreaterThan(containerSize, navSize2 - currentOffset)) navOffset.value = navSize2 - containerSize;
      } else {
        scrollable.value = false;
        if (currentOffset > 0) navOffset.value = 0;
      }
    };
    const changeTab = (event) => {
      const code = getEventCode(event);
      let step = 0;
      switch (code) {
        case EVENT_CODE.left:
        case EVENT_CODE.up:
          step = -1;
          break;
        case EVENT_CODE.right:
        case EVENT_CODE.down:
          step = 1;
          break;
        default:
          return;
      }
      const tabList = Array.from(event.currentTarget.querySelectorAll("[role=tab]:not(.is-disabled)"));
      let nextIndex = tabList.indexOf(event.target) + step;
      if (nextIndex < 0) nextIndex = tabList.length - 1;
      else if (nextIndex >= tabList.length) nextIndex = 0;
      tabList[nextIndex].focus({ preventScroll: true });
      tabList[nextIndex].click();
      setFocus();
    };
    const setFocus = () => {
      if (focusable.value) isFocus.value = true;
    };
    const removeFocus = () => isFocus.value = false;
    const setRefs = (el, key) => {
      tabRefsMap.value[key] = el;
    };
    const focusActiveTab = async () => {
      await nextTick();
      tabRefsMap.value[props.currentName]?.focus({ preventScroll: true });
    };
    watch(visibility, (visibility2) => {
      if (visibility2 === "hidden") focusable.value = false;
      else if (visibility2 === "visible") setTimeout(() => focusable.value = true, 50);
    });
    watch(focused, (focused2) => {
      if (focused2) setTimeout(() => focusable.value = true, 50);
      else focusable.value = false;
    });
    useResizeObserver(el$, () => {
      rAF(update);
    });
    expose({
      scrollToActiveTab,
      removeFocus,
      focusActiveTab,
      tabListRef: nav$,
      tabBarRef,
      scheduleRender: () => triggerRef(tracker)
    });
    return () => {
      const scrollBtn = scrollable.value ? [createVNode("span", {
        "class": [ns.e("nav-prev"), ns.is("disabled", !scrollable.value.prev)],
        "onClick": scrollPrev
      }, [createVNode(ElIcon, null, { default: () => [createVNode(arrow_left_default, null, null)] })]), createVNode("span", {
        "class": [ns.e("nav-next"), ns.is("disabled", !scrollable.value.next)],
        "onClick": scrollNext
      }, [createVNode(ElIcon, null, { default: () => [createVNode(arrow_right_default, null, null)] })])] : null;
      const tabs = props.panes.map((pane, index2) => {
        const uid = pane.uid;
        const disabled = pane.props.disabled;
        const tabName = pane.props.name ?? pane.index ?? `${index2}`;
        const closable = !disabled && (pane.isClosable || pane.props.closable !== false && props.editable);
        pane.index = `${index2}`;
        const btnClose = closable ? createVNode(ElIcon, {
          "class": "is-icon-close",
          "onClick": (ev) => emit("tabRemove", pane, ev)
        }, { default: () => [createVNode(close_default, null, null)] }) : null;
        const tabLabelContent = pane.slots.label?.() || pane.props.label;
        const tabindex = !disabled && pane.active ? props.tabindex ?? rootTabs.props.tabindex : -1;
        return createVNode("div", {
          "ref": (el) => setRefs(el, tabName),
          "class": [
            ns.e("item"),
            ns.is(rootTabs.props.tabPosition),
            ns.is("active", pane.active),
            ns.is("disabled", disabled),
            ns.is("closable", closable),
            ns.is("focus", isFocus.value)
          ],
          "id": `tab-${tabName}`,
          "key": `tab-${uid}`,
          "aria-controls": `pane-${tabName}`,
          "role": "tab",
          "aria-selected": pane.active,
          "tabindex": tabindex,
          "onFocus": () => setFocus(),
          "onBlur": () => removeFocus(),
          "onClick": (ev) => {
            removeFocus();
            emit("tabClick", pane, tabName, ev);
          },
          "onKeydown": (ev) => {
            const code = getEventCode(ev);
            if (closable && (code === EVENT_CODE.delete || code === EVENT_CODE.backspace)) emit("tabRemove", pane, ev);
          }
        }, [...[tabLabelContent, btnClose]]);
      });
      tracker.value;
      return createVNode("div", {
        "ref": el$,
        "class": [
          ns.e("nav-wrap"),
          ns.is("scrollable", !!scrollable.value),
          ns.is(rootTabs.props.tabPosition)
        ]
      }, [scrollBtn, createVNode("div", {
        "class": ns.e("nav-scroll"),
        "ref": navScroll$
      }, [props.panes.length > 0 ? createVNode("div", {
        "class": [
          ns.e("nav"),
          ns.is(rootTabs.props.tabPosition),
          ns.is("stretch", props.stretch && ["top", "bottom"].includes(rootTabs.props.tabPosition))
        ],
        "ref": nav$,
        "style": navStyle.value,
        "role": "tablist",
        "onKeydown": changeTab,
        "onWheel": handleWheel
      }, [...[!props.type ? createVNode(tab_bar_default, {
        "ref": tabBarRef,
        "tabs": [...props.panes],
        "tabRefs": tabRefsMap.value
      }, null) : null, tabs]]) : null])]);
    };
  }
});
const getOrderedChildren = (vm, childComponentName, children) => {
  return flattedChildren(vm.subTree).filter((n) => isVNode(n) && n.type?.name === childComponentName && !!n.component).map((n) => n.component.uid).map((uid) => children[uid]).filter((p) => !!p);
};
const useOrderedChildren = (vm, childComponentName) => {
  const children = shallowRef({});
  const orderedChildren = shallowRef([]);
  const nodesMap = /* @__PURE__ */ new WeakMap();
  const addChild = (child) => {
    children.value[child.uid] = child;
    triggerRef(children);
  };
  const removeChild = (child) => {
    delete children.value[child.uid];
    triggerRef(children);
    const childNode = child.getVnode().el;
    const parentNode = childNode.parentNode;
    const childNodes = nodesMap.get(parentNode);
    const index2 = childNodes.indexOf(childNode);
    childNodes.splice(index2, 1);
  };
  const sortChildren = () => {
    orderedChildren.value = getOrderedChildren(vm, childComponentName, children.value);
  };
  const IsolatedRenderer = (props) => {
    return props.render();
  };
  return {
    children: orderedChildren,
    addChild,
    removeChild,
    ChildrenSorter: defineComponent({ setup(_, { slots }) {
      return () => {
        sortChildren();
        return slots.default ? h(IsolatedRenderer, { render: slots.default }) : null;
      };
    } })
  };
};
const tabsProps = buildProps({
  /**
  * @description type of Tab
  */
  type: {
    type: String,
    values: [
      "card",
      "border-card",
      ""
    ],
    default: ""
  },
  /**
  * @description whether Tab is closable
  */
  closable: Boolean,
  /**
  * @description whether Tab is addable
  */
  addable: Boolean,
  /**
  * @description binding value, name of the selected tab
  */
  modelValue: { type: [String, Number] },
  /**
  * @description initial value when `model-value` is not set
  */
  defaultValue: { type: [String, Number] },
  /**
  * @description whether Tab is addable and closable
  */
  editable: Boolean,
  /**
  * @description position of tabs
  */
  tabPosition: {
    type: String,
    values: [
      "top",
      "right",
      "bottom",
      "left"
    ],
    default: "top"
  },
  /**
  * @description hook function before switching tab. If `false` is returned or a `Promise` is returned and then is rejected, switching will be prevented
  */
  beforeLeave: {
    type: definePropType(Function),
    default: () => true
  },
  /**
  * @description whether width of tab automatically fits its container
  */
  stretch: Boolean,
  /**
  * @description tabs tabindex
  */
  tabindex: {
    type: [String, Number],
    default: 0
  }
});
const isPaneName = (value) => isString(value) || isNumber(value);
const tabsEmits = {
  [UPDATE_MODEL_EVENT]: (name) => isPaneName(name),
  tabClick: (pane, ev) => ev instanceof Event,
  tabChange: (name) => isPaneName(name),
  edit: (paneName, action) => ["remove", "add"].includes(action),
  tabRemove: (name) => isPaneName(name),
  tabAdd: () => true
};
const Tabs = /* @__PURE__ */ defineComponent({
  name: "ElTabs",
  props: tabsProps,
  emits: tabsEmits,
  setup(props, { emit, slots, expose }) {
    const ns = useNamespace("tabs");
    const isVertical = computed(() => ["left", "right"].includes(props.tabPosition));
    const { children: panes, addChild: registerPane, removeChild: unregisterPane, ChildrenSorter: PanesSorter } = useOrderedChildren(getCurrentInstance(), "ElTabPane");
    const nav$ = ref();
    const currentName = ref((isUndefined(props.modelValue) ? props.defaultValue : props.modelValue) ?? "0");
    const setCurrentName = async (value, trigger = false) => {
      if (currentName.value === value || isUndefined(value)) return;
      try {
        let canLeave;
        if (props.beforeLeave) {
          const result = props.beforeLeave(value, currentName.value);
          canLeave = result instanceof Promise ? await result : result;
        } else canLeave = true;
        if (canLeave !== false) {
          const isFocusInsidePane = panes.value.find((item) => item.paneName === currentName.value)?.isFocusInsidePane();
          currentName.value = value;
          if (trigger) {
            emit(UPDATE_MODEL_EVENT, value);
            emit("tabChange", value);
          }
          nav$.value?.removeFocus?.();
          if (isFocusInsidePane) nav$.value?.focusActiveTab();
        }
      } catch {
      }
    };
    const handleTabClick = (tab, tabName, event) => {
      if (tab.props.disabled) return;
      emit("tabClick", tab, event);
      setCurrentName(tabName, true);
    };
    const handleTabRemove = (pane, ev) => {
      if (pane.props.disabled || isUndefined(pane.props.name)) return;
      ev.stopPropagation();
      emit("edit", pane.props.name, "remove");
      emit("tabRemove", pane.props.name);
    };
    const handleTabAdd = () => {
      emit("edit", void 0, "add");
      emit("tabAdd");
    };
    const handleKeydown = (event) => {
      const code = getEventCode(event);
      if ([EVENT_CODE.enter, EVENT_CODE.numpadEnter].includes(code)) handleTabAdd();
    };
    const swapChildren = (vnode) => {
      const actualFirstChild = vnode.el.firstChild;
      const firstChild = ["bottom", "right"].includes(props.tabPosition) ? vnode.children[0].el : vnode.children[1].el;
      if (actualFirstChild !== firstChild) actualFirstChild.before(firstChild);
    };
    watch(() => props.modelValue, (modelValue) => setCurrentName(modelValue));
    watch(currentName, async () => {
      await nextTick();
      nav$.value?.scrollToActiveTab();
    });
    provide(tabsRootContextKey, {
      props,
      currentName,
      registerPane,
      unregisterPane,
      nav$
    });
    expose({
      currentName,
      get tabNavRef() {
        return omit(nav$.value, ["scheduleRender"]);
      }
    });
    return () => {
      const addSlot = slots["add-icon"];
      const newButton = props.editable || props.addable ? createVNode("div", {
        "class": [ns.e("new-tab"), isVertical.value && ns.e("new-tab-vertical")],
        "tabindex": props.tabindex,
        "onClick": handleTabAdd,
        "onKeydown": handleKeydown
      }, [addSlot ? renderSlot(slots, "add-icon") : createVNode(ElIcon, { "class": ns.is("icon-plus") }, { default: () => [createVNode(plus_default, null, null)] })]) : null;
      const tabNav = () => createVNode(TabNav, {
        "ref": nav$,
        "currentName": currentName.value,
        "editable": props.editable,
        "type": props.type,
        "panes": panes.value,
        "stretch": props.stretch,
        "onTabClick": handleTabClick,
        "onTabRemove": handleTabRemove
      }, null);
      const header = createVNode("div", { "class": [
        ns.e("header"),
        isVertical.value && ns.e("header-vertical"),
        ns.is(props.tabPosition)
      ] }, [createVNode(PanesSorter, null, {
        default: tabNav,
        $stable: true
      }), newButton]);
      const panels = createVNode("div", { "class": ns.e("content") }, [renderSlot(slots, "default")]);
      return createVNode("div", {
        "class": [
          ns.b(),
          ns.m(props.tabPosition),
          {
            [ns.m("card")]: props.type === "card",
            [ns.m("border-card")]: props.type === "border-card"
          }
        ],
        "onVnodeMounted": swapChildren,
        "onVnodeUpdated": swapChildren
      }, [panels, header]);
    };
  }
});
const tabPaneProps = buildProps({
  /**
  * @description title of the tab
  */
  label: {
    type: String,
    default: ""
  },
  /**
  * @description identifier corresponding to the name of Tabs, representing the alias of the tab-pane, the default is ordinal number of the tab-pane in the sequence, e.g. the first tab-pane is '0'
  */
  name: { type: [String, Number] },
  /**
  * @description whether Tab is closable
  */
  closable: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description whether Tab is disabled
  */
  disabled: Boolean,
  /**
  * @description whether Tab is lazily rendered
  */
  lazy: Boolean
});
const _hoisted_1 = [
  "id",
  "aria-hidden",
  "aria-labelledby"
];
const COMPONENT_NAME = "ElTabPane";
var tab_pane_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: COMPONENT_NAME,
  __name: "tab-pane",
  props: tabPaneProps,
  setup(__props) {
    const props = __props;
    const instance = getCurrentInstance();
    const slots = useSlots();
    const tabsRoot = inject(tabsRootContextKey);
    if (!tabsRoot) throwError(COMPONENT_NAME, "usage: <el-tabs><el-tab-pane /></el-tabs/>");
    const ns = useNamespace("tab-pane");
    const paneRef = ref();
    const index2 = ref();
    const isClosable = computed(() => props.closable ?? tabsRoot.props.closable);
    const active = computed(() => tabsRoot.currentName.value === (props.name ?? index2.value));
    const loaded = ref(active.value);
    const paneName = computed(() => props.name ?? index2.value);
    const shouldBeRender = computed(() => !props.lazy || loaded.value || active.value);
    const isFocusInsidePane = () => {
      return paneRef.value?.contains((void 0).activeElement);
    };
    watch(active, (val) => {
      if (val) loaded.value = true;
    });
    const pane = reactive({
      uid: instance.uid,
      getVnode: () => instance.vnode,
      slots,
      props,
      paneName,
      active,
      index: index2,
      isClosable,
      isFocusInsidePane
    });
    tabsRoot.registerPane(pane);
    return (_ctx, _cache) => {
      return shouldBeRender.value ? withDirectives((openBlock(), createElementBlock("div", {
        key: 0,
        id: `pane-${paneName.value}`,
        ref_key: "paneRef",
        ref: paneRef,
        class: normalizeClass(unref(ns).b()),
        role: "tabpanel",
        "aria-hidden": !active.value,
        "aria-labelledby": `tab-${paneName.value}`
      }, [renderSlot(_ctx.$slots, "default")], 10, _hoisted_1)), [[vShow, active.value]]) : createCommentVNode("v-if", true);
    };
  }
});
var tab_pane_default = tab_pane_vue_vue_type_script_setup_true_lang_default;
const ElTabs = withInstall(Tabs, { TabPane: tab_pane_default });
const ElTabPane = withNoopInstall(tab_pane_default);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { fetchWithAuth } = useAdminAuth();
    const activeTab = ref("rules");
    const rulesLoading = ref(false);
    const rules = ref([]);
    const ruleDialogVisible = ref(false);
    const ruleSubmitting = ref(false);
    const isEditingRule = ref(false);
    const editingRuleId = ref(null);
    const ruleFormRef = ref();
    const ruleForm = reactive({
      name: "",
      pointType: "activity",
      amount: 0,
      description: ""
    });
    const ruleFormRules = {
      name: [{ required: true, message: "请输入规则名称", trigger: "blur" }],
      pointType: [{ required: true, message: "请选择积分类型", trigger: "change" }],
      amount: [{ required: true, message: "请输入积分值", trigger: "blur" }]
    };
    const adjustFormRef = ref();
    const adjustSubmitting = ref(false);
    const adjustForm = reactive({
      userId: "",
      pointType: "activity",
      amount: 0,
      description: ""
    });
    const adjustRules = {
      userId: [{ required: true, message: "请输入用户ID", trigger: "blur" }],
      pointType: [{ required: true, message: "请选择积分类型", trigger: "change" }],
      amount: [{ required: true, message: "请输入调整数量", trigger: "blur" }],
      description: [{ required: true, message: "请输入调整说明", trigger: "blur" }]
    };
    const loadRules = async () => {
      rulesLoading.value = true;
      try {
        const res = await fetchWithAuth("/api/points/rules");
        rules.value = res.data || res.items || res || [];
      } catch {
        ElMessage.error("加载积分规则失败");
      } finally {
        rulesLoading.value = false;
      }
    };
    const openRuleDialog = (row) => {
      if (row) {
        isEditingRule.value = true;
        editingRuleId.value = row.id;
        ruleForm.name = row.name;
        ruleForm.pointType = row.pointType;
        ruleForm.amount = row.amount;
        ruleForm.description = row.description || "";
      } else {
        isEditingRule.value = false;
        editingRuleId.value = null;
        ruleForm.name = "";
        ruleForm.pointType = "activity";
        ruleForm.amount = 0;
        ruleForm.description = "";
      }
      ruleDialogVisible.value = true;
    };
    const handleSaveRule = async () => {
      const valid = await ruleFormRef.value?.validate().catch(() => false);
      if (!valid) return;
      ruleSubmitting.value = true;
      try {
        if (isEditingRule.value && editingRuleId.value) {
          await fetchWithAuth(`/api/points/rules/${editingRuleId.value}`, {
            method: "PUT",
            body: ruleForm
          });
        } else {
          await fetchWithAuth("/api/points/rules", {
            method: "POST",
            body: ruleForm
          });
        }
        ElMessage.success(isEditingRule.value ? "更新规则成功" : "添加规则成功");
        ruleDialogVisible.value = false;
        loadRules();
      } catch {
        ElMessage.error("保存规则失败");
      } finally {
        ruleSubmitting.value = false;
      }
    };
    const handleDeleteRule = async (row) => {
      try {
        await fetchWithAuth(`/api/points/rules/${row.id}`, {
          method: "DELETE"
        });
        ElMessage.success("删除规则成功");
        loadRules();
      } catch {
        ElMessage.error("删除规则失败");
      }
    };
    const handleAdjust = async () => {
      const valid = await adjustFormRef.value?.validate().catch(() => false);
      if (!valid) return;
      adjustSubmitting.value = true;
      try {
        await fetchWithAuth("/api/points/adjust", {
          method: "POST",
          body: adjustForm
        });
        ElMessage.success("积分调整成功");
        adjustForm.userId = "";
        adjustForm.pointType = "activity";
        adjustForm.amount = 0;
        adjustForm.description = "";
      } catch {
        ElMessage.error("积分调整失败");
      } finally {
        adjustSubmitting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_tabs = ElTabs;
      const _component_el_tab_pane = ElTabPane;
      const _component_el_card = ElCard;
      const _component_el_button = ElButton;
      const _component_el_icon = ElIcon;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_select = ElSelect;
      const _component_el_option = ElOption;
      const _component_el_input_number = ElInputNumber;
      const _component_el_dialog = ElDialog;
      const _directive_loading = vLoading;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "points-page" }, _attrs))} data-v-ecfa173d>`);
      _push(ssrRenderComponent(_component_el_tabs, {
        modelValue: unref(activeTab),
        "onUpdate:modelValue": ($event) => isRef(activeTab) ? activeTab.value = $event : null
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_tab_pane, {
              label: "积分规则",
              name: "rules"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="tab-header" data-v-ecfa173d${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "primary",
                          onClick: ($event) => openRuleDialog()
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(plus_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(plus_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` 添加规则 `);
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(plus_default))
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" 添加规则 ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(_component_el_table, mergeProps({
                          data: unref(rules),
                          stripe: ""
                        }, ssrGetDirectiveProps(_ctx, _directive_loading, unref(rulesLoading))), {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_table_column, {
                                prop: "name",
                                label: "规则名称"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_table_column, {
                                prop: "pointType",
                                label: "积分类型",
                                width: "120"
                              }, {
                                default: withCtx(({ row }, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(row.pointType === "activity" ? "活动积分" : "捐助积分")}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(row.pointType === "activity" ? "活动积分" : "捐助积分"), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_table_column, {
                                prop: "amount",
                                label: "积分值",
                                width: "100"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_table_column, {
                                prop: "description",
                                label: "描述"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_table_column, {
                                label: "操作",
                                width: "160",
                                fixed: "right"
                              }, {
                                default: withCtx(({ row }, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_button, {
                                      type: "primary",
                                      link: "",
                                      onClick: ($event) => openRuleDialog(row)
                                    }, {
                                      default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`编辑`);
                                        } else {
                                          return [
                                            createTextVNode("编辑")
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent6, _scopeId5));
                                    _push6(ssrRenderComponent(_component_el_button, {
                                      type: "danger",
                                      link: "",
                                      onClick: ($event) => handleDeleteRule(row)
                                    }, {
                                      default: withCtx((_5, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`删除`);
                                        } else {
                                          return [
                                            createTextVNode("删除")
                                          ];
                                        }
                                      }),
                                      _: 2
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_button, {
                                        type: "primary",
                                        link: "",
                                        onClick: ($event) => openRuleDialog(row)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("编辑")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"]),
                                      createVNode(_component_el_button, {
                                        type: "danger",
                                        link: "",
                                        onClick: ($event) => handleDeleteRule(row)
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("删除")
                                        ]),
                                        _: 1
                                      }, 8, ["onClick"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_table_column, {
                                  prop: "name",
                                  label: "规则名称"
                                }),
                                createVNode(_component_el_table_column, {
                                  prop: "pointType",
                                  label: "积分类型",
                                  width: "120"
                                }, {
                                  default: withCtx(({ row }) => [
                                    createTextVNode(toDisplayString(row.pointType === "activity" ? "活动积分" : "捐助积分"), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_table_column, {
                                  prop: "amount",
                                  label: "积分值",
                                  width: "100"
                                }),
                                createVNode(_component_el_table_column, {
                                  prop: "description",
                                  label: "描述"
                                }),
                                createVNode(_component_el_table_column, {
                                  label: "操作",
                                  width: "160",
                                  fixed: "right"
                                }, {
                                  default: withCtx(({ row }) => [
                                    createVNode(_component_el_button, {
                                      type: "primary",
                                      link: "",
                                      onClick: ($event) => openRuleDialog(row)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("编辑")
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"]),
                                    createVNode(_component_el_button, {
                                      type: "danger",
                                      link: "",
                                      onClick: ($event) => handleDeleteRule(row)
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("删除")
                                      ]),
                                      _: 1
                                    }, 8, ["onClick"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode("div", { class: "tab-header" }, [
                            createVNode(_component_el_button, {
                              type: "primary",
                              onClick: ($event) => openRuleDialog()
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(plus_default))
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" 添加规则 ")
                              ]),
                              _: 1
                            }, 8, ["onClick"])
                          ]),
                          withDirectives((openBlock(), createBlock(_component_el_table, {
                            data: unref(rules),
                            stripe: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_table_column, {
                                prop: "name",
                                label: "规则名称"
                              }),
                              createVNode(_component_el_table_column, {
                                prop: "pointType",
                                label: "积分类型",
                                width: "120"
                              }, {
                                default: withCtx(({ row }) => [
                                  createTextVNode(toDisplayString(row.pointType === "activity" ? "活动积分" : "捐助积分"), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_table_column, {
                                prop: "amount",
                                label: "积分值",
                                width: "100"
                              }),
                              createVNode(_component_el_table_column, {
                                prop: "description",
                                label: "描述"
                              }),
                              createVNode(_component_el_table_column, {
                                label: "操作",
                                width: "160",
                                fixed: "right"
                              }, {
                                default: withCtx(({ row }) => [
                                  createVNode(_component_el_button, {
                                    type: "primary",
                                    link: "",
                                    onClick: ($event) => openRuleDialog(row)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("编辑")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"]),
                                  createVNode(_component_el_button, {
                                    type: "danger",
                                    link: "",
                                    onClick: ($event) => handleDeleteRule(row)
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("删除")
                                    ]),
                                    _: 1
                                  }, 8, ["onClick"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["data"])), [
                            [_directive_loading, unref(rulesLoading)]
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, { shadow: "hover" }, {
                      default: withCtx(() => [
                        createVNode("div", { class: "tab-header" }, [
                          createVNode(_component_el_button, {
                            type: "primary",
                            onClick: ($event) => openRuleDialog()
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(plus_default))
                                ]),
                                _: 1
                              }),
                              createTextVNode(" 添加规则 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ]),
                        withDirectives((openBlock(), createBlock(_component_el_table, {
                          data: unref(rules),
                          stripe: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_table_column, {
                              prop: "name",
                              label: "规则名称"
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "pointType",
                              label: "积分类型",
                              width: "120"
                            }, {
                              default: withCtx(({ row }) => [
                                createTextVNode(toDisplayString(row.pointType === "activity" ? "活动积分" : "捐助积分"), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "amount",
                              label: "积分值",
                              width: "100"
                            }),
                            createVNode(_component_el_table_column, {
                              prop: "description",
                              label: "描述"
                            }),
                            createVNode(_component_el_table_column, {
                              label: "操作",
                              width: "160",
                              fixed: "right"
                            }, {
                              default: withCtx(({ row }) => [
                                createVNode(_component_el_button, {
                                  type: "primary",
                                  link: "",
                                  onClick: ($event) => openRuleDialog(row)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("编辑")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"]),
                                createVNode(_component_el_button, {
                                  type: "danger",
                                  link: "",
                                  onClick: ($event) => handleDeleteRule(row)
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("删除")
                                  ]),
                                  _: 1
                                }, 8, ["onClick"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["data"])), [
                          [_directive_loading, unref(rulesLoading)]
                        ])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_tab_pane, {
              label: "积分调整",
              name: "adjust"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_form, {
                          ref_key: "adjustFormRef",
                          ref: adjustFormRef,
                          model: unref(adjustForm),
                          rules: adjustRules,
                          "label-width": "100px",
                          style: { "max-width": "500px" }
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_form_item, {
                                label: "用户ID",
                                prop: "userId"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_input, {
                                      modelValue: unref(adjustForm).userId,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                      placeholder: "请输入用户ID"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_input, {
                                        modelValue: unref(adjustForm).userId,
                                        "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                        placeholder: "请输入用户ID"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_form_item, {
                                label: "积分类型",
                                prop: "pointType"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_select, {
                                      modelValue: unref(adjustForm).pointType,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                      placeholder: "请选择积分类型"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(ssrRenderComponent(_component_el_option, {
                                            label: "活动积分",
                                            value: "activity"
                                          }, null, _parent7, _scopeId6));
                                          _push7(ssrRenderComponent(_component_el_option, {
                                            label: "捐助积分",
                                            value: "donation"
                                          }, null, _parent7, _scopeId6));
                                        } else {
                                          return [
                                            createVNode(_component_el_option, {
                                              label: "活动积分",
                                              value: "activity"
                                            }),
                                            createVNode(_component_el_option, {
                                              label: "捐助积分",
                                              value: "donation"
                                            })
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_select, {
                                        modelValue: unref(adjustForm).pointType,
                                        "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                        placeholder: "请选择积分类型"
                                      }, {
                                        default: withCtx(() => [
                                          createVNode(_component_el_option, {
                                            label: "活动积分",
                                            value: "activity"
                                          }),
                                          createVNode(_component_el_option, {
                                            label: "捐助积分",
                                            value: "donation"
                                          })
                                        ]),
                                        _: 1
                                      }, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_form_item, {
                                label: "调整数量",
                                prop: "amount"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_input_number, {
                                      modelValue: unref(adjustForm).amount,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                      style: { "width": "100%" }
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_input_number, {
                                        modelValue: unref(adjustForm).amount,
                                        "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                        style: { "width": "100%" }
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_form_item, {
                                label: "调整说明",
                                prop: "description"
                              }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_input, {
                                      modelValue: unref(adjustForm).description,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                      type: "textarea",
                                      rows: 3,
                                      placeholder: "请输入调整说明"
                                    }, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_input, {
                                        modelValue: unref(adjustForm).description,
                                        "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                        type: "textarea",
                                        rows: 3,
                                        placeholder: "请输入调整说明"
                                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_form_item, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_button, {
                                      type: "primary",
                                      loading: unref(adjustSubmitting),
                                      onClick: handleAdjust
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`提交`);
                                        } else {
                                          return [
                                            createTextVNode("提交")
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_button, {
                                        type: "primary",
                                        loading: unref(adjustSubmitting),
                                        onClick: handleAdjust
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode("提交")
                                        ]),
                                        _: 1
                                      }, 8, ["loading"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_form_item, {
                                  label: "用户ID",
                                  prop: "userId"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_input, {
                                      modelValue: unref(adjustForm).userId,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                      placeholder: "请输入用户ID"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_form_item, {
                                  label: "积分类型",
                                  prop: "pointType"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_select, {
                                      modelValue: unref(adjustForm).pointType,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                      placeholder: "请选择积分类型"
                                    }, {
                                      default: withCtx(() => [
                                        createVNode(_component_el_option, {
                                          label: "活动积分",
                                          value: "activity"
                                        }),
                                        createVNode(_component_el_option, {
                                          label: "捐助积分",
                                          value: "donation"
                                        })
                                      ]),
                                      _: 1
                                    }, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_form_item, {
                                  label: "调整数量",
                                  prop: "amount"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_input_number, {
                                      modelValue: unref(adjustForm).amount,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                      style: { "width": "100%" }
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_form_item, {
                                  label: "调整说明",
                                  prop: "description"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_input, {
                                      modelValue: unref(adjustForm).description,
                                      "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                      type: "textarea",
                                      rows: 3,
                                      placeholder: "请输入调整说明"
                                    }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_form_item, null, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_button, {
                                      type: "primary",
                                      loading: unref(adjustSubmitting),
                                      onClick: handleAdjust
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode("提交")
                                      ]),
                                      _: 1
                                    }, 8, ["loading"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_form, {
                            ref_key: "adjustFormRef",
                            ref: adjustFormRef,
                            model: unref(adjustForm),
                            rules: adjustRules,
                            "label-width": "100px",
                            style: { "max-width": "500px" }
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_form_item, {
                                label: "用户ID",
                                prop: "userId"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_input, {
                                    modelValue: unref(adjustForm).userId,
                                    "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                    placeholder: "请输入用户ID"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, {
                                label: "积分类型",
                                prop: "pointType"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_select, {
                                    modelValue: unref(adjustForm).pointType,
                                    "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                    placeholder: "请选择积分类型"
                                  }, {
                                    default: withCtx(() => [
                                      createVNode(_component_el_option, {
                                        label: "活动积分",
                                        value: "activity"
                                      }),
                                      createVNode(_component_el_option, {
                                        label: "捐助积分",
                                        value: "donation"
                                      })
                                    ]),
                                    _: 1
                                  }, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, {
                                label: "调整数量",
                                prop: "amount"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_input_number, {
                                    modelValue: unref(adjustForm).amount,
                                    "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                    style: { "width": "100%" }
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, {
                                label: "调整说明",
                                prop: "description"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_input, {
                                    modelValue: unref(adjustForm).description,
                                    "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                    type: "textarea",
                                    rows: 3,
                                    placeholder: "请输入调整说明"
                                  }, null, 8, ["modelValue", "onUpdate:modelValue"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_form_item, null, {
                                default: withCtx(() => [
                                  createVNode(_component_el_button, {
                                    type: "primary",
                                    loading: unref(adjustSubmitting),
                                    onClick: handleAdjust
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode("提交")
                                    ]),
                                    _: 1
                                  }, 8, ["loading"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["model"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, { shadow: "hover" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_form, {
                          ref_key: "adjustFormRef",
                          ref: adjustFormRef,
                          model: unref(adjustForm),
                          rules: adjustRules,
                          "label-width": "100px",
                          style: { "max-width": "500px" }
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_form_item, {
                              label: "用户ID",
                              prop: "userId"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: unref(adjustForm).userId,
                                  "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                  placeholder: "请输入用户ID"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, {
                              label: "积分类型",
                              prop: "pointType"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_select, {
                                  modelValue: unref(adjustForm).pointType,
                                  "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                  placeholder: "请选择积分类型"
                                }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_option, {
                                      label: "活动积分",
                                      value: "activity"
                                    }),
                                    createVNode(_component_el_option, {
                                      label: "捐助积分",
                                      value: "donation"
                                    })
                                  ]),
                                  _: 1
                                }, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, {
                              label: "调整数量",
                              prop: "amount"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input_number, {
                                  modelValue: unref(adjustForm).amount,
                                  "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                  style: { "width": "100%" }
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, {
                              label: "调整说明",
                              prop: "description"
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_input, {
                                  modelValue: unref(adjustForm).description,
                                  "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                  type: "textarea",
                                  rows: 3,
                                  placeholder: "请输入调整说明"
                                }, null, 8, ["modelValue", "onUpdate:modelValue"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_form_item, null, {
                              default: withCtx(() => [
                                createVNode(_component_el_button, {
                                  type: "primary",
                                  loading: unref(adjustSubmitting),
                                  onClick: handleAdjust
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode("提交")
                                  ]),
                                  _: 1
                                }, 8, ["loading"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["model"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_tab_pane, {
                label: "积分规则",
                name: "rules"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { shadow: "hover" }, {
                    default: withCtx(() => [
                      createVNode("div", { class: "tab-header" }, [
                        createVNode(_component_el_button, {
                          type: "primary",
                          onClick: ($event) => openRuleDialog()
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(plus_default))
                              ]),
                              _: 1
                            }),
                            createTextVNode(" 添加规则 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      withDirectives((openBlock(), createBlock(_component_el_table, {
                        data: unref(rules),
                        stripe: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_table_column, {
                            prop: "name",
                            label: "规则名称"
                          }),
                          createVNode(_component_el_table_column, {
                            prop: "pointType",
                            label: "积分类型",
                            width: "120"
                          }, {
                            default: withCtx(({ row }) => [
                              createTextVNode(toDisplayString(row.pointType === "activity" ? "活动积分" : "捐助积分"), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_table_column, {
                            prop: "amount",
                            label: "积分值",
                            width: "100"
                          }),
                          createVNode(_component_el_table_column, {
                            prop: "description",
                            label: "描述"
                          }),
                          createVNode(_component_el_table_column, {
                            label: "操作",
                            width: "160",
                            fixed: "right"
                          }, {
                            default: withCtx(({ row }) => [
                              createVNode(_component_el_button, {
                                type: "primary",
                                link: "",
                                onClick: ($event) => openRuleDialog(row)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("编辑")
                                ]),
                                _: 1
                              }, 8, ["onClick"]),
                              createVNode(_component_el_button, {
                                type: "danger",
                                link: "",
                                onClick: ($event) => handleDeleteRule(row)
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("删除")
                                ]),
                                _: 1
                              }, 8, ["onClick"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["data"])), [
                        [_directive_loading, unref(rulesLoading)]
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_tab_pane, {
                label: "积分调整",
                name: "adjust"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { shadow: "hover" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_form, {
                        ref_key: "adjustFormRef",
                        ref: adjustFormRef,
                        model: unref(adjustForm),
                        rules: adjustRules,
                        "label-width": "100px",
                        style: { "max-width": "500px" }
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_form_item, {
                            label: "用户ID",
                            prop: "userId"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: unref(adjustForm).userId,
                                "onUpdate:modelValue": ($event) => unref(adjustForm).userId = $event,
                                placeholder: "请输入用户ID"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, {
                            label: "积分类型",
                            prop: "pointType"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_select, {
                                modelValue: unref(adjustForm).pointType,
                                "onUpdate:modelValue": ($event) => unref(adjustForm).pointType = $event,
                                placeholder: "请选择积分类型"
                              }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_option, {
                                    label: "活动积分",
                                    value: "activity"
                                  }),
                                  createVNode(_component_el_option, {
                                    label: "捐助积分",
                                    value: "donation"
                                  })
                                ]),
                                _: 1
                              }, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, {
                            label: "调整数量",
                            prop: "amount"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input_number, {
                                modelValue: unref(adjustForm).amount,
                                "onUpdate:modelValue": ($event) => unref(adjustForm).amount = $event,
                                style: { "width": "100%" }
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, {
                            label: "调整说明",
                            prop: "description"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_input, {
                                modelValue: unref(adjustForm).description,
                                "onUpdate:modelValue": ($event) => unref(adjustForm).description = $event,
                                type: "textarea",
                                rows: 3,
                                placeholder: "请输入调整说明"
                              }, null, 8, ["modelValue", "onUpdate:modelValue"])
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_form_item, null, {
                            default: withCtx(() => [
                              createVNode(_component_el_button, {
                                type: "primary",
                                loading: unref(adjustSubmitting),
                                onClick: handleAdjust
                              }, {
                                default: withCtx(() => [
                                  createTextVNode("提交")
                                ]),
                                _: 1
                              }, 8, ["loading"])
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["model"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              })
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_dialog, {
        modelValue: unref(ruleDialogVisible),
        "onUpdate:modelValue": ($event) => isRef(ruleDialogVisible) ? ruleDialogVisible.value = $event : null,
        title: unref(isEditingRule) ? "编辑规则" : "添加规则",
        width: "500px"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_button, {
              onClick: ($event) => ruleDialogVisible.value = false
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`取消`);
                } else {
                  return [
                    createTextVNode("取消")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              loading: unref(ruleSubmitting),
              onClick: handleSaveRule
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(`确认`);
                } else {
                  return [
                    createTextVNode("确认")
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_button, {
                onClick: ($event) => ruleDialogVisible.value = false
              }, {
                default: withCtx(() => [
                  createTextVNode("取消")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_el_button, {
                type: "primary",
                loading: unref(ruleSubmitting),
                onClick: handleSaveRule
              }, {
                default: withCtx(() => [
                  createTextVNode("确认")
                ]),
                _: 1
              }, 8, ["loading"])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_form, {
              ref_key: "ruleFormRef",
              ref: ruleFormRef,
              model: unref(ruleForm),
              rules: ruleFormRules,
              "label-width": "100px"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "规则名称",
                    prop: "name"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(ruleForm).name,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).name = $event,
                          placeholder: "请输入规则名称"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(ruleForm).name,
                            "onUpdate:modelValue": ($event) => unref(ruleForm).name = $event,
                            placeholder: "请输入规则名称"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "积分类型",
                    prop: "pointType"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(ruleForm).pointType,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).pointType = $event,
                          placeholder: "请选择积分类型"
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "活动积分",
                                value: "activity"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "捐助积分",
                                value: "donation"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "活动积分",
                                  value: "activity"
                                }),
                                createVNode(_component_el_option, {
                                  label: "捐助积分",
                                  value: "donation"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: unref(ruleForm).pointType,
                            "onUpdate:modelValue": ($event) => unref(ruleForm).pointType = $event,
                            placeholder: "请选择积分类型"
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                label: "活动积分",
                                value: "activity"
                              }),
                              createVNode(_component_el_option, {
                                label: "捐助积分",
                                value: "donation"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "积分值",
                    prop: "amount"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(ruleForm).amount,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).amount = $event,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(ruleForm).amount,
                            "onUpdate:modelValue": ($event) => unref(ruleForm).amount = $event,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "描述",
                    prop: "description"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(ruleForm).description,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).description = $event,
                          type: "textarea",
                          rows: 3,
                          placeholder: "请输入描述"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(ruleForm).description,
                            "onUpdate:modelValue": ($event) => unref(ruleForm).description = $event,
                            type: "textarea",
                            rows: 3,
                            placeholder: "请输入描述"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, {
                      label: "规则名称",
                      prop: "name"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(ruleForm).name,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).name = $event,
                          placeholder: "请输入规则名称"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "积分类型",
                      prop: "pointType"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(ruleForm).pointType,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).pointType = $event,
                          placeholder: "请选择积分类型"
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "活动积分",
                              value: "activity"
                            }),
                            createVNode(_component_el_option, {
                              label: "捐助积分",
                              value: "donation"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "积分值",
                      prop: "amount"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(ruleForm).amount,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).amount = $event,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "描述",
                      prop: "description"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(ruleForm).description,
                          "onUpdate:modelValue": ($event) => unref(ruleForm).description = $event,
                          type: "textarea",
                          rows: 3,
                          placeholder: "请输入描述"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_form, {
                ref_key: "ruleFormRef",
                ref: ruleFormRef,
                model: unref(ruleForm),
                rules: ruleFormRules,
                "label-width": "100px"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, {
                    label: "规则名称",
                    prop: "name"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(ruleForm).name,
                        "onUpdate:modelValue": ($event) => unref(ruleForm).name = $event,
                        placeholder: "请输入规则名称"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "积分类型",
                    prop: "pointType"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: unref(ruleForm).pointType,
                        "onUpdate:modelValue": ($event) => unref(ruleForm).pointType = $event,
                        placeholder: "请选择积分类型"
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_option, {
                            label: "活动积分",
                            value: "activity"
                          }),
                          createVNode(_component_el_option, {
                            label: "捐助积分",
                            value: "donation"
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "积分值",
                    prop: "amount"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(ruleForm).amount,
                        "onUpdate:modelValue": ($event) => unref(ruleForm).amount = $event,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "描述",
                    prop: "description"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(ruleForm).description,
                        "onUpdate:modelValue": ($event) => unref(ruleForm).description = $event,
                        type: "textarea",
                        rows: 3,
                        placeholder: "请输入描述"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["model"])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/points/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-ecfa173d"]]);

export { index as default };
//# sourceMappingURL=index-psr3H3u0.mjs.map
