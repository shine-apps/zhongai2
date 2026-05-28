import { a7 as withInstall, a3 as useLocale, E as ElIcon, j as buildProps, h as back_default, G as iconPropType, s as definePropType } from './base-C_ywmTr3.mjs';
import { p as useNamespace } from './server.mjs';
import { defineComponent, openBlock, createElementBlock, normalizeClass, unref, renderSlot, createCommentVNode, createElementVNode, createBlock, withCtx, resolveDynamicComponent, createTextVNode, toDisplayString, createVNode, computed, normalizeStyle } from 'vue';

const pageHeaderProps = buildProps({
  /**
  * @description icon component of page header
  */
  icon: {
    type: iconPropType,
    default: () => back_default
  },
  /**
  * @description main title of page header
  */
  title: String,
  /**
  * @description content of page header
  */
  content: {
    type: String,
    default: ""
  }
});
const pageHeaderEmits = { back: () => true };
const dividerProps = buildProps({
  /**
  * @description Set divider's direction
  */
  direction: {
    type: String,
    values: ["horizontal", "vertical"],
    default: "horizontal"
  },
  /**
  * @description Set the style of divider
  */
  contentPosition: {
    type: String,
    values: [
      "left",
      "center",
      "right"
    ],
    default: "center"
  },
  /**
  * @description the position of the customized content on the divider line
  */
  borderStyle: {
    type: definePropType(String),
    default: "solid"
  }
});
var divider_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDivider",
  __name: "divider",
  props: dividerProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("divider");
    const dividerStyle = computed(() => {
      return ns.cssVar({ "border-style": props.borderStyle });
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        class: normalizeClass([unref(ns).b(), unref(ns).m(__props.direction)]),
        style: normalizeStyle(dividerStyle.value),
        role: "separator"
      }, [_ctx.$slots.default && __props.direction !== "vertical" ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass([unref(ns).e("text"), unref(ns).is(__props.contentPosition)])
      }, [renderSlot(_ctx.$slots, "default")], 2)) : createCommentVNode("v-if", true)], 6);
    };
  }
});
var divider_default = divider_vue_vue_type_script_setup_true_lang_default;
const ElDivider = withInstall(divider_default);
const _hoisted_1 = ["aria-label"];
var page_header_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElPageHeader",
  __name: "page-header",
  props: pageHeaderProps,
  emits: pageHeaderEmits,
  setup(__props, { emit: __emit }) {
    const emit = __emit;
    const { t } = useLocale();
    const ns = useNamespace("page-header");
    function handleClick() {
      emit("back");
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass([
        unref(ns).b(),
        unref(ns).is("contentful", !!_ctx.$slots.default),
        {
          [unref(ns).m("has-breadcrumb")]: !!_ctx.$slots.breadcrumb,
          [unref(ns).m("has-extra")]: !!_ctx.$slots.extra
        }
      ]) }, [
        _ctx.$slots.breadcrumb ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("breadcrumb"))
        }, [renderSlot(_ctx.$slots, "breadcrumb")], 2)) : createCommentVNode("v-if", true),
        createElementVNode("div", { class: normalizeClass(unref(ns).e("header")) }, [createElementVNode("div", { class: normalizeClass(unref(ns).e("left")) }, [
          createElementVNode("div", {
            class: normalizeClass(unref(ns).e("back")),
            role: "button",
            tabindex: "0",
            onClick: handleClick
          }, [__props.icon || _ctx.$slots.icon ? (openBlock(), createElementBlock("div", {
            key: 0,
            "aria-label": __props.title || unref(t)("el.pageHeader.title"),
            class: normalizeClass(unref(ns).e("icon"))
          }, [renderSlot(_ctx.$slots, "icon", {}, () => [__props.icon ? (openBlock(), createBlock(unref(ElIcon), { key: 0 }, {
            default: withCtx(() => [(openBlock(), createBlock(resolveDynamicComponent(__props.icon)))]),
            _: 1
          })) : createCommentVNode("v-if", true)])], 10, _hoisted_1)) : createCommentVNode("v-if", true), createElementVNode("div", { class: normalizeClass(unref(ns).e("title")) }, [renderSlot(_ctx.$slots, "title", {}, () => [createTextVNode(toDisplayString(__props.title || unref(t)("el.pageHeader.title")), 1)])], 2)], 2),
          createVNode(unref(ElDivider), { direction: "vertical" }),
          createElementVNode("div", { class: normalizeClass(unref(ns).e("content")) }, [renderSlot(_ctx.$slots, "content", {}, () => [createTextVNode(toDisplayString(__props.content), 1)])], 2)
        ], 2), _ctx.$slots.extra ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("extra"))
        }, [renderSlot(_ctx.$slots, "extra")], 2)) : createCommentVNode("v-if", true)], 2),
        _ctx.$slots.default ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(unref(ns).e("main"))
        }, [renderSlot(_ctx.$slots, "default")], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var page_header_default = page_header_vue_vue_type_script_setup_true_lang_default;
const ElPageHeader = withInstall(page_header_default);

export { ElPageHeader as E };
//# sourceMappingURL=el-page-header-BdXYwsWk.mjs.map
