import { a7 as withInstall, a1 as useGlobalConfig, j as buildProps, s as definePropType } from './base-C_ywmTr3.mjs';
import { p as useNamespace } from './server.mjs';
import { defineComponent, openBlock, createElementBlock, normalizeClass, unref, renderSlot, createTextVNode, toDisplayString, createCommentVNode, createElementVNode, normalizeStyle } from 'vue';

const cardProps = buildProps({
  /**
  * @description title of the card. Also accepts a DOM passed by `slot#header`
  */
  header: {
    type: String,
    default: ""
  },
  /**
  * @description content of footer. Also accepts a DOM passed by `slot#footer`
  */
  footer: {
    type: String,
    default: ""
  },
  /**
  * @description CSS style of card body
  */
  bodyStyle: {
    type: definePropType([
      String,
      Object,
      Array,
      Boolean
    ]),
    default: ""
  },
  /**
  * @description custom class name of card footer
  */
  headerClass: String,
  /**
  * @description custom class name of card body
  */
  bodyClass: String,
  /**
  * @description custom class name of card footer
  */
  footerClass: String,
  /**
  * @description when to show card shadows
  */
  shadow: {
    type: String,
    values: [
      "always",
      "hover",
      "never"
    ],
    default: void 0
  }
});
var card_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElCard",
  __name: "card",
  props: cardProps,
  setup(__props) {
    const globalConfig = useGlobalConfig("card");
    const ns = useNamespace("card");
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass([unref(ns).b(), unref(ns).is(`${__props.shadow || unref(globalConfig)?.shadow || "always"}-shadow`)]) }, [
        _ctx.$slots.header || __props.header ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass([unref(ns).e("header"), __props.headerClass])
        }, [renderSlot(_ctx.$slots, "header", {}, () => [createTextVNode(toDisplayString(__props.header), 1)])], 2)) : createCommentVNode("v-if", true),
        createElementVNode("div", {
          class: normalizeClass([unref(ns).e("body"), __props.bodyClass]),
          style: normalizeStyle(__props.bodyStyle)
        }, [renderSlot(_ctx.$slots, "default")], 6),
        _ctx.$slots.footer || __props.footer ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass([unref(ns).e("footer"), __props.footerClass])
        }, [renderSlot(_ctx.$slots, "footer", {}, () => [createTextVNode(toDisplayString(__props.footer), 1)])], 2)) : createCommentVNode("v-if", true)
      ], 2);
    };
  }
});
var card_default = card_vue_vue_type_script_setup_true_lang_default;
const ElCard = withInstall(card_default);

export { ElCard as E };
//# sourceMappingURL=el-card-DetSgD7E.mjs.map
