import { E as ElPageHeader } from './el-page-header-BdXYwsWk.mjs';
import { a as ElRow, E as ElCol } from './el-col-D_20p50U.mjs';
import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElAvatar } from './el-avatar-DugEtJum.mjs';
import { a7 as withInstall, a9 as withNoopInstall, $ as useFormSize, j as buildProps, a4 as useSizeProp, s as definePropType, c as addUnit } from './base-C_ywmTr3.mjs';
import { f as flattedChildren, g as getNormalizedProps } from './index-DX-1AO13.mjs';
import { _ as _export_sfc, s as useRoute, v as useRouter, p as useNamespace } from './server.mjs';
import { isNil } from 'lodash-unified';
import { defineComponent, reactive, mergeProps, unref, withCtx, createTextVNode, toDisplayString, createVNode, useSlots, provide, computed, openBlock, createElementBlock, normalizeClass, createElementVNode, renderSlot, createCommentVNode, Fragment, renderList, createBlock, inject, withDirectives, h, useSSRContext } from 'vue';
import { E as ElTag } from './el-tag-C3TbsKo4.mjs';
import { ssrRenderAttrs, ssrRenderComponent, ssrInterpolate } from 'vue/server-renderer';
import '@vue/shared';
import '@popperjs/core';
import '@vueuse/core';
import './event-YY_EUtOs.mjs';
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

const descriptionProps = buildProps({
  /**
  * @description with or without border
  */
  border: Boolean,
  /**
  * @description numbers of `Descriptions Item` in one line
  */
  column: {
    type: Number,
    default: 3
  },
  /**
  * @description direction of list
  */
  direction: {
    type: String,
    values: ["horizontal", "vertical"],
    default: "horizontal"
  },
  /**
  * @description size of list
  */
  size: useSizeProp,
  /**
  * @description title text, display on the top left
  */
  title: {
    type: String,
    default: ""
  },
  /**
  * @description extra text, display on the top right
  */
  extra: {
    type: String,
    default: ""
  },
  /**
  * @description width of every label column
  */
  labelWidth: { type: [String, Number] }
});
const descriptionsKey = /* @__PURE__ */ Symbol("elDescriptions");
const descriptionsRowProps = buildProps({ row: {
  type: definePropType(Array),
  default: () => []
} });
var descriptions_cell_default = defineComponent({
  name: "ElDescriptionsCell",
  props: {
    cell: { type: Object },
    tag: {
      type: String,
      default: "td"
    },
    type: { type: String }
  },
  setup() {
    return { descriptions: inject(descriptionsKey, {}) };
  },
  render() {
    const item = getNormalizedProps(this.cell);
    const directives = (this.cell?.dirs || []).map((dire) => {
      const { dir, arg, modifiers, value } = dire;
      return [
        dir,
        value,
        arg,
        modifiers
      ];
    });
    const { border, direction } = this.descriptions;
    const isVertical = direction === "vertical";
    const renderLabel = () => this.cell?.children?.label?.() || item.label;
    const renderContent = () => this.cell?.children?.default?.();
    const span = item.span;
    const rowspan = item.rowspan;
    const align = item.align ? `is-${item.align}` : "";
    const labelAlign = item.labelAlign ? `is-${item.labelAlign}` : align;
    const className = item.className;
    const labelClassName = item.labelClassName;
    const style = {
      width: addUnit(this.type === "label" ? item.labelWidth ?? this.descriptions.labelWidth ?? item.width : item.width),
      minWidth: addUnit(item.minWidth)
    };
    const ns = useNamespace("descriptions");
    switch (this.type) {
      case "label":
        return withDirectives(h(this.tag, {
          style,
          class: [
            ns.e("cell"),
            ns.e("label"),
            ns.is("bordered-label", border),
            ns.is("vertical-label", isVertical),
            labelAlign,
            labelClassName
          ],
          colSpan: isVertical ? span : 1,
          rowspan: isVertical ? 1 : rowspan
        }, renderLabel()), directives);
      case "content":
        return withDirectives(h(this.tag, {
          style,
          class: [
            ns.e("cell"),
            ns.e("content"),
            ns.is("bordered-content", border),
            ns.is("vertical-content", isVertical),
            align,
            className
          ],
          colSpan: isVertical ? span : span * 2 - 1,
          rowspan: isVertical ? rowspan * 2 - 1 : rowspan
        }, renderContent()), directives);
      default: {
        const label = renderLabel();
        const labelStyle = {};
        const width = addUnit(item.labelWidth ?? this.descriptions.labelWidth);
        if (width) {
          labelStyle.width = width;
          labelStyle.display = "inline-block";
        }
        return withDirectives(h("td", {
          style,
          class: [ns.e("cell"), align],
          colSpan: span,
          rowspan
        }, [!isNil(label) ? h("span", {
          style: labelStyle,
          class: [ns.e("label"), labelClassName]
        }, label) : void 0, h("span", { class: [ns.e("content"), className] }, renderContent())]), directives);
      }
    }
  }
});
const _hoisted_1 = { key: 1 };
var descriptions_row_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDescriptionsRow",
  __name: "descriptions-row",
  props: descriptionsRowProps,
  setup(__props) {
    const descriptions = inject(descriptionsKey, {});
    return (_ctx, _cache) => {
      return unref(descriptions).direction === "vertical" ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createElementVNode("tr", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.row, (cell, _index) => {
        return openBlock(), createBlock(unref(descriptions_cell_default), {
          key: `tr1-${_index}`,
          cell,
          tag: "th",
          type: "label"
        }, null, 8, ["cell"]);
      }), 128))]), createElementVNode("tr", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.row, (cell, _index) => {
        return openBlock(), createBlock(unref(descriptions_cell_default), {
          key: `tr2-${_index}`,
          cell,
          tag: "td",
          type: "content"
        }, null, 8, ["cell"]);
      }), 128))])], 64)) : (openBlock(), createElementBlock("tr", _hoisted_1, [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.row, (cell, _index) => {
        return openBlock(), createElementBlock(Fragment, { key: `tr3-${_index}` }, [unref(descriptions).border ? (openBlock(), createElementBlock(Fragment, { key: 0 }, [createVNode(unref(descriptions_cell_default), {
          cell,
          tag: "td",
          type: "label"
        }, null, 8, ["cell"]), createVNode(unref(descriptions_cell_default), {
          cell,
          tag: "td",
          type: "content"
        }, null, 8, ["cell"])], 64)) : (openBlock(), createBlock(unref(descriptions_cell_default), {
          key: 1,
          cell,
          tag: "td",
          type: "both"
        }, null, 8, ["cell"]))], 64);
      }), 128))]));
    };
  }
});
var descriptions_row_default = descriptions_row_vue_vue_type_script_setup_true_lang_default;
const COMPONENT_NAME = "ElDescriptionsItem";
var description_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElDescriptions",
  __name: "description",
  props: descriptionProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("descriptions");
    const descriptionsSize = useFormSize();
    const slots = useSlots();
    provide(descriptionsKey, props);
    const descriptionKls = computed(() => [ns.b(), ns.m(descriptionsSize.value)]);
    const filledNode = (node, span, count, isLast = false) => {
      if (!node.props) node.props = {};
      if (span > count) node.props.span = count;
      if (isLast) node.props.span = span;
      return node;
    };
    const getRows = () => {
      if (!slots.default) return [];
      const children = flattedChildren(slots.default()).filter((node) => node?.type?.name === COMPONENT_NAME);
      const rows = [];
      let temp = [];
      let count = props.column;
      let totalSpan = 0;
      const rowspanTemp = [];
      children.forEach((node, index) => {
        const span = node.props?.span || 1;
        const rowspan = node.props?.rowspan || 1;
        const rowNo = rows.length;
        rowspanTemp[rowNo] ||= 0;
        if (rowspan > 1) for (let i = 1; i < rowspan; i++) {
          rowspanTemp[rowNo + i] ||= 0;
          rowspanTemp[rowNo + i]++;
          totalSpan++;
        }
        if (rowspanTemp[rowNo] > 0) {
          count -= rowspanTemp[rowNo];
          rowspanTemp[rowNo] = 0;
        }
        if (index < children.length - 1) totalSpan += span > count ? count : span;
        if (index === children.length - 1) {
          const lastSpan = props.column - totalSpan % props.column;
          temp.push(filledNode(node, lastSpan, count, true));
          rows.push(temp);
          return;
        }
        if (span < count) {
          count -= span;
          temp.push(node);
        } else {
          temp.push(filledNode(node, span, count));
          rows.push(temp);
          count = props.column;
          temp = [];
        }
      });
      return rows;
    };
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass(descriptionKls.value) }, [__props.title || __props.extra || _ctx.$slots.title || _ctx.$slots.extra ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass(unref(ns).e("header"))
      }, [createElementVNode("div", { class: normalizeClass(unref(ns).e("title")) }, [renderSlot(_ctx.$slots, "title", {}, () => [createTextVNode(toDisplayString(__props.title), 1)])], 2), createElementVNode("div", { class: normalizeClass(unref(ns).e("extra")) }, [renderSlot(_ctx.$slots, "extra", {}, () => [createTextVNode(toDisplayString(__props.extra), 1)])], 2)], 2)) : createCommentVNode("v-if", true), createElementVNode("div", { class: normalizeClass(unref(ns).e("body")) }, [createElementVNode("table", { class: normalizeClass([unref(ns).e("table"), unref(ns).is("bordered", __props.border)]) }, [createElementVNode("tbody", null, [(openBlock(true), createElementBlock(Fragment, null, renderList(getRows(), (row, _index) => {
        return openBlock(), createBlock(descriptions_row_default, {
          key: _index,
          row
        }, null, 8, ["row"]);
      }), 128))])], 2)], 2)], 2);
    };
  }
});
var description_default = description_vue_vue_type_script_setup_true_lang_default;
const columnAlignment = [
  "left",
  "center",
  "right"
];
const descriptionItemProps = buildProps({
  /**
  * @description label text
  */
  label: {
    type: String,
    default: ""
  },
  /**
  * @description colspan of column
  */
  span: {
    type: Number,
    default: 1
  },
  /**
  * @description the number of rows a cell should span
  */
  rowspan: {
    type: Number,
    default: 1
  },
  /**
  * @description column width, the width of the same column in different rows is set by the max value (If no `border`, width contains label and content)
  */
  width: {
    type: [String, Number],
    default: ""
  },
  /**
  * @description column minimum width, columns with `width` has a fixed width, while columns with `min-width` has a width that is distributed in proportion (If no`border`, width contains label and content)
  */
  minWidth: {
    type: [String, Number],
    default: ""
  },
  /**
  * @description column label width, if not set, it will be the same as the width of the column. Higher priority than the `label-width` of `Descriptions`
  */
  labelWidth: { type: [String, Number] },
  /**
  * @description column content alignment (If no `border`, effective for both label and content)
  */
  align: {
    type: String,
    values: columnAlignment,
    default: "left"
  },
  /**
  * @description column label alignment, if omitted, the value of the above `align` attribute will be applied (If no `border`, please use `align` attribute)
  */
  labelAlign: {
    type: String,
    values: columnAlignment
  },
  /**
  * @description column content custom class name
  */
  className: {
    type: String,
    default: ""
  },
  /**
  * @description column label custom class name
  */
  labelClassName: {
    type: String,
    default: ""
  }
});
const DescriptionItem = defineComponent({
  name: COMPONENT_NAME,
  props: descriptionItemProps
});
const ElDescriptions = withInstall(description_default, { DescriptionsItem: DescriptionItem });
const ElDescriptionsItem = withNoopInstall(DescriptionItem);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "[id]",
  __ssrInlineRender: true,
  setup(__props) {
    useRoute();
    const router = useRouter();
    const roleMap = {
      volunteer: "志愿者",
      leader: "领队",
      admin: "管理员"
    };
    const statusMap = {
      active: "正常",
      frozen: "冻结",
      disabled: "禁用"
    };
    const statusTypeMap = {
      active: "success",
      frozen: "danger",
      disabled: "info"
    };
    const user = reactive({
      avatar: "",
      nickname: "",
      phone: "",
      memberNo: "",
      role: "",
      status: "",
      honorLevel: "",
      realNameVerified: false,
      activityPointsBalance: 0,
      activityPointsTotal: 0,
      donationPointsBalance: 0,
      donationPointsTotal: 0
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_page_header = ElPageHeader;
      const _component_el_row = ElRow;
      const _component_el_col = ElCol;
      const _component_el_card = ElCard;
      const _component_el_avatar = ElAvatar;
      const _component_el_descriptions = ElDescriptions;
      const _component_el_descriptions_item = ElDescriptionsItem;
      const _component_el_tag = ElTag;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "user-detail" }, _attrs))} data-v-73aa578a>`);
      _push(ssrRenderComponent(_component_el_page_header, {
        onBack: ($event) => unref(router).push("/admin/users"),
        title: "返回用户列表",
        content: "用户详情"
      }, null, _parent));
      _push(ssrRenderComponent(_component_el_row, {
        gutter: 20,
        class: "detail-row"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_col, { span: 12 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
                    header: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span data-v-73aa578a${_scopeId3}>用户信息</span>`);
                      } else {
                        return [
                          createVNode("span", null, "用户信息")
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<div class="info-section" data-v-73aa578a${_scopeId3}><div class="avatar-wrap" data-v-73aa578a${_scopeId3}>`);
                        _push4(ssrRenderComponent(_component_el_avatar, {
                          size: 80,
                          src: unref(user).avatar
                        }, null, _parent4, _scopeId3));
                        _push4(`</div>`);
                        _push4(ssrRenderComponent(_component_el_descriptions, {
                          column: 1,
                          border: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "昵称" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).nickname)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).nickname), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "手机号" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).phone)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).phone), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "会员号" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).memberNo)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).memberNo), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "角色" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_tag, null, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`${ssrInterpolate(roleMap[unref(user).role] || unref(user).role)}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_tag, null, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                        ]),
                                        _: 1
                                      })
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "状态" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_tag, {
                                      type: statusTypeMap[unref(user).status]
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`${ssrInterpolate(statusMap[unref(user).status] || unref(user).status)}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_tag, {
                                        type: statusTypeMap[unref(user).status]
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                        ]),
                                        _: 1
                                      }, 8, ["type"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "荣誉等级" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).honorLevel)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).honorLevel), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "实名认证" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(_component_el_tag, {
                                      type: unref(user).realNameVerified ? "success" : "info"
                                    }, {
                                      default: withCtx((_6, _push7, _parent7, _scopeId6) => {
                                        if (_push7) {
                                          _push7(`${ssrInterpolate(unref(user).realNameVerified ? "已认证" : "未认证")}`);
                                        } else {
                                          return [
                                            createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                          ];
                                        }
                                      }),
                                      _: 1
                                    }, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(_component_el_tag, {
                                        type: unref(user).realNameVerified ? "success" : "info"
                                      }, {
                                        default: withCtx(() => [
                                          createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                        ]),
                                        _: 1
                                      }, 8, ["type"])
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_descriptions_item, { label: "昵称" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).nickname), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "手机号" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).phone), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "会员号" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).memberNo), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "角色" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, null, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "状态" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, {
                                      type: statusTypeMap[unref(user).status]
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["type"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "荣誉等级" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).honorLevel), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "实名认证" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, {
                                      type: unref(user).realNameVerified ? "success" : "info"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["type"])
                                  ]),
                                  _: 1
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(`</div>`);
                      } else {
                        return [
                          createVNode("div", { class: "info-section" }, [
                            createVNode("div", { class: "avatar-wrap" }, [
                              createVNode(_component_el_avatar, {
                                size: 80,
                                src: unref(user).avatar
                              }, null, 8, ["src"])
                            ]),
                            createVNode(_component_el_descriptions, {
                              column: 1,
                              border: ""
                            }, {
                              default: withCtx(() => [
                                createVNode(_component_el_descriptions_item, { label: "昵称" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).nickname), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "手机号" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).phone), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "会员号" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).memberNo), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "角色" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, null, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                      ]),
                                      _: 1
                                    })
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "状态" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, {
                                      type: statusTypeMap[unref(user).status]
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["type"])
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "荣誉等级" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).honorLevel), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "实名认证" }, {
                                  default: withCtx(() => [
                                    createVNode(_component_el_tag, {
                                      type: unref(user).realNameVerified ? "success" : "info"
                                    }, {
                                      default: withCtx(() => [
                                        createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                      ]),
                                      _: 1
                                    }, 8, ["type"])
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            })
                          ])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, { shadow: "hover" }, {
                      header: withCtx(() => [
                        createVNode("span", null, "用户信息")
                      ]),
                      default: withCtx(() => [
                        createVNode("div", { class: "info-section" }, [
                          createVNode("div", { class: "avatar-wrap" }, [
                            createVNode(_component_el_avatar, {
                              size: 80,
                              src: unref(user).avatar
                            }, null, 8, ["src"])
                          ]),
                          createVNode(_component_el_descriptions, {
                            column: 1,
                            border: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_descriptions_item, { label: "昵称" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).nickname), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "手机号" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).phone), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "会员号" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).memberNo), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "角色" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_tag, null, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                    ]),
                                    _: 1
                                  })
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "状态" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_tag, {
                                    type: statusTypeMap[unref(user).status]
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["type"])
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "荣誉等级" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).honorLevel), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "实名认证" }, {
                                default: withCtx(() => [
                                  createVNode(_component_el_tag, {
                                    type: unref(user).realNameVerified ? "success" : "info"
                                  }, {
                                    default: withCtx(() => [
                                      createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                    ]),
                                    _: 1
                                  }, 8, ["type"])
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          })
                        ])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_col, { span: 12 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
                    header: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`<span data-v-73aa578a${_scopeId3}>积分账户</span>`);
                      } else {
                        return [
                          createVNode("span", null, "积分账户")
                        ];
                      }
                    }),
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_descriptions, {
                          column: 1,
                          border: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "活动积分余额" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).activityPointsBalance)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).activityPointsBalance), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "活动积分累计" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).activityPointsTotal)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).activityPointsTotal), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "捐助积分余额" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).donationPointsBalance)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).donationPointsBalance), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_descriptions_item, { label: "捐助积分累计" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`${ssrInterpolate(unref(user).donationPointsTotal)}`);
                                  } else {
                                    return [
                                      createTextVNode(toDisplayString(unref(user).donationPointsTotal), 1)
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_descriptions_item, { label: "活动积分余额" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).activityPointsBalance), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "活动积分累计" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).activityPointsTotal), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "捐助积分余额" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).donationPointsBalance), 1)
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_descriptions_item, { label: "捐助积分累计" }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).donationPointsTotal), 1)
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
                          createVNode(_component_el_descriptions, {
                            column: 1,
                            border: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_descriptions_item, { label: "活动积分余额" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).activityPointsBalance), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "活动积分累计" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).activityPointsTotal), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "捐助积分余额" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).donationPointsBalance), 1)
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_descriptions_item, { label: "捐助积分累计" }, {
                                default: withCtx(() => [
                                  createTextVNode(toDisplayString(unref(user).donationPointsTotal), 1)
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
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, { shadow: "hover" }, {
                      header: withCtx(() => [
                        createVNode("span", null, "积分账户")
                      ]),
                      default: withCtx(() => [
                        createVNode(_component_el_descriptions, {
                          column: 1,
                          border: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_descriptions_item, { label: "活动积分余额" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).activityPointsBalance), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "活动积分累计" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).activityPointsTotal), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "捐助积分余额" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).donationPointsBalance), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "捐助积分累计" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).donationPointsTotal), 1)
                              ]),
                              _: 1
                            })
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
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_col, { span: 12 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { shadow: "hover" }, {
                    header: withCtx(() => [
                      createVNode("span", null, "用户信息")
                    ]),
                    default: withCtx(() => [
                      createVNode("div", { class: "info-section" }, [
                        createVNode("div", { class: "avatar-wrap" }, [
                          createVNode(_component_el_avatar, {
                            size: 80,
                            src: unref(user).avatar
                          }, null, 8, ["src"])
                        ]),
                        createVNode(_component_el_descriptions, {
                          column: 1,
                          border: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_descriptions_item, { label: "昵称" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).nickname), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "手机号" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).phone), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "会员号" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).memberNo), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "角色" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_tag, null, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(roleMap[unref(user).role] || unref(user).role), 1)
                                  ]),
                                  _: 1
                                })
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "状态" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_tag, {
                                  type: statusTypeMap[unref(user).status]
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(statusMap[unref(user).status] || unref(user).status), 1)
                                  ]),
                                  _: 1
                                }, 8, ["type"])
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "荣誉等级" }, {
                              default: withCtx(() => [
                                createTextVNode(toDisplayString(unref(user).honorLevel), 1)
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_descriptions_item, { label: "实名认证" }, {
                              default: withCtx(() => [
                                createVNode(_component_el_tag, {
                                  type: unref(user).realNameVerified ? "success" : "info"
                                }, {
                                  default: withCtx(() => [
                                    createTextVNode(toDisplayString(unref(user).realNameVerified ? "已认证" : "未认证"), 1)
                                  ]),
                                  _: 1
                                }, 8, ["type"])
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        })
                      ])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, { span: 12 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, { shadow: "hover" }, {
                    header: withCtx(() => [
                      createVNode("span", null, "积分账户")
                    ]),
                    default: withCtx(() => [
                      createVNode(_component_el_descriptions, {
                        column: 1,
                        border: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_descriptions_item, { label: "活动积分余额" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(user).activityPointsBalance), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_descriptions_item, { label: "活动积分累计" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(user).activityPointsTotal), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_descriptions_item, { label: "捐助积分余额" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(user).donationPointsBalance), 1)
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_descriptions_item, { label: "捐助积分累计" }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(unref(user).donationPointsTotal), 1)
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      })
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
      _push(`</div>`);
    };
  }
});
const _sfc_setup = _sfc_main.setup;
_sfc_main.setup = (props, ctx) => {
  const ssrContext = useSSRContext();
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/[id].vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const _id_ = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-73aa578a"]]);

export { _id_ as default };
//# sourceMappingURL=_id_-V9s-f14r.mjs.map
