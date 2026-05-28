import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth } from './index-DjsCpFrD.mjs';
import { a as ElSelect, E as ElOption } from './el-select-Bnkp58fp.mjs';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { E as ElTable, v as vLoading, a as ElTableColumn } from './el-loading-D9GVmp6R.mjs';
import { E as ElAvatar } from './el-avatar-DugEtJum.mjs';
import { E as ElTag } from './el-tag-C3TbsKo4.mjs';
import { E as ElPagination } from './el-pagination-DnbL3VzV.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, withDirectives, openBlock, createBlock, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDirectiveProps, ssrInterpolate } from 'vue/server-renderer';
import { _ as _export_sfc, v as useRouter } from './server.mjs';
import './base-C_ywmTr3.mjs';
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
    const loading = ref(false);
    const users = ref([]);
    const searchForm = reactive({
      keyword: "",
      role: "",
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
    const loadUsers = async () => {
      loading.value = true;
      try {
        const res = await fetchWithAuth("/api/admin/users", {
          params: {
            page: pagination.page,
            pageSize: pagination.pageSize,
            keyword: searchForm.keyword || void 0,
            role: searchForm.role || void 0,
            status: searchForm.status || void 0
          }
        });
        users.value = res.data || res.items || [];
        pagination.total = res.total || 0;
      } catch {
        ElMessage.error("加载用户列表失败");
      } finally {
        loading.value = false;
      }
    };
    const handleSearch = () => {
      pagination.page = 1;
      loadUsers();
    };
    const handleReset = () => {
      searchForm.keyword = "";
      searchForm.role = "";
      searchForm.status = "";
      pagination.page = 1;
      loadUsers();
    };
    const handleView = (row) => {
      router.push(`/admin/users/${row.id}`);
    };
    const handleToggleFreeze = async (row) => {
      const action = row.status === "frozen" ? "解冻" : "冻结";
      try {
        await fetchWithAuth(`/api/admin/users/${row.id}/status`, {
          method: "PUT",
          body: { status: row.status === "frozen" ? "active" : "frozen" }
        });
        ElMessage.success(`${action}成功`);
        loadUsers();
      } catch {
        ElMessage.error(`${action}失败`);
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
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_avatar = ElAvatar;
      const _component_el_tag = ElTag;
      const _component_el_pagination = ElPagination;
      const _directive_loading = vLoading;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "users-page" }, _attrs))} data-v-4b84aeec>`);
      _push(ssrRenderComponent(_component_el_card, { shadow: "hover" }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
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
                          placeholder: "昵称/手机号/会员号",
                          clearable: ""
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(searchForm).keyword,
                            "onUpdate:modelValue": ($event) => unref(searchForm).keyword = $event,
                            placeholder: "昵称/手机号/会员号",
                            clearable: ""
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "角色" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(searchForm).role,
                          "onUpdate:modelValue": ($event) => unref(searchForm).role = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "志愿者",
                                value: "volunteer"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "领队",
                                value: "leader"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "管理员",
                                value: "admin"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "志愿者",
                                  value: "volunteer"
                                }),
                                createVNode(_component_el_option, {
                                  label: "领队",
                                  value: "leader"
                                }),
                                createVNode(_component_el_option, {
                                  label: "管理员",
                                  value: "admin"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: unref(searchForm).role,
                            "onUpdate:modelValue": ($event) => unref(searchForm).role = $event,
                            placeholder: "全部",
                            clearable: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                label: "志愿者",
                                value: "volunteer"
                              }),
                              createVNode(_component_el_option, {
                                label: "领队",
                                value: "leader"
                              }),
                              createVNode(_component_el_option, {
                                label: "管理员",
                                value: "admin"
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
                                label: "正常",
                                value: "active"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "冻结",
                                value: "frozen"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "禁用",
                                value: "disabled"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "正常",
                                  value: "active"
                                }),
                                createVNode(_component_el_option, {
                                  label: "冻结",
                                  value: "frozen"
                                }),
                                createVNode(_component_el_option, {
                                  label: "禁用",
                                  value: "disabled"
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
                                label: "正常",
                                value: "active"
                              }),
                              createVNode(_component_el_option, {
                                label: "冻结",
                                value: "frozen"
                              }),
                              createVNode(_component_el_option, {
                                label: "禁用",
                                value: "disabled"
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
                          placeholder: "昵称/手机号/会员号",
                          clearable: ""
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "角色" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).role,
                          "onUpdate:modelValue": ($event) => unref(searchForm).role = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "志愿者",
                              value: "volunteer"
                            }),
                            createVNode(_component_el_option, {
                              label: "领队",
                              value: "leader"
                            }),
                            createVNode(_component_el_option, {
                              label: "管理员",
                              value: "admin"
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
                              label: "正常",
                              value: "active"
                            }),
                            createVNode(_component_el_option, {
                              label: "冻结",
                              value: "frozen"
                            }),
                            createVNode(_component_el_option, {
                              label: "禁用",
                              value: "disabled"
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
          } else {
            return [
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
                        placeholder: "昵称/手机号/会员号",
                        clearable: ""
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { label: "角色" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: unref(searchForm).role,
                        "onUpdate:modelValue": ($event) => unref(searchForm).role = $event,
                        placeholder: "全部",
                        clearable: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_option, {
                            label: "志愿者",
                            value: "volunteer"
                          }),
                          createVNode(_component_el_option, {
                            label: "领队",
                            value: "leader"
                          }),
                          createVNode(_component_el_option, {
                            label: "管理员",
                            value: "admin"
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
                            label: "正常",
                            value: "active"
                          }),
                          createVNode(_component_el_option, {
                            label: "冻结",
                            value: "frozen"
                          }),
                          createVNode(_component_el_option, {
                            label: "禁用",
                            value: "disabled"
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
              }, 8, ["model"])
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
              data: unref(users),
              stripe: ""
            }, ssrGetDirectiveProps(_ctx, _directive_loading, unref(loading))), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "头像",
                    width: "80"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_avatar, {
                          size: 40,
                          src: row.avatar
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_avatar, {
                            size: 40,
                            src: row.avatar
                          }, null, 8, ["src"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "nickname",
                    label: "昵称"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "phone",
                    label: "手机号"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    prop: "memberNo",
                    label: "会员号"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "角色",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(roleMap[row.role] || row.role)}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(roleMap[row.role] || row.role), 1)
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
                    prop: "honorLevel",
                    label: "荣誉等级",
                    width: "100"
                  }, null, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "注册时间",
                    width: "180"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(formatDate(row.createdAt))}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(formatDate(row.createdAt)), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "操作",
                    width: "160",
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
                        _push4(ssrRenderComponent(_component_el_button, {
                          type: row.status === "frozen" ? "success" : "danger",
                          link: "",
                          onClick: ($event) => handleToggleFreeze(row)
                        }, {
                          default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`${ssrInterpolate(row.status === "frozen" ? "解冻" : "冻结")}`);
                            } else {
                              return [
                                createTextVNode(toDisplayString(row.status === "frozen" ? "解冻" : "冻结"), 1)
                              ];
                            }
                          }),
                          _: 2
                        }, _parent4, _scopeId3));
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
                          createVNode(_component_el_button, {
                            type: row.status === "frozen" ? "success" : "danger",
                            link: "",
                            onClick: ($event) => handleToggleFreeze(row)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(toDisplayString(row.status === "frozen" ? "解冻" : "冻结"), 1)
                            ]),
                            _: 2
                          }, 1032, ["type", "onClick"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_table_column, {
                      label: "头像",
                      width: "80"
                    }, {
                      default: withCtx(({ row }) => [
                        createVNode(_component_el_avatar, {
                          size: 40,
                          src: row.avatar
                        }, null, 8, ["src"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "nickname",
                      label: "昵称"
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "phone",
                      label: "手机号"
                    }),
                    createVNode(_component_el_table_column, {
                      prop: "memberNo",
                      label: "会员号"
                    }),
                    createVNode(_component_el_table_column, {
                      label: "角色",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(roleMap[row.role] || row.role), 1)
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
                      prop: "honorLevel",
                      label: "荣誉等级",
                      width: "100"
                    }),
                    createVNode(_component_el_table_column, {
                      label: "注册时间",
                      width: "180"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(formatDate(row.createdAt)), 1)
                      ]),
                      _: 1
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
                          onClick: ($event) => handleView(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode("查看")
                          ]),
                          _: 1
                        }, 8, ["onClick"]),
                        createVNode(_component_el_button, {
                          type: row.status === "frozen" ? "success" : "danger",
                          link: "",
                          onClick: ($event) => handleToggleFreeze(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(toDisplayString(row.status === "frozen" ? "解冻" : "冻结"), 1)
                          ]),
                          _: 2
                        }, 1032, ["type", "onClick"])
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="pagination-wrap" data-v-4b84aeec${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_pagination, {
              "current-page": unref(pagination).page,
              "onUpdate:currentPage": ($event) => unref(pagination).page = $event,
              "page-size": unref(pagination).pageSize,
              "onUpdate:pageSize": ($event) => unref(pagination).pageSize = $event,
              total: unref(pagination).total,
              "page-sizes": [10, 20, 50],
              layout: "total, sizes, prev, pager, next, jumper",
              onSizeChange: loadUsers,
              onCurrentChange: loadUsers
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              withDirectives((openBlock(), createBlock(_component_el_table, {
                data: unref(users),
                stripe: ""
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_table_column, {
                    label: "头像",
                    width: "80"
                  }, {
                    default: withCtx(({ row }) => [
                      createVNode(_component_el_avatar, {
                        size: 40,
                        src: row.avatar
                      }, null, 8, ["src"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "nickname",
                    label: "昵称"
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "phone",
                    label: "手机号"
                  }),
                  createVNode(_component_el_table_column, {
                    prop: "memberNo",
                    label: "会员号"
                  }),
                  createVNode(_component_el_table_column, {
                    label: "角色",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(roleMap[row.role] || row.role), 1)
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
                    prop: "honorLevel",
                    label: "荣誉等级",
                    width: "100"
                  }),
                  createVNode(_component_el_table_column, {
                    label: "注册时间",
                    width: "180"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(formatDate(row.createdAt)), 1)
                    ]),
                    _: 1
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
                        onClick: ($event) => handleView(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode("查看")
                        ]),
                        _: 1
                      }, 8, ["onClick"]),
                      createVNode(_component_el_button, {
                        type: row.status === "frozen" ? "success" : "danger",
                        link: "",
                        onClick: ($event) => handleToggleFreeze(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(toDisplayString(row.status === "frozen" ? "解冻" : "冻结"), 1)
                        ]),
                        _: 2
                      }, 1032, ["type", "onClick"])
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
                  onSizeChange: loadUsers,
                  onCurrentChange: loadUsers
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/users/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-4b84aeec"]]);

export { index as default };
//# sourceMappingURL=index-BOUzBWwg.mjs.map
