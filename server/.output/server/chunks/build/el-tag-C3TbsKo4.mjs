import { a7 as withInstall, $ as useFormSize, a3 as useLocale, E as ElIcon, n as close_default, j as buildProps, p as componentSizes } from './base-C_ywmTr3.mjs';
import { p as useNamespace } from './server.mjs';
import { defineComponent, computed, openBlock, createElementBlock, normalizeStyle, normalizeClass, createElementVNode, unref, renderSlot, withModifiers, createVNode, withCtx, createCommentVNode, createBlock, Transition } from 'vue';

const tagProps = buildProps({
  /**
  * @description type of Tag
  */
  type: {
    type: String,
    values: [
      "primary",
      "success",
      "info",
      "warning",
      "danger"
    ],
    default: "primary"
  },
  /**
  * @description whether Tag can be removed
  */
  closable: Boolean,
  /**
  * @description whether to disable animations
  */
  disableTransitions: Boolean,
  /**
  * @description whether Tag has a highlighted border
  */
  hit: Boolean,
  /**
  * @description background color of the Tag
  */
  color: String,
  /**
  * @description size of Tag
  */
  size: {
    type: String,
    values: componentSizes
  },
  /**
  * @description theme of Tag
  */
  effect: {
    type: String,
    values: [
      "dark",
      "light",
      "plain"
    ],
    default: "light"
  },
  /**
  * @description whether Tag is rounded
  */
  round: Boolean
});
const tagEmits = {
  close: (evt) => evt instanceof MouseEvent,
  click: (evt) => evt instanceof MouseEvent
};
const _hoisted_1 = ["aria-label"];
const _hoisted_2 = ["aria-label"];
var tag_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElTag",
  __name: "tag",
  props: tagProps,
  emits: tagEmits,
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const tagSize = useFormSize();
    const { t } = useLocale();
    const ns = useNamespace("tag");
    const containerKls = computed(() => {
      const { type, hit, effect, closable, round } = props;
      return [
        ns.b(),
        ns.is("closable", closable),
        ns.m(type || "primary"),
        ns.m(tagSize.value),
        ns.m(effect),
        ns.is("hit", hit),
        ns.is("round", round)
      ];
    });
    const handleClose = (event) => {
      emit("close", event);
    };
    const handleClick = (event) => {
      emit("click", event);
    };
    const handleVNodeMounted = (vnode) => {
      if (vnode?.component?.subTree?.component?.bum) vnode.component.subTree.component.bum = null;
    };
    return (_ctx, _cache) => {
      return __props.disableTransitions ? (openBlock(), createElementBlock("span", {
        key: 0,
        class: normalizeClass(containerKls.value),
        style: normalizeStyle({ backgroundColor: __props.color }),
        onClick: handleClick
      }, [createElementVNode("span", { class: normalizeClass(unref(ns).e("content")) }, [renderSlot(_ctx.$slots, "default")], 2), __props.closable ? (openBlock(), createElementBlock("button", {
        key: 0,
        "aria-label": unref(t)("el.tag.close"),
        class: normalizeClass(unref(ns).e("close")),
        type: "button",
        onClick: withModifiers(handleClose, ["stop"])
      }, [createVNode(unref(ElIcon), null, {
        default: withCtx(() => [createVNode(unref(close_default))]),
        _: 1
      })], 10, _hoisted_1)) : createCommentVNode("v-if", true)], 6)) : (openBlock(), createBlock(Transition, {
        key: 1,
        name: `${unref(ns).namespace.value}-zoom-in-center`,
        appear: "",
        onVnodeMounted: handleVNodeMounted
      }, {
        default: withCtx(() => [createElementVNode("span", {
          class: normalizeClass(containerKls.value),
          style: normalizeStyle({ backgroundColor: __props.color }),
          onClick: handleClick
        }, [createElementVNode("span", { class: normalizeClass(unref(ns).e("content")) }, [renderSlot(_ctx.$slots, "default")], 2), __props.closable ? (openBlock(), createElementBlock("button", {
          key: 0,
          "aria-label": unref(t)("el.tag.close"),
          class: normalizeClass(unref(ns).e("close")),
          type: "button",
          onClick: withModifiers(handleClose, ["stop"])
        }, [createVNode(unref(ElIcon), null, {
          default: withCtx(() => [createVNode(unref(close_default))]),
          _: 1
        })], 10, _hoisted_2)) : createCommentVNode("v-if", true)], 6)]),
        _: 3
      }, 8, ["name"]));
    };
  }
});
var tag_default = tag_vue_vue_type_script_setup_true_lang_default;
const ElTag = withInstall(tag_default);

export { ElTag as E, tagProps as t };
//# sourceMappingURL=el-tag-C3TbsKo4.mjs.map
