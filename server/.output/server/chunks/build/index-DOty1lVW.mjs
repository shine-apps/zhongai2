import { a as ElRow, E as ElCol } from './el-col-D_20p50U.mjs';
import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElIcon, a5 as user_default, k as calendar_default, t as document_default, o as coin_default, Q as plus_default, a7 as withInstall, j as buildProps, s as definePropType } from './base-C_ywmTr3.mjs';
import { _ as _export_sfc, k as navigateTo, p as useNamespace, c as isNumber } from './server.mjs';
import { defineComponent, reactive, mergeProps, withCtx, unref, createVNode, createTextVNode, computed, openBlock, createElementBlock, normalizeClass, renderSlot, toDisplayString, createCommentVNode, createElementVNode, normalizeStyle, useSSRContext } from 'vue';
import { isFunction } from '@vue/shared';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import 'lodash-unified';
import '@vueuse/core';
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
import '@ctrl/tinycolor';

const statisticProps = buildProps({
  /**
  * @description Setting the decimal point
  */
  decimalSeparator: {
    type: String,
    default: "."
  },
  /**
  * @description Sets the thousandth identifier
  */
  groupSeparator: {
    type: String,
    default: ","
  },
  /**
  * @description numerical precision
  */
  precision: {
    type: Number,
    default: 0
  },
  /**
  * @description Custom numerical presentation
  */
  formatter: Function,
  /**
  * @description Numerical content
  */
  value: {
    type: definePropType([Number, Object]),
    default: 0
  },
  /**
  * @description Sets the prefix of a number
  */
  prefix: String,
  /**
  * @description  Sets the suffix of a number
  */
  suffix: String,
  /**
  * @description Numeric titles
  */
  title: String,
  /**
  * @description Styles numeric values
  */
  valueStyle: {
    type: definePropType([
      String,
      Object,
      Array,
      Boolean
    ]),
    default: void 0
  }
});
var statistic_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElStatistic",
  __name: "statistic",
  props: statisticProps,
  setup(__props, { expose: __expose }) {
    const props = __props;
    const ns = useNamespace("statistic");
    const displayValue = computed(() => {
      const { value, formatter, precision, decimalSeparator, groupSeparator } = props;
      if (isFunction(formatter)) return formatter(value);
      if (!isNumber(value) || Number.isNaN(value)) return value;
      let [integer, decimal = ""] = String(value).split(".");
      decimal = decimal.padEnd(precision, "0").slice(0, precision > 0 ? precision : 0);
      integer = integer.replace(/\B(?=(\d{3})+(?!\d))/g, groupSeparator);
      return [integer, decimal].join(decimal ? decimalSeparator : "");
    });
    __expose({
      /**
      * @description current display value
      */
      displayValue
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", { class: normalizeClass(unref(ns).b()) }, [_ctx.$slots.title || __props.title ? (openBlock(), createElementBlock("div", {
        key: 0,
        class: normalizeClass(unref(ns).e("head"))
      }, [renderSlot(_ctx.$slots, "title", {}, () => [createTextVNode(toDisplayString(__props.title), 1)])], 2)) : createCommentVNode("v-if", true), createElementVNode("div", { class: normalizeClass(unref(ns).e("content")) }, [
        _ctx.$slots.prefix || __props.prefix ? (openBlock(), createElementBlock("div", {
          key: 0,
          class: normalizeClass(unref(ns).e("prefix"))
        }, [renderSlot(_ctx.$slots, "prefix", {}, () => [createElementVNode("span", null, toDisplayString(__props.prefix), 1)])], 2)) : createCommentVNode("v-if", true),
        createElementVNode("span", {
          class: normalizeClass(unref(ns).e("number")),
          style: normalizeStyle(__props.valueStyle)
        }, toDisplayString(displayValue.value), 7),
        _ctx.$slots.suffix || __props.suffix ? (openBlock(), createElementBlock("div", {
          key: 1,
          class: normalizeClass(unref(ns).e("suffix"))
        }, [renderSlot(_ctx.$slots, "suffix", {}, () => [createElementVNode("span", null, toDisplayString(__props.suffix), 1)])], 2)) : createCommentVNode("v-if", true)
      ], 2)], 2);
    };
  }
});
var statistic_default = statistic_vue_vue_type_script_setup_true_lang_default;
const ElStatistic = withInstall(statistic_default);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const stats = reactive({
      totalUsers: 0,
      totalActivities: 0,
      pendingDonations: 0,
      monthlyPointsIssued: 0
    });
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_row = ElRow;
      const _component_el_col = ElCol;
      const _component_el_card = ElCard;
      const _component_el_statistic = ElStatistic;
      const _component_el_icon = ElIcon;
      const _component_el_button = ElButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "dashboard" }, _attrs))} data-v-18d554cc>`);
      _push(ssrRenderComponent(_component_el_row, {
        gutter: 20,
        class: "stat-row"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_col, { span: 6 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_statistic, {
                          title: "总用户数",
                          value: unref(stats).totalUsers
                        }, {
                          prefix: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(user_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(user_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(user_default))
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
                          createVNode(_component_el_statistic, {
                            title: "总用户数",
                            value: unref(stats).totalUsers
                          }, {
                            prefix: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(user_default))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["value"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, {
                      shadow: "hover",
                      class: "stat-card"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_statistic, {
                          title: "总用户数",
                          value: unref(stats).totalUsers
                        }, {
                          prefix: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(user_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["value"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_col, { span: 6 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_statistic, {
                          title: "活动数量",
                          value: unref(stats).totalActivities
                        }, {
                          prefix: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(calendar_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(calendar_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(calendar_default))
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
                          createVNode(_component_el_statistic, {
                            title: "活动数量",
                            value: unref(stats).totalActivities
                          }, {
                            prefix: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(calendar_default))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["value"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, {
                      shadow: "hover",
                      class: "stat-card"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_statistic, {
                          title: "活动数量",
                          value: unref(stats).totalActivities
                        }, {
                          prefix: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(calendar_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["value"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_col, { span: 6 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_statistic, {
                          title: "待审核捐助",
                          value: unref(stats).pendingDonations
                        }, {
                          prefix: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(document_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(document_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(document_default))
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
                          createVNode(_component_el_statistic, {
                            title: "待审核捐助",
                            value: unref(stats).pendingDonations
                          }, {
                            prefix: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(document_default))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["value"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, {
                      shadow: "hover",
                      class: "stat-card"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_statistic, {
                          title: "待审核捐助",
                          value: unref(stats).pendingDonations
                        }, {
                          prefix: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(document_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["value"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(ssrRenderComponent(_component_el_col, { span: 6 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_statistic, {
                          title: "本月积分发放",
                          value: unref(stats).monthlyPointsIssued
                        }, {
                          prefix: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(coin_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(coin_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(coin_default))
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
                          createVNode(_component_el_statistic, {
                            title: "本月积分发放",
                            value: unref(stats).monthlyPointsIssued
                          }, {
                            prefix: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(coin_default))
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["value"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_card, {
                      shadow: "hover",
                      class: "stat-card"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_statistic, {
                          title: "本月积分发放",
                          value: unref(stats).monthlyPointsIssued
                        }, {
                          prefix: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(coin_default))
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["value"])
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
              createVNode(_component_el_col, { span: 6 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_statistic, {
                        title: "总用户数",
                        value: unref(stats).totalUsers
                      }, {
                        prefix: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(user_default))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["value"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, { span: 6 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_statistic, {
                        title: "活动数量",
                        value: unref(stats).totalActivities
                      }, {
                        prefix: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(calendar_default))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["value"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, { span: 6 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_statistic, {
                        title: "待审核捐助",
                        value: unref(stats).pendingDonations
                      }, {
                        prefix: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(document_default))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["value"])
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }),
              createVNode(_component_el_col, { span: 6 }, {
                default: withCtx(() => [
                  createVNode(_component_el_card, {
                    shadow: "hover",
                    class: "stat-card"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_statistic, {
                        title: "本月积分发放",
                        value: unref(stats).monthlyPointsIssued
                      }, {
                        prefix: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(coin_default))
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["value"])
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
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "action-card"
      }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<span data-v-18d554cc${_scopeId}>快捷操作</span>`);
          } else {
            return [
              createVNode("span", null, "快捷操作")
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_row, { gutter: 20 }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_col, { span: 8 }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "primary",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities/create")
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
                              _push5(` 创建活动 `);
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(plus_default))
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" 创建活动 ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "primary",
                            size: "large",
                            class: "action-btn",
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities/create")
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(plus_default))
                                ]),
                                _: 1
                              }),
                              createTextVNode(" 创建活动 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_col, { span: 8 }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "warning",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/donations")
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(document_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(document_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` 审核捐助 `);
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(document_default))
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" 审核捐助 ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "warning",
                            size: "large",
                            class: "action-btn",
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/donations")
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(document_default))
                                ]),
                                _: 1
                              }),
                              createTextVNode(" 审核捐助 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_col, { span: 8 }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "success",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/points")
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_icon, null, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(ssrRenderComponent(unref(coin_default), null, null, _parent6, _scopeId5));
                                  } else {
                                    return [
                                      createVNode(unref(coin_default))
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(` 积分调整 `);
                            } else {
                              return [
                                createVNode(_component_el_icon, null, {
                                  default: withCtx(() => [
                                    createVNode(unref(coin_default))
                                  ]),
                                  _: 1
                                }),
                                createTextVNode(" 积分调整 ")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "success",
                            size: "large",
                            class: "action-btn",
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/points")
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_icon, null, {
                                default: withCtx(() => [
                                  createVNode(unref(coin_default))
                                ]),
                                _: 1
                              }),
                              createTextVNode(" 积分调整 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities/create")
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(plus_default))
                              ]),
                              _: 1
                            }),
                            createTextVNode(" 创建活动 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "warning",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/donations")
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(document_default))
                              ]),
                              _: 1
                            }),
                            createTextVNode(" 审核捐助 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_col, { span: 8 }, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "success",
                          size: "large",
                          class: "action-btn",
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/points")
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_icon, null, {
                              default: withCtx(() => [
                                createVNode(unref(coin_default))
                              ]),
                              _: 1
                            }),
                            createTextVNode(" 积分调整 ")
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
            }, _parent2, _scopeId));
          } else {
            return [
              createVNode(_component_el_row, { gutter: 20 }, {
                default: withCtx(() => [
                  createVNode(_component_el_col, { span: 8 }, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        size: "large",
                        class: "action-btn",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities/create")
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(plus_default))
                            ]),
                            _: 1
                          }),
                          createTextVNode(" 创建活动 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_col, { span: 8 }, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "warning",
                        size: "large",
                        class: "action-btn",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/donations")
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(document_default))
                            ]),
                            _: 1
                          }),
                          createTextVNode(" 审核捐助 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_col, { span: 8 }, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "success",
                        size: "large",
                        class: "action-btn",
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/points")
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_icon, null, {
                            default: withCtx(() => [
                              createVNode(unref(coin_default))
                            ]),
                            _: 1
                          }),
                          createTextVNode(" 积分调整 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-18d554cc"]]);

export { index as default };
//# sourceMappingURL=index-DOty1lVW.mjs.map
