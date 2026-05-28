import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth } from './index-DjsCpFrD.mjs';
import { a as ElSelect, E as ElOption } from './el-select-Bnkp58fp.mjs';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { E as ElIcon, Q as plus_default } from './base-C_ywmTr3.mjs';
import { E as ElTable, v as vLoading, a as ElTableColumn } from './el-loading-D9GVmp6R.mjs';
import { E as ElImage } from './el-image-BilNxigT.mjs';
import { E as ElTag } from './el-tag-C3TbsKo4.mjs';
import { E as ElPagination } from './el-pagination-DnbL3VzV.mjs';
import { _ as _export_sfc, k as navigateTo } from './server.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, unref, createVNode, createTextVNode, openBlock, createBlock, toDisplayString, createCommentVNode, withDirectives, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDirectiveProps, ssrInterpolate } from 'vue/server-renderer';
import '@vue/shared';
import 'lodash-unified';
import '@vueuse/core';
import 'async-validator';
import './event-YY_EUtOs.mjs';
import './index-DX-1AO13.mjs';
import '@popperjs/core';
import './el-popper-jQIHRSBm.mjs';
import '@ctrl/tinycolor';
import 'normalize-wheel-es';
import './index-DU43QBNU.mjs';
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

const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { fetchWithAuth } = useAdminAuth();
    const statusMap = {
      draft: "草稿",
      published: "已发布",
      ongoing: "进行中",
      completed: "已完成",
      cancelled: "已取消"
    };
    const statusTypeMap = {
      draft: "info",
      published: "success",
      ongoing: "warning",
      completed: "primary",
      cancelled: "danger"
    };
    const loading = ref(false);
    const activities = ref([]);
    const searchForm = reactive({
      keyword: "",
      category: "",
      status: ""
    });
    const pagination = reactive({
      page: 1,
      pageSize: 10,
      total: 0
    });
    const formatDate = (dateStr) => {
      if (!dateStr) return "";
      return new Date(dateStr).toLocaleString("zh-CN");
    };
    const loadActivities = async () => {
      loading.value = true;
      try {
        const res = await fetchWithAuth("/api/activities", {
          params: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            keyword: searchForm.keyword || void 0,
            category: searchForm.category || void 0,
            status: searchForm.status || void 0
          }
        });
        activities.value = res.data || res.items || [];
        pagination.total = res.total || 0;
      } catch {
        ElMessage.error("加载活动列表失败");
      } finally {
        loading.value = false;
      }
    };
    const handleSearch = () => {
      pagination.page = 1;
      loadActivities();
    };
    const handleReset = () => {
      searchForm.keyword = "";
      searchForm.category = "";
      searchForm.status = "";
      pagination.page = 1;
      loadActivities();
    };
    const handleView = (row) => {
      navigateTo(`/admin/activities/${row.id}`);
    };
    const handlePublish = async (row) => {
      try {
        await fetchWithAuth(`/api/activities/${row.id}/publish`, {
          method: "PUT"
        });
        ElMessage.success("发布成功");
        loadActivities();
      } catch {
        ElMessage.error("发布失败");
      }
    };
    const handleCancel = async (row) => {
      try {
        await fetchWithAuth(`/api/activities/${row.id}/cancel`, {
          method: "PUT"
        });
        ElMessage.success("取消成功");
        loadActivities();
      } catch {
        ElMessage.error("取消失败");
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_select = ElSelect;
      const _component_el_option = ElOption;
      const _component_el_button = ElButton;
      const _component_el_icon = ElIcon;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_image = ElImage;
      const _component_el_tag = ElTag;
      const _component_el_pagination = ElPagination;
      const _directive_loading = vLoading;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "activities-page" }, _attrs))} data-v-7afa62bc>`);
      _push(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="card-header" data-v-7afa62bc${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_form, {
              inline: true,
              model: unref(searchForm),
              class: "search-form"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "关键词" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(searchForm).keyword,
                          "onUpdate:modelValue": ($event) => unref(searchForm).keyword = $event,
                          placeholder: "活动标题",
                          clearable: ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(searchForm).keyword,
                            "onUpdate:modelValue": ($event) => unref(searchForm).keyword = $event,
                            placeholder: "活动标题",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "分类" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(searchForm).category,
                          "onUpdate:modelValue": ($event) => unref(searchForm).category = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "环保",
                                value: "环保"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "助老",
                                value: "助老"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "助学",
                                value: "助学"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "社区",
                                value: "社区"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "医疗",
                                value: "医疗"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "其他",
                                value: "其他"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "环保",
                                  value: "环保"
                                }),
                                createVNode(_component_el_option, {
                                  label: "助老",
                                  value: "助老"
                                }),
                                createVNode(_component_el_option, {
                                  label: "助学",
                                  value: "助学"
                                }),
                                createVNode(_component_el_option, {
                                  label: "社区",
                                  value: "社区"
                                }),
                                createVNode(_component_el_option, {
                                  label: "医疗",
                                  value: "医疗"
                                }),
                                createVNode(_component_el_option, {
                                  label: "其他",
                                  value: "其他"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: unref(searchForm).category,
                            "onUpdate:modelValue": ($event) => unref(searchForm).category = $event,
                            placeholder: "全部",
                            clearable: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                label: "环保",
                                value: "环保"
                              }),
                              createVNode(_component_el_option, {
                                label: "助老",
                                value: "助老"
                              }),
                              createVNode(_component_el_option, {
                                label: "助学",
                                value: "助学"
                              }),
                              createVNode(_component_el_option, {
                                label: "社区",
                                value: "社区"
                              }),
                              createVNode(_component_el_option, {
                                label: "医疗",
                                value: "医疗"
                              }),
                              createVNode(_component_el_option, {
                                label: "其他",
                                value: "其他"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "状态" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(searchForm).status,
                          "onUpdate:modelValue": ($event) => unref(searchForm).status = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "草稿",
                                value: "draft"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "已发布",
                                value: "published"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "进行中",
                                value: "ongoing"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "已完成",
                                value: "completed"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "已取消",
                                value: "cancelled"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "草稿",
                                  value: "draft"
                                }),
                                createVNode(_component_el_option, {
                                  label: "已发布",
                                  value: "published"
                                }),
                                createVNode(_component_el_option, {
                                  label: "进行中",
                                  value: "ongoing"
                                }),
                                createVNode(_component_el_option, {
                                  label: "已完成",
                                  value: "completed"
                                }),
                                createVNode(_component_el_option, {
                                  label: "已取消",
                                  value: "cancelled"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: unref(searchForm).status,
                            "onUpdate:modelValue": ($event) => unref(searchForm).status = $event,
                            placeholder: "全部",
                            clearable: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                label: "草稿",
                                value: "draft"
                              }),
                              createVNode(_component_el_option, {
                                label: "已发布",
                                value: "published"
                              }),
                              createVNode(_component_el_option, {
                                label: "进行中",
                                value: "ongoing"
                              }),
                              createVNode(_component_el_option, {
                                label: "已完成",
                                value: "completed"
                              }),
                              createVNode(_component_el_option, {
                                label: "已取消",
                                value: "cancelled"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "primary",
                          onClick: handleSearch
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`搜索`);
                            } else {
                              return [
                                createTextVNode("搜索")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_el_button, { onClick: handleReset }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`重置`);
                            } else {
                              return [
                                createTextVNode("重置")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "primary",
                            onClick: handleSearch
                          }, {
                            default: withCtx(() => [
                              createTextVNode("搜索")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_button, { onClick: handleReset }, {
                            default: withCtx(() => [
                              createTextVNode("重置")
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
                    createVNode(_component_el_form_item, { label: "关键词" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(searchForm).keyword,
                          "onUpdate:modelValue": ($event) => unref(searchForm).keyword = $event,
                          placeholder: "活动标题",
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "分类" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).category,
                          "onUpdate:modelValue": ($event) => unref(searchForm).category = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "环保",
                              value: "环保"
                            }),
                            createVNode(_component_el_option, {
                              label: "助老",
                              value: "助老"
                            }),
                            createVNode(_component_el_option, {
                              label: "助学",
                              value: "助学"
                            }),
                            createVNode(_component_el_option, {
                              label: "社区",
                              value: "社区"
                            }),
                            createVNode(_component_el_option, {
                              label: "医疗",
                              value: "医疗"
                            }),
                            createVNode(_component_el_option, {
                              label: "其他",
                              value: "其他"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "状态" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).status,
                          "onUpdate:modelValue": ($event) => unref(searchForm).status = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "草稿",
                              value: "draft"
                            }),
                            createVNode(_component_el_option, {
                              label: "已发布",
                              value: "published"
                            }),
                            createVNode(_component_el_option, {
                              label: "进行中",
                              value: "ongoing"
                            }),
                            createVNode(_component_el_option, {
                              label: "已完成",
                              value: "completed"
                            }),
                            createVNode(_component_el_option, {
                              label: "已取消",
                              value: "cancelled"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          onClick: handleSearch
                        }, {
                          default: withCtx(() => [
                            createTextVNode("搜索")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_button, { onClick: handleReset }, {
                          default: withCtx(() => [
                            createTextVNode("重置")
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
            _push2(ssrRenderComponent(_component_el_button, {
              type: "primary",
              onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities/create")
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_icon, null, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(unref(plus_default), null, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(unref(plus_default))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(` 创建活动 `);
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
            }, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              createVNode("div", { class: "card-header" }, [
                createVNode(_component_el_form, {
                  inline: true,
                  model: unref(searchForm),
                  class: "search-form"
                }, {
                  default: withCtx(() => [
                    createVNode(_component_el_form_item, { label: "关键词" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(searchForm).keyword,
                          "onUpdate:modelValue": ($event) => unref(searchForm).keyword = $event,
                          placeholder: "活动标题",
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "分类" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).category,
                          "onUpdate:modelValue": ($event) => unref(searchForm).category = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "环保",
                              value: "环保"
                            }),
                            createVNode(_component_el_option, {
                              label: "助老",
                              value: "助老"
                            }),
                            createVNode(_component_el_option, {
                              label: "助学",
                              value: "助学"
                            }),
                            createVNode(_component_el_option, {
                              label: "社区",
                              value: "社区"
                            }),
                            createVNode(_component_el_option, {
                              label: "医疗",
                              value: "医疗"
                            }),
                            createVNode(_component_el_option, {
                              label: "其他",
                              value: "其他"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "状态" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).status,
                          "onUpdate:modelValue": ($event) => unref(searchForm).status = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "草稿",
                              value: "draft"
                            }),
                            createVNode(_component_el_option, {
                              label: "已发布",
                              value: "published"
                            }),
                            createVNode(_component_el_option, {
                              label: "进行中",
                              value: "ongoing"
                            }),
                            createVNode(_component_el_option, {
                              label: "已完成",
                              value: "completed"
                            }),
                            createVNode(_component_el_option, {
                              label: "已取消",
                              value: "cancelled"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          onClick: handleSearch
                        }, {
                          default: withCtx(() => [
                            createTextVNode("搜索")
                          ]),
                          _: 1
                        }),
                        createVNode(_component_el_button, { onClick: handleReset }, {
                          default: withCtx(() => [
                            createTextVNode("重置")
                          ]),
                          _: 1
                        })
                      ]),
                      _: 1
                    })
                  ]),
                  _: 1
                }, 8, ["model"]),
                createVNode(_component_el_button, {
                  type: "primary",
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
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "table-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_table, mergeProps({
              data: unref(activities),
              stripe: ""
            }, ssrGetDirectiveProps(_ctx, _directive_loading, unref(loading))), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "封面",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.coverImage) {
                          _push4(ssrRenderComponent(_component_el_image, {
                            src: row.coverImage,
                            style: { "width": "60px", "height": "60px" },
                            fit: "cover"
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<span data-v-7afa62bc${_scopeId3}>-</span>`);
                        }
                      } else {
                        return [
                          row.coverImage ? (openBlock(), createBlock(_component_el_image, {
                            key: 0,
                            src: row.coverImage,
                            style: { "width": "60px", "height": "60px" },
                            fit: "cover"
                          }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "title",
                    label: "标题",
                    "min-width": "150"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "category",
                    label: "分类",
                    width: "100"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "时间",
                    width: "180"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(formatDate(row.startTime))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(formatDate(row.startTime)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "location",
                    label: "地点",
                    width: "120"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "人数",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(row.currentParticipants || 0)}/${ssrInterpolate(row.maxParticipants || "-")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(row.currentParticipants || 0) + "/" + toDisplayString(row.maxParticipants || "-"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "状态",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_tag, {
                          type: statusTypeMap[row.status]
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(statusMap[row.status] || row.status)}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(statusMap[row.status] || row.status), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_tag, {
                            type: statusTypeMap[row.status]
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(statusMap[row.status] || row.status), 1)
                            ]),
                            _: 2
                          }, 1032, ["type"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "rewardPoints",
                    label: "积分",
                    width: "80"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "操作",
                    width: "200",
                    fixed: "right"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: "primary",
                          link: "",
                          onClick: ($event) => handleView(row)
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`查看`);
                            } else {
                              return [
                                createTextVNode("查看")
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
                        if (row.status === "draft") {
                          _push4(ssrRenderComponent(_component_el_button, {
                            type: "success",
                            link: "",
                            onClick: ($event) => handlePublish(row)
                          }, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` 发布 `);
                              } else {
                                return [
                                  createTextVNode(" 发布 ")
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                        if (row.status === "published" || row.status === "ongoing") {
                          _push4(ssrRenderComponent(_component_el_button, {
                            type: "danger",
                            link: "",
                            onClick: ($event) => handleCancel(row)
                          }, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` 取消 `);
                              } else {
                                return [
                                  createTextVNode(" 取消 ")
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<!---->`);
                        }
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "primary",
                            link: "",
                            onClick: ($event) => handleView(row)
                          }, {
                            default: withCtx(() => [
                              createTextVNode("查看")
                            ]),
                            _: 1
                          }, 8, ["onClick"]),
                          row.status === "draft" ? (openBlock(), createBlock(_component_el_button, {
                            key: 0,
                            type: "success",
                            link: "",
                            onClick: ($event) => handlePublish(row)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" 发布 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : createCommentVNode("", true),
                          row.status === "published" || row.status === "ongoing" ? (openBlock(), createBlock(_component_el_button, {
                            key: 1,
                            type: "danger",
                            link: "",
                            onClick: ($event) => handleCancel(row)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" 取消 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : createCommentVNode("", true)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_table_column, {
                      label: "封面",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        row.coverImage ? (openBlock(), createBlock(_component_el_image, {
                          key: 0,
                          src: row.coverImage,
                          style: { "width": "60px", "height": "60px" },
                          fit: "cover"
                        }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "title",
                      label: "标题",
                      "min-width": "150"
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "category",
                      label: "分类",
                      width: "100"
                    }),
                    createVNode(_component_el_table_column, {
                      label: "时间",
                      width: "180"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(formatDate(row.startTime)), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "location",
                      label: "地点",
                      width: "120"
                    }),
                    createVNode(_component_el_table_column, {
                      label: "人数",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(row.currentParticipants || 0) + "/" + toDisplayString(row.maxParticipants || "-"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "状态",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        createVNode(_component_el_tag, {
                          type: statusTypeMap[row.status]
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(statusMap[row.status] || row.status), 1)
                          ]),
                          _: 2
                        }, 1032, ["type"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "rewardPoints",
                      label: "积分",
                      width: "80"
                    }),
                    createVNode(_component_el_table_column, {
                      label: "操作",
                      width: "200",
                      fixed: "right"
                    }, {
                      default: withCtx(({ row }) => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          link: "",
                          onClick: ($event) => handleView(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("查看")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        row.status === "draft" ? (openBlock(), createBlock(_component_el_button, {
                          key: 0,
                          type: "success",
                          link: "",
                          onClick: ($event) => handlePublish(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" 发布 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : createCommentVNode("", true),
                        row.status === "published" || row.status === "ongoing" ? (openBlock(), createBlock(_component_el_button, {
                          key: 1,
                          type: "danger",
                          link: "",
                          onClick: ($event) => handleCancel(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" 取消 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : createCommentVNode("", true)
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="pagination-wrap" data-v-7afa62bc${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_pagination, {
              "current-page": unref(pagination).page,
              "onUpdate:currentPage": ($event) => unref(pagination).page = $event,
              "page-size": unref(pagination).pageSize,
              "onUpdate:pageSize": ($event) => unref(pagination).pageSize = $event,
              total: unref(pagination).total,
              "page-sizes": [10, 20, 50],
              layout: "total, sizes, prev, pager, next, jumper",
              onSizeChange: loadActivities,
              onCurrentChange: loadActivities
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              withDirectives((openBlock(), createBlock(_component_el_table, {
                data: unref(activities),
                stripe: ""
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_table_column, {
                    label: "封面",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      row.coverImage ? (openBlock(), createBlock(_component_el_image, {
                        key: 0,
                        src: row.coverImage,
                        style: { "width": "60px", "height": "60px" },
                        fit: "cover"
                      }, null, 8, ["src"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "title",
                    label: "标题",
                    "min-width": "150"
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "category",
                    label: "分类",
                    width: "100"
                  }),
                  createVNode(_component_el_table_column, {
                    label: "时间",
                    width: "180"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(formatDate(row.startTime)), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "location",
                    label: "地点",
                    width: "120"
                  }),
                  createVNode(_component_el_table_column, {
                    label: "人数",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(row.currentParticipants || 0) + "/" + toDisplayString(row.maxParticipants || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    label: "状态",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode(_component_el_tag, {
                        type: statusTypeMap[row.status]
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(statusMap[row.status] || row.status), 1)
                        ]),
                        _: 2
                      }, 1032, ["type"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "rewardPoints",
                    label: "积分",
                    width: "80"
                  }),
                  createVNode(_component_el_table_column, {
                    label: "操作",
                    width: "200",
                    fixed: "right"
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        link: "",
                        onClick: ($event) => handleView(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("查看")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      row.status === "draft" ? (openBlock(), createBlock(_component_el_button, {
                        key: 0,
                        type: "success",
                        link: "",
                        onClick: ($event) => handlePublish(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 发布 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : createCommentVNode("", true),
                      row.status === "published" || row.status === "ongoing" ? (openBlock(), createBlock(_component_el_button, {
                        key: 1,
                        type: "danger",
                        link: "",
                        onClick: ($event) => handleCancel(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 取消 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : createCommentVNode("", true)
                    ]),
                    _: 1
                  })
                ]),
                _: 1
              }, 8, ["data"])), [
                [_directive_loading, unref(loading)]
              ]),
              createVNode("div", { class: "pagination-wrap" }, [
                createVNode(_component_el_pagination, {
                  "current-page": unref(pagination).page,
                  "onUpdate:currentPage": ($event) => unref(pagination).page = $event,
                  "page-size": unref(pagination).pageSize,
                  "onUpdate:pageSize": ($event) => unref(pagination).pageSize = $event,
                  total: unref(pagination).total,
                  "page-sizes": [10, 20, 50],
                  layout: "total, sizes, prev, pager, next, jumper",
                  onSizeChange: loadActivities,
                  onCurrentChange: loadActivities
                }, null, 8, ["current-page", "onUpdate:currentPage", "page-size", "onUpdate:pageSize", "total"])
              ])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/activities/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-7afa62bc"]]);

export { index as default };
//# sourceMappingURL=index-CXmwGf9d.mjs.map
