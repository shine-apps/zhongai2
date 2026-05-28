import { a7 as withInstall, j as buildProps, O as mutable, s as definePropType } from './base-C_ywmTr3.mjs';
import { p as useNamespace, c as isNumber } from './server.mjs';
import { defineComponent, provide, computed, openBlock, createBlock, resolveDynamicComponent, normalizeStyle, normalizeClass, withCtx, renderSlot, inject } from 'vue';
import { isObject } from '@vue/shared';

const RowJustify = [
  "start",
  "center",
  "end",
  "space-around",
  "space-between",
  "space-evenly"
];
const RowAlign = [
  "top",
  "middle",
  "bottom"
];
const rowProps = buildProps({
  /**
  * @description custom element tag
  */
  tag: {
    type: String,
    default: "div"
  },
  /**
  * @description grid spacing
  */
  gutter: {
    type: Number,
    default: 0
  },
  /**
  * @description horizontal alignment of flex layout
  */
  justify: {
    type: String,
    values: RowJustify,
    default: "start"
  },
  /**
  * @description vertical alignment of flex layout
  */
  align: {
    type: String,
    values: RowAlign
  }
});
const rowContextKey = /* @__PURE__ */ Symbol("rowContextKey");
var row_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElRow",
  __name: "row",
  props: rowProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("row");
    provide(rowContextKey, { gutter: computed(() => props.gutter) });
    const style = computed(() => {
      const styles = {};
      if (!props.gutter) return styles;
      styles.marginRight = styles.marginLeft = `-${props.gutter / 2}px`;
      return styles;
    });
    const rowKls = computed(() => [
      ns.b(),
      ns.is(`justify-${props.justify}`, props.justify !== "start"),
      ns.is(`align-${props.align}`, !!props.align)
    ]);
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(__props.tag), {
        class: normalizeClass(rowKls.value),
        style: normalizeStyle(style.value)
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["class", "style"]);
    };
  }
});
var row_default = row_vue_vue_type_script_setup_true_lang_default;
const ElRow = withInstall(row_default);
const colProps = buildProps({
  /**
  * @description custom element tag
  */
  tag: {
    type: String,
    default: "div"
  },
  /**
  * @description number of column the grid spans
  */
  span: {
    type: Number,
    default: 24
  },
  /**
  * @description number of spacing on the left side of the grid
  */
  offset: {
    type: Number,
    default: 0
  },
  /**
  * @description number of columns that grid moves to the left
  */
  pull: {
    type: Number,
    default: 0
  },
  /**
  * @description number of columns that grid moves to the right
  */
  push: {
    type: Number,
    default: 0
  },
  /**
  * @description `<768px` Responsive columns or column props object
  */
  xs: {
    type: definePropType([Number, Object]),
    default: () => mutable({})
  },
  /**
  * @description `≥768px` Responsive columns or column props object
  */
  sm: {
    type: definePropType([Number, Object]),
    default: () => mutable({})
  },
  /**
  * @description `≥992px` Responsive columns or column props object
  */
  md: {
    type: definePropType([Number, Object]),
    default: () => mutable({})
  },
  /**
  * @description `≥1200px` Responsive columns or column props object
  */
  lg: {
    type: definePropType([Number, Object]),
    default: () => mutable({})
  },
  /**
  * @description `≥1920px` Responsive columns or column props object
  */
  xl: {
    type: definePropType([Number, Object]),
    default: () => mutable({})
  }
});
var col_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElCol",
  __name: "col",
  props: colProps,
  setup(__props) {
    const props = __props;
    const { gutter } = inject(rowContextKey, { gutter: computed(() => 0) });
    const ns = useNamespace("col");
    const style = computed(() => {
      const styles = {};
      if (gutter.value) styles.paddingLeft = styles.paddingRight = `${gutter.value / 2}px`;
      return styles;
    });
    const colKls = computed(() => {
      const classes = [];
      [
        "span",
        "offset",
        "pull",
        "push"
      ].forEach((prop) => {
        const size = props[prop];
        if (isNumber(size)) {
          if (prop === "span") classes.push(ns.b(`${props[prop]}`));
          else if (size > 0) classes.push(ns.b(`${prop}-${props[prop]}`));
        }
      });
      [
        "xs",
        "sm",
        "md",
        "lg",
        "xl"
      ].forEach((size) => {
        if (isNumber(props[size])) classes.push(ns.b(`${size}-${props[size]}`));
        else if (isObject(props[size])) Object.entries(props[size]).forEach(([prop, sizeProp]) => {
          classes.push(prop !== "span" ? ns.b(`${size}-${prop}-${sizeProp}`) : ns.b(`${size}-${sizeProp}`));
        });
      });
      if (gutter.value) classes.push(ns.is("guttered"));
      return [ns.b(), classes];
    });
    return (_ctx, _cache) => {
      return openBlock(), createBlock(resolveDynamicComponent(__props.tag), {
        class: normalizeClass(colKls.value),
        style: normalizeStyle(style.value)
      }, {
        default: withCtx(() => [renderSlot(_ctx.$slots, "default")]),
        _: 3
      }, 8, ["class", "style"]);
    };
  }
});
var col_default = col_vue_vue_type_script_setup_true_lang_default;
const ElCol = withInstall(col_default);

export { ElCol as E, ElRow as a };
//# sourceMappingURL=el-col-D_20p50U.mjs.map
