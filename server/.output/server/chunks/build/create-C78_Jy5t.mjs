import { E as ElPageHeader } from './el-page-header-BdXYwsWk.mjs';
import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth } from './index-DjsCpFrD.mjs';
import { a as ElSelect, E as ElOption } from './el-select-Bnkp58fp.mjs';
import { E as ElDatePicker } from './el-date-picker-CS33_FMf.mjs';
import { E as ElInputNumber } from './el-input-number-BAvHfJiI.mjs';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { _ as _export_sfc, k as navigateTo } from './server.mjs';
import { defineComponent, ref, reactive, mergeProps, unref, withCtx, createVNode, createTextVNode, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import './base-C_ywmTr3.mjs';
import '@vue/shared';
import 'lodash-unified';
import '@vueuse/core';
import 'async-validator';
import './event-YY_EUtOs.mjs';
import './index-DX-1AO13.mjs';
import '@popperjs/core';
import './el-popper-jQIHRSBm.mjs';
import './el-tag-C3TbsKo4.mjs';
import 'dayjs';
import './index-AIHSABAD.mjs';
import 'dayjs/plugin/customParseFormat.js';
import 'dayjs/plugin/localeData.js';
import 'dayjs/plugin/advancedFormat.js';
import 'dayjs/plugin/weekOfYear.js';
import 'dayjs/plugin/weekYear.js';
import 'dayjs/plugin/dayOfYear.js';
import 'dayjs/plugin/isSameOrAfter.js';
import 'dayjs/plugin/isSameOrBefore.js';
import '@ctrl/tinycolor';
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
  __name: "create",
  __ssrInlineRender: true,
  setup(__props) {
    const { fetchWithAuth } = useAdminAuth();
    const formRef = ref();
    const submitting = ref(false);
    const form = reactive({
      title: "",
      category: "",
      description: "",
      coverImage: "",
      startTime: null,
      endTime: null,
      location: "",
      latitude: 0,
      longitude: 0,
      checkinRadius: 500,
      maxParticipants: 50,
      rewardPoints: 10
    });
    const rules = {
      title: [{ required: true, message: "请输入活动标题", trigger: "blur" }],
      category: [{ required: true, message: "请选择分类", trigger: "change" }],
      description: [{ required: true, message: "请输入活动描述", trigger: "blur" }],
      startTime: [{ required: true, message: "请选择开始时间", trigger: "change" }],
      endTime: [{ required: true, message: "请选择结束时间", trigger: "change" }],
      location: [{ required: true, message: "请输入活动地点", trigger: "blur" }],
      maxParticipants: [{ required: true, message: "请输入最大人数", trigger: "blur" }]
    };
    const handleSubmit = async () => {
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      submitting.value = true;
      try {
        await fetchWithAuth("/api/activities", {
          method: "POST",
          body: {
            ...form,
            startTime: form.startTime ? new Date(form.startTime).toISOString() : null,
            endTime: form.endTime ? new Date(form.endTime).toISOString() : null
          }
        });
        ElMessage.success("创建活动成功");
        navigateTo("/admin/activities");
      } catch {
        ElMessage.error("创建活动失败");
      } finally {
        submitting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_page_header = ElPageHeader;
      const _component_el_card = ElCard;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_select = ElSelect;
      const _component_el_option = ElOption;
      const _component_el_date_picker = ElDatePicker;
      const _component_el_input_number = ElInputNumber;
      const _component_el_button = ElButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "activity-create" }, _attrs))} data-v-27d65649>`);
      _push(ssrRenderComponent(_component_el_page_header, {
        onBack: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities"),
        title: "返回活动列表",
        content: "创建活动"
      }, null, _parent));
      _push(ssrRenderComponent(_component_el_card, {
        shadow: "hover",
        class: "form-card"
      }, {
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: unref(form),
              rules,
              "label-width": "120px",
              style: { "max-width": "700px" }
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "活动标题",
                    prop: "title"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).title,
                          "onUpdate:modelValue": ($event) => unref(form).title = $event,
                          placeholder: "请输入活动标题"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).title,
                            "onUpdate:modelValue": ($event) => unref(form).title = $event,
                            placeholder: "请输入活动标题"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "分类",
                    prop: "category"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(form).category,
                          "onUpdate:modelValue": ($event) => unref(form).category = $event,
                          placeholder: "请选择分类"
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
                            modelValue: unref(form).category,
                            "onUpdate:modelValue": ($event) => unref(form).category = $event,
                            placeholder: "请选择分类"
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
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "活动描述",
                    prop: "description"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).description,
                          "onUpdate:modelValue": ($event) => unref(form).description = $event,
                          type: "textarea",
                          rows: 4,
                          placeholder: "请输入活动描述"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).description,
                            "onUpdate:modelValue": ($event) => unref(form).description = $event,
                            type: "textarea",
                            rows: 4,
                            placeholder: "请输入活动描述"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "封面图片",
                    prop: "coverImage"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).coverImage,
                          "onUpdate:modelValue": ($event) => unref(form).coverImage = $event,
                          placeholder: "请输入封面图片URL"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).coverImage,
                            "onUpdate:modelValue": ($event) => unref(form).coverImage = $event,
                            placeholder: "请输入封面图片URL"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "开始时间",
                    prop: "startTime"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_date_picker, {
                          modelValue: unref(form).startTime,
                          "onUpdate:modelValue": ($event) => unref(form).startTime = $event,
                          type: "datetime",
                          placeholder: "选择开始时间",
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_date_picker, {
                            modelValue: unref(form).startTime,
                            "onUpdate:modelValue": ($event) => unref(form).startTime = $event,
                            type: "datetime",
                            placeholder: "选择开始时间",
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "结束时间",
                    prop: "endTime"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_date_picker, {
                          modelValue: unref(form).endTime,
                          "onUpdate:modelValue": ($event) => unref(form).endTime = $event,
                          type: "datetime",
                          placeholder: "选择结束时间",
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_date_picker, {
                            modelValue: unref(form).endTime,
                            "onUpdate:modelValue": ($event) => unref(form).endTime = $event,
                            type: "datetime",
                            placeholder: "选择结束时间",
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "活动地点",
                    prop: "location"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).location,
                          "onUpdate:modelValue": ($event) => unref(form).location = $event,
                          placeholder: "请输入活动地点"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).location,
                            "onUpdate:modelValue": ($event) => unref(form).location = $event,
                            placeholder: "请输入活动地点"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "纬度",
                    prop: "latitude"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(form).latitude,
                          "onUpdate:modelValue": ($event) => unref(form).latitude = $event,
                          precision: 6,
                          step: 1e-3,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(form).latitude,
                            "onUpdate:modelValue": ($event) => unref(form).latitude = $event,
                            precision: 6,
                            step: 1e-3,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "经度",
                    prop: "longitude"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(form).longitude,
                          "onUpdate:modelValue": ($event) => unref(form).longitude = $event,
                          precision: 6,
                          step: 1e-3,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(form).longitude,
                            "onUpdate:modelValue": ($event) => unref(form).longitude = $event,
                            precision: 6,
                            step: 1e-3,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "签到半径(米)",
                    prop: "checkinRadius"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(form).checkinRadius,
                          "onUpdate:modelValue": ($event) => unref(form).checkinRadius = $event,
                          min: 0,
                          step: 100,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(form).checkinRadius,
                            "onUpdate:modelValue": ($event) => unref(form).checkinRadius = $event,
                            min: 0,
                            step: 100,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "最大人数",
                    prop: "maxParticipants"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(form).maxParticipants,
                          "onUpdate:modelValue": ($event) => unref(form).maxParticipants = $event,
                          min: 1,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(form).maxParticipants,
                            "onUpdate:modelValue": ($event) => unref(form).maxParticipants = $event,
                            min: 1,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, {
                    label: "奖励积分",
                    prop: "rewardPoints"
                  }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input_number, {
                          modelValue: unref(form).rewardPoints,
                          "onUpdate:modelValue": ($event) => unref(form).rewardPoints = $event,
                          min: 0,
                          style: { "width": "100%" }
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input_number, {
                            modelValue: unref(form).rewardPoints,
                            "onUpdate:modelValue": ($event) => unref(form).rewardPoints = $event,
                            min: 0,
                            style: { "width": "100%" }
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                          loading: unref(submitting),
                          onClick: handleSubmit
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`提交`);
                            } else {
                              return [
                                createTextVNode("提交")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                        _push4(ssrRenderComponent(_component_el_button, {
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities")
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(`取消`);
                            } else {
                              return [
                                createTextVNode("取消")
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_button, {
                            type: "primary",
                            loading: unref(submitting),
                            onClick: handleSubmit
                          }, {
                            default: withCtx(() => [
                              createTextVNode("提交")
                            ]),
                            _: 1
                          }, 8, ["loading"]),
                          createVNode(_component_el_button, {
                            onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities")
                          }, {
                            default: withCtx(() => [
                              createTextVNode("取消")
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
                    createVNode(_component_el_form_item, {
                      label: "活动标题",
                      prop: "title"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).title,
                          "onUpdate:modelValue": ($event) => unref(form).title = $event,
                          placeholder: "请输入活动标题"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "分类",
                      prop: "category"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(form).category,
                          "onUpdate:modelValue": ($event) => unref(form).category = $event,
                          placeholder: "请选择分类"
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
                    createVNode(_component_el_form_item, {
                      label: "活动描述",
                      prop: "description"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).description,
                          "onUpdate:modelValue": ($event) => unref(form).description = $event,
                          type: "textarea",
                          rows: 4,
                          placeholder: "请输入活动描述"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "封面图片",
                      prop: "coverImage"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).coverImage,
                          "onUpdate:modelValue": ($event) => unref(form).coverImage = $event,
                          placeholder: "请输入封面图片URL"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "开始时间",
                      prop: "startTime"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_date_picker, {
                          modelValue: unref(form).startTime,
                          "onUpdate:modelValue": ($event) => unref(form).startTime = $event,
                          type: "datetime",
                          placeholder: "选择开始时间",
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "结束时间",
                      prop: "endTime"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_date_picker, {
                          modelValue: unref(form).endTime,
                          "onUpdate:modelValue": ($event) => unref(form).endTime = $event,
                          type: "datetime",
                          placeholder: "选择结束时间",
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "活动地点",
                      prop: "location"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).location,
                          "onUpdate:modelValue": ($event) => unref(form).location = $event,
                          placeholder: "请输入活动地点"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "纬度",
                      prop: "latitude"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(form).latitude,
                          "onUpdate:modelValue": ($event) => unref(form).latitude = $event,
                          precision: 6,
                          step: 1e-3,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "经度",
                      prop: "longitude"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(form).longitude,
                          "onUpdate:modelValue": ($event) => unref(form).longitude = $event,
                          precision: 6,
                          step: 1e-3,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "签到半径(米)",
                      prop: "checkinRadius"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(form).checkinRadius,
                          "onUpdate:modelValue": ($event) => unref(form).checkinRadius = $event,
                          min: 0,
                          step: 100,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "最大人数",
                      prop: "maxParticipants"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(form).maxParticipants,
                          "onUpdate:modelValue": ($event) => unref(form).maxParticipants = $event,
                          min: 1,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, {
                      label: "奖励积分",
                      prop: "rewardPoints"
                    }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input_number, {
                          modelValue: unref(form).rewardPoints,
                          "onUpdate:modelValue": ($event) => unref(form).rewardPoints = $event,
                          min: 0,
                          style: { "width": "100%" }
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          loading: unref(submitting),
                          onClick: handleSubmit
                        }, {
                          default: withCtx(() => [
                            createTextVNode("提交")
                          ]),
                          _: 1
                        }, 8, ["loading"]),
                        createVNode(_component_el_button, {
                          onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities")
                        }, {
                          default: withCtx(() => [
                            createTextVNode("取消")
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
              createVNode(_component_el_form, {
                ref_key: "formRef",
                ref: formRef,
                model: unref(form),
                rules,
                "label-width": "120px",
                style: { "max-width": "700px" }
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, {
                    label: "活动标题",
                    prop: "title"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).title,
                        "onUpdate:modelValue": ($event) => unref(form).title = $event,
                        placeholder: "请输入活动标题"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "分类",
                    prop: "category"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: unref(form).category,
                        "onUpdate:modelValue": ($event) => unref(form).category = $event,
                        placeholder: "请选择分类"
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
                  createVNode(_component_el_form_item, {
                    label: "活动描述",
                    prop: "description"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).description,
                        "onUpdate:modelValue": ($event) => unref(form).description = $event,
                        type: "textarea",
                        rows: 4,
                        placeholder: "请输入活动描述"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "封面图片",
                    prop: "coverImage"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).coverImage,
                        "onUpdate:modelValue": ($event) => unref(form).coverImage = $event,
                        placeholder: "请输入封面图片URL"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "开始时间",
                    prop: "startTime"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_date_picker, {
                        modelValue: unref(form).startTime,
                        "onUpdate:modelValue": ($event) => unref(form).startTime = $event,
                        type: "datetime",
                        placeholder: "选择开始时间",
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "结束时间",
                    prop: "endTime"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_date_picker, {
                        modelValue: unref(form).endTime,
                        "onUpdate:modelValue": ($event) => unref(form).endTime = $event,
                        type: "datetime",
                        placeholder: "选择结束时间",
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "活动地点",
                    prop: "location"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).location,
                        "onUpdate:modelValue": ($event) => unref(form).location = $event,
                        placeholder: "请输入活动地点"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "纬度",
                    prop: "latitude"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(form).latitude,
                        "onUpdate:modelValue": ($event) => unref(form).latitude = $event,
                        precision: 6,
                        step: 1e-3,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "经度",
                    prop: "longitude"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(form).longitude,
                        "onUpdate:modelValue": ($event) => unref(form).longitude = $event,
                        precision: 6,
                        step: 1e-3,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "签到半径(米)",
                    prop: "checkinRadius"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(form).checkinRadius,
                        "onUpdate:modelValue": ($event) => unref(form).checkinRadius = $event,
                        min: 0,
                        step: 100,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "最大人数",
                    prop: "maxParticipants"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(form).maxParticipants,
                        "onUpdate:modelValue": ($event) => unref(form).maxParticipants = $event,
                        min: 1,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, {
                    label: "奖励积分",
                    prop: "rewardPoints"
                  }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input_number, {
                        modelValue: unref(form).rewardPoints,
                        "onUpdate:modelValue": ($event) => unref(form).rewardPoints = $event,
                        min: 0,
                        style: { "width": "100%" }
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, null, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        loading: unref(submitting),
                        onClick: handleSubmit
                      }, {
                        default: withCtx(() => [
                          createTextVNode("提交")
                        ]),
                        _: 1
                      }, 8, ["loading"]),
                      createVNode(_component_el_button, {
                        onClick: ($event) => ("navigateTo" in _ctx ? _ctx.navigateTo : unref(navigateTo))("/admin/activities")
                      }, {
                        default: withCtx(() => [
                          createTextVNode("取消")
                        ]),
                        _: 1
                      }, 8, ["onClick"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/activities/create.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const create = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-27d65649"]]);

export { create as default };
//# sourceMappingURL=create-C78_Jy5t.mjs.map
