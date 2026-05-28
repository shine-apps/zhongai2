import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth, C as CHANGE_EVENT, U as UPDATE_MODEL_EVENT } from './index-DjsCpFrD.mjs';
import { a as ElSelect, E as ElOption } from './el-select-Bnkp58fp.mjs';
import { E as ElDatePicker } from './el-date-picker-CS33_FMf.mjs';
import { E as ElButton, a as useFormItem, b as useFormItemInputId, u as useDeprecated } from './el-button-DIpjTHL8.mjs';
import { E as ElTable, v as vLoading, a as ElTableColumn } from './el-loading-D9GVmp6R.mjs';
import { E as ElImage } from './el-image-BilNxigT.mjs';
import { E as ElTag } from './el-tag-C3TbsKo4.mjs';
import { E as ElPagination } from './el-pagination-DnbL3VzV.mjs';
import { E as ElDialog } from './el-dialog-C6MHvVFj.mjs';
import { a9 as withNoopInstall, a7 as withInstall, j as buildProps, a4 as useSizeProp, s as definePropType, $ as useFormSize, _ as useFormDisabled } from './base-C_ywmTr3.mjs';
import { _ as _export_sfc, p as useNamespace, m as useId, c as isNumber, i as isBoolean, f as isPropAbsent } from './server.mjs';
import { NOOP, isString } from '@vue/shared';
import { defineComponent, ref, reactive, mergeProps, withCtx, unref, createVNode, createTextVNode, toDisplayString, openBlock, createBlock, withDirectives, isRef, computed, provide, toRefs, watch, createElementBlock, normalizeClass, renderSlot, Fragment, renderList, resolveDynamicComponent, createElementVNode, withModifiers, vModelRadio, normalizeStyle, nextTick, inject, useSSRContext } from 'vue';
import { u as useAriaProps } from './event-YY_EUtOs.mjs';
import { isEqual, omit } from 'lodash-unified';
import { ssrRenderAttrs, ssrRenderComponent, ssrGetDirectiveProps, ssrInterpolate } from 'vue/server-renderer';
import '@vueuse/core';
import 'async-validator';
import './index-DX-1AO13.mjs';
import '@popperjs/core';
import './el-popper-jQIHRSBm.mjs';
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
import 'normalize-wheel-es';
import './index-DU43QBNU.mjs';
import './refs-CxYYXu5Q.mjs';
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

const radioPropsBase = buildProps({
  /**
  * @description binding value
  */
  modelValue: {
    type: [
      String,
      Number,
      Boolean
    ],
    default: void 0
  },
  /**
  * @description size of the Radio
  */
  size: useSizeProp,
  /**
  * @description whether Radio is disabled
  */
  disabled: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description the label of Radio
  */
  label: {
    type: [
      String,
      Number,
      Boolean
    ],
    default: void 0
  },
  /**
  * @description the value of Radio
  */
  value: {
    type: [
      String,
      Number,
      Boolean
    ],
    default: void 0
  },
  /**
  * @description native `name` attribute
  */
  name: {
    type: String,
    default: void 0
  }
});
const radioProps = buildProps({
  ...radioPropsBase,
  /**
  * @description whether to add a border around Radio
  */
  border: Boolean
});
const radioEmits = {
  [UPDATE_MODEL_EVENT]: (val) => isString(val) || isNumber(val) || isBoolean(val),
  [CHANGE_EVENT]: (val) => isString(val) || isNumber(val) || isBoolean(val)
};
const radioGroupKey = /* @__PURE__ */ Symbol("radioGroupKey");
const useRadio = (props, emit) => {
  const radioRef = ref();
  const radioGroup = inject(radioGroupKey, void 0);
  const isGroup = computed(() => !!radioGroup);
  const actualValue = computed(() => {
    if (!isPropAbsent(props.value)) return props.value;
    return props.label;
  });
  const modelValue = computed({
    get() {
      return isGroup.value ? radioGroup.modelValue : props.modelValue;
    },
    set(val) {
      if (isGroup.value) radioGroup.changeEvent(val);
      else emit && emit("update:modelValue", val);
      radioRef.value.checked = props.modelValue === actualValue.value;
    }
  });
  const size = useFormSize(computed(() => radioGroup?.size));
  const disabled = useFormDisabled(computed(() => radioGroup?.disabled));
  const focus = ref(false);
  const tabIndex = computed(() => {
    return disabled.value || isGroup.value && modelValue.value !== actualValue.value ? -1 : 0;
  });
  useDeprecated({
    from: "label act as value",
    replacement: "value",
    version: "3.0.0",
    scope: "el-radio",
    ref: "https://element-plus.org/en-US/component/radio.html"
  }, computed(() => isGroup.value && isPropAbsent(props.value)));
  return {
    radioRef,
    isGroup,
    radioGroup,
    focus,
    size,
    disabled,
    tabIndex,
    modelValue,
    actualValue
  };
};
const _hoisted_1$2 = [
  "value",
  "name",
  "disabled",
  "checked"
];
var radio_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElRadio",
  __name: "radio",
  props: radioProps,
  emits: radioEmits,
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const ns = useNamespace("radio");
    const { radioRef, radioGroup, focus, size, disabled, modelValue, actualValue } = useRadio(props, emit);
    function handleChange() {
      nextTick(() => emit(CHANGE_EVENT, modelValue.value));
    }
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("label", { class: normalizeClass([
        unref(ns).b(),
        unref(ns).is("disabled", unref(disabled)),
        unref(ns).is("focus", unref(focus)),
        unref(ns).is("bordered", __props.border),
        unref(ns).is("checked", unref(modelValue) === unref(actualValue)),
        unref(ns).m(unref(size))
      ]) }, [createElementVNode("span", { class: normalizeClass([
        unref(ns).e("input"),
        unref(ns).is("disabled", unref(disabled)),
        unref(ns).is("checked", unref(modelValue) === unref(actualValue))
      ]) }, [withDirectives(createElementVNode("input", {
        ref_key: "radioRef",
        ref: radioRef,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(modelValue) ? modelValue.value = $event : null),
        class: normalizeClass(unref(ns).e("original")),
        value: unref(actualValue),
        name: __props.name || unref(radioGroup)?.name,
        disabled: unref(disabled),
        checked: unref(modelValue) === unref(actualValue),
        type: "radio",
        onFocus: _cache[1] || (_cache[1] = ($event) => focus.value = true),
        onBlur: _cache[2] || (_cache[2] = ($event) => focus.value = false),
        onChange: handleChange,
        onClick: _cache[3] || (_cache[3] = withModifiers(() => {
        }, ["stop"]))
      }, null, 42, _hoisted_1$2), [[vModelRadio, unref(modelValue)]]), createElementVNode("span", { class: normalizeClass(unref(ns).e("inner")) }, null, 2)], 2), createElementVNode("span", {
        class: normalizeClass(unref(ns).e("label")),
        onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
        }, ["stop"]))
      }, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.label), 1)])], 34)], 2);
    };
  }
});
var radio_default = radio_vue_vue_type_script_setup_true_lang_default;
const radioButtonProps = buildProps({ ...radioPropsBase });
const _hoisted_1$1 = [
  "value",
  "name",
  "disabled"
];
var radio_button_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElRadioButton",
  __name: "radio-button",
  props: radioButtonProps,
  setup(__props) {
    const props = __props;
    const ns = useNamespace("radio");
    const { radioRef, focus, size, disabled, modelValue, radioGroup, actualValue } = useRadio(props);
    const activeStyle = computed(() => {
      return {
        backgroundColor: radioGroup?.fill || "",
        borderColor: radioGroup?.fill || "",
        boxShadow: radioGroup?.fill ? `-1px 0 0 0 ${radioGroup.fill}` : "",
        color: radioGroup?.textColor || ""
      };
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("label", { class: normalizeClass([
        unref(ns).b("button"),
        unref(ns).is("active", unref(modelValue) === unref(actualValue)),
        unref(ns).is("disabled", unref(disabled)),
        unref(ns).is("focus", unref(focus)),
        unref(ns).bm("button", unref(size))
      ]) }, [withDirectives(createElementVNode("input", {
        ref_key: "radioRef",
        ref: radioRef,
        "onUpdate:modelValue": _cache[0] || (_cache[0] = ($event) => isRef(modelValue) ? modelValue.value = $event : null),
        class: normalizeClass(unref(ns).be("button", "original-radio")),
        value: unref(actualValue),
        type: "radio",
        name: __props.name || unref(radioGroup)?.name,
        disabled: unref(disabled),
        onFocus: _cache[1] || (_cache[1] = ($event) => focus.value = true),
        onBlur: _cache[2] || (_cache[2] = ($event) => focus.value = false),
        onClick: _cache[3] || (_cache[3] = withModifiers(() => {
        }, ["stop"]))
      }, null, 42, _hoisted_1$1), [[vModelRadio, unref(modelValue)]]), createElementVNode("span", {
        class: normalizeClass(unref(ns).be("button", "inner")),
        style: normalizeStyle(unref(modelValue) === unref(actualValue) ? activeStyle.value : {}),
        onKeydown: _cache[4] || (_cache[4] = withModifiers(() => {
        }, ["stop"]))
      }, [renderSlot(_ctx.$slots, "default", {}, () => [createTextVNode(toDisplayString(__props.label), 1)])], 38)], 2);
    };
  }
});
var radio_button_default = radio_button_vue_vue_type_script_setup_true_lang_default;
const radioDefaultProps = {
  label: "label",
  value: "value",
  disabled: "disabled"
};
const radioGroupProps = buildProps({
  /**
  * @description native `id` attribute
  */
  id: {
    type: String,
    default: void 0
  },
  /**
  * @description the size of radio buttons or bordered radios
  */
  size: useSizeProp,
  /**
  * @description whether the nesting radios are disabled
  */
  disabled: {
    type: Boolean,
    default: void 0
  },
  /**
  * @description binding value
  */
  modelValue: {
    type: [
      String,
      Number,
      Boolean
    ],
    default: void 0
  },
  /**
  * @description border and background color when button is active
  */
  fill: {
    type: String,
    default: ""
  },
  /**
  * @description font color when button is active
  */
  textColor: {
    type: String,
    default: ""
  },
  /**
  * @description native `name` attribute
  */
  name: {
    type: String,
    default: void 0
  },
  /**
  * @description whether to trigger form validation
  */
  validateEvent: {
    type: Boolean,
    default: true
  },
  options: { type: definePropType(Array) },
  props: {
    type: definePropType(Object),
    default: () => radioDefaultProps
  },
  type: {
    type: String,
    values: ["radio", "button"],
    default: "radio"
  },
  ...useAriaProps(["ariaLabel"])
});
const radioGroupEmits = radioEmits;
const _hoisted_1 = [
  "id",
  "aria-label",
  "aria-labelledby"
];
var radio_group_vue_vue_type_script_setup_true_lang_default = /* @__PURE__ */ defineComponent({
  name: "ElRadioGroup",
  __name: "radio-group",
  props: radioGroupProps,
  emits: radioGroupEmits,
  setup(__props, { emit: __emit }) {
    const props = __props;
    const emit = __emit;
    const ns = useNamespace("radio");
    const radioId = useId();
    const radioGroupRef = ref();
    const { formItem } = useFormItem();
    const { inputId: groupId, isLabeledByFormItem } = useFormItemInputId(props, { formItemContext: formItem });
    const changeEvent = (value) => {
      emit(UPDATE_MODEL_EVENT, value);
      nextTick(() => emit(CHANGE_EVENT, value));
    };
    const name = computed(() => {
      return props.name || radioId.value;
    });
    const aliasProps = computed(() => ({
      ...radioDefaultProps,
      ...props.props
    }));
    const getOptionProps = (option) => {
      const { label, value, disabled } = aliasProps.value;
      const base = {
        label: option[label],
        value: option[value],
        disabled: option[disabled]
      };
      return {
        ...omit(option, [
          label,
          value,
          disabled
        ]),
        ...base
      };
    };
    const optionComponent = computed(() => props.type === "button" ? radio_button_default : radio_default);
    provide(radioGroupKey, reactive({
      ...toRefs(props),
      changeEvent,
      name
    }));
    watch(() => props.modelValue, (newVal, oldValue) => {
      if (props.validateEvent && !isEqual(newVal, oldValue)) formItem?.validate("change").catch(NOOP);
    });
    return (_ctx, _cache) => {
      return openBlock(), createElementBlock("div", {
        id: unref(groupId),
        ref_key: "radioGroupRef",
        ref: radioGroupRef,
        class: normalizeClass(unref(ns).b("group")),
        role: "radiogroup",
        "aria-label": !unref(isLabeledByFormItem) ? __props.ariaLabel || "radio-group" : void 0,
        "aria-labelledby": unref(isLabeledByFormItem) ? unref(formItem).labelId : void 0
      }, [renderSlot(_ctx.$slots, "default", {}, () => [(openBlock(true), createElementBlock(Fragment, null, renderList(__props.options, (item, index2) => {
        return openBlock(), createBlock(resolveDynamicComponent(optionComponent.value), mergeProps({ key: index2 }, { ref_for: true }, getOptionProps(item)), null, 16);
      }), 128))])], 10, _hoisted_1);
    };
  }
});
var radio_group_default = radio_group_vue_vue_type_script_setup_true_lang_default;
const ElRadio = withInstall(radio_default, {
  RadioButton: radio_button_default,
  RadioGroup: radio_group_default
});
const ElRadioGroup = withNoopInstall(radio_group_default);
withNoopInstall(radio_button_default);
const _sfc_main = /* @__PURE__ */ defineComponent({
  __name: "index",
  __ssrInlineRender: true,
  setup(__props) {
    const { fetchWithAuth } = useAdminAuth();
    const statusMap = {
      pending: "待审核",
      approved: "已通过",
      rejected: "已拒绝"
    };
    const statusTypeMap = {
      pending: "warning",
      approved: "success",
      rejected: "danger"
    };
    const loading = ref(false);
    const donations = ref([]);
    const auditDialogVisible = ref(false);
    const auditSubmitting = ref(false);
    const currentDonation = ref(null);
    const searchForm = reactive({
      status: "",
      donationType: "",
      dateRange: null
    });
    const auditForm = reactive({
      result: "approved",
      reason: ""
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
    const loadDonations = async () => {
      loading.value = true;
      try {
        const params = {
          page: pagination.page,
          pageSize: pagination.pageSize,
          status: searchForm.status || void 0,
          donationType: searchForm.donationType || void 0
        };
        if (searchForm.dateRange && searchForm.dateRange.length === 2) {
          params.startDate = searchForm.dateRange[0];
          params.endDate = searchForm.dateRange[1];
        }
        const res = await fetchWithAuth("/api/donations", { params });
        donations.value = res.data || res.items || [];
        pagination.total = res.total || 0;
      } catch {
        ElMessage.error("加载捐助列表失败");
      } finally {
        loading.value = false;
      }
    };
    const handleSearch = () => {
      pagination.page = 1;
      loadDonations();
    };
    const handleReset = () => {
      searchForm.status = "";
      searchForm.donationType = "";
      searchForm.dateRange = null;
      pagination.page = 1;
      loadDonations();
    };
    const openAuditDialog = (row) => {
      currentDonation.value = row;
      auditForm.result = "approved";
      auditForm.reason = "";
      auditDialogVisible.value = true;
    };
    const handleAudit = async () => {
      if (!currentDonation.value) return;
      auditSubmitting.value = true;
      try {
        await fetchWithAuth(`/api/donations/${currentDonation.value.id}/audit`, {
          method: "PUT",
          body: {
            status: auditForm.result,
            reason: auditForm.reason
          }
        });
        ElMessage.success("审核成功");
        auditDialogVisible.value = false;
        loadDonations();
      } catch {
        ElMessage.error("审核失败");
      } finally {
        auditSubmitting.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_select = ElSelect;
      const _component_el_option = ElOption;
      const _component_el_date_picker = ElDatePicker;
      const _component_el_button = ElButton;
      const _component_el_table = ElTable;
      const _component_el_table_column = ElTableColumn;
      const _component_el_image = ElImage;
      const _component_el_tag = ElTag;
      const _component_el_pagination = ElPagination;
      const _component_el_dialog = ElDialog;
      const _component_el_radio_group = ElRadioGroup;
      const _component_el_radio = ElRadio;
      const _component_el_input = ElInput;
      const _directive_loading = vLoading;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "donations-page" }, _attrs))} data-v-180d457b>`);
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
                                label: "待审核",
                                value: "pending"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "已通过",
                                value: "approved"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "已拒绝",
                                value: "rejected"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "待审核",
                                  value: "pending"
                                }),
                                createVNode(_component_el_option, {
                                  label: "已通过",
                                  value: "approved"
                                }),
                                createVNode(_component_el_option, {
                                  label: "已拒绝",
                                  value: "rejected"
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
                                label: "待审核",
                                value: "pending"
                              }),
                              createVNode(_component_el_option, {
                                label: "已通过",
                                value: "approved"
                              }),
                              createVNode(_component_el_option, {
                                label: "已拒绝",
                                value: "rejected"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "捐助类型" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_select, {
                          modelValue: unref(searchForm).donationType,
                          "onUpdate:modelValue": ($event) => unref(searchForm).donationType = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "资金",
                                value: "money"
                              }, null, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_option, {
                                label: "物资",
                                value: "goods"
                              }, null, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_option, {
                                  label: "资金",
                                  value: "money"
                                }),
                                createVNode(_component_el_option, {
                                  label: "物资",
                                  value: "goods"
                                })
                              ];
                            }
                          }),
                          _: 1
                        }, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_select, {
                            modelValue: unref(searchForm).donationType,
                            "onUpdate:modelValue": ($event) => unref(searchForm).donationType = $event,
                            placeholder: "全部",
                            clearable: ""
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_option, {
                                label: "资金",
                                value: "money"
                              }),
                              createVNode(_component_el_option, {
                                label: "物资",
                                value: "goods"
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "日期范围" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_date_picker, {
                          modelValue: unref(searchForm).dateRange,
                          "onUpdate:modelValue": ($event) => unref(searchForm).dateRange = $event,
                          type: "daterange",
                          "range-separator": "至",
                          "start-placeholder": "开始日期",
                          "end-placeholder": "结束日期",
                          "value-format": "YYYY-MM-DD"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_date_picker, {
                            modelValue: unref(searchForm).dateRange,
                            "onUpdate:modelValue": ($event) => unref(searchForm).dateRange = $event,
                            type: "daterange",
                            "range-separator": "至",
                            "start-placeholder": "开始日期",
                            "end-placeholder": "结束日期",
                            "value-format": "YYYY-MM-DD"
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
                              label: "待审核",
                              value: "pending"
                            }),
                            createVNode(_component_el_option, {
                              label: "已通过",
                              value: "approved"
                            }),
                            createVNode(_component_el_option, {
                              label: "已拒绝",
                              value: "rejected"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "捐助类型" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_select, {
                          modelValue: unref(searchForm).donationType,
                          "onUpdate:modelValue": ($event) => unref(searchForm).donationType = $event,
                          placeholder: "全部",
                          clearable: ""
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_option, {
                              label: "资金",
                              value: "money"
                            }),
                            createVNode(_component_el_option, {
                              label: "物资",
                              value: "goods"
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "日期范围" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_date_picker, {
                          modelValue: unref(searchForm).dateRange,
                          "onUpdate:modelValue": ($event) => unref(searchForm).dateRange = $event,
                          type: "daterange",
                          "range-separator": "至",
                          "start-placeholder": "开始日期",
                          "end-placeholder": "结束日期",
                          "value-format": "YYYY-MM-DD"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
                            label: "待审核",
                            value: "pending"
                          }),
                          createVNode(_component_el_option, {
                            label: "已通过",
                            value: "approved"
                          }),
                          createVNode(_component_el_option, {
                            label: "已拒绝",
                            value: "rejected"
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { label: "捐助类型" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_select, {
                        modelValue: unref(searchForm).donationType,
                        "onUpdate:modelValue": ($event) => unref(searchForm).donationType = $event,
                        placeholder: "全部",
                        clearable: ""
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_option, {
                            label: "资金",
                            value: "money"
                          }),
                          createVNode(_component_el_option, {
                            label: "物资",
                            value: "goods"
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { label: "日期范围" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_date_picker, {
                        modelValue: unref(searchForm).dateRange,
                        "onUpdate:modelValue": ($event) => unref(searchForm).dateRange = $event,
                        type: "daterange",
                        "range-separator": "至",
                        "start-placeholder": "开始日期",
                        "end-placeholder": "结束日期",
                        "value-format": "YYYY-MM-DD"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
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
              data: unref(donations),
              stripe: ""
            }, ssrGetDirectiveProps(_ctx, _directive_loading, unref(loading))), {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "捐助人",
                    "min-width": "120"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(row.donorName || row.donor?.nickname || "-")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(row.donorName || row.donor?.nickname || "-"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "类型",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(`${ssrInterpolate(row.donationType === "money" ? "资金" : "物资")}`);
                      } else {
                        return [
                          createTextVNode(toDisplayString(row.donationType === "money" ? "资金" : "物资"), 1)
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "金额/物资",
                    "min-width": "120"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.donationType === "money") {
                          _push4(`<span data-v-180d457b${_scopeId3}>¥${ssrInterpolate(row.amount)}</span>`);
                        } else {
                          _push4(`<span data-v-180d457b${_scopeId3}>${ssrInterpolate(row.goodsDescription || "-")}</span>`);
                        }
                      } else {
                        return [
                          row.donationType === "money" ? (openBlock(), createBlock("span", { key: 0 }, "¥" + toDisplayString(row.amount), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(row.goodsDescription || "-"), 1))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_table_column, {
                    label: "凭证",
                    width: "100"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.proofImage) {
                          _push4(ssrRenderComponent(_component_el_image, {
                            src: row.proofImage,
                            "preview-src-list": [row.proofImage],
                            style: { "width": "50px", "height": "50px" },
                            fit: "cover"
                          }, null, _parent4, _scopeId3));
                        } else {
                          _push4(`<span data-v-180d457b${_scopeId3}>-</span>`);
                        }
                      } else {
                        return [
                          row.proofImage ? (openBlock(), createBlock(_component_el_image, {
                            key: 0,
                            src: row.proofImage,
                            "preview-src-list": [row.proofImage],
                            style: { "width": "50px", "height": "50px" },
                            fit: "cover"
                          }, null, 8, ["src", "preview-src-list"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
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
                    label: "提交时间",
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
                    width: "120",
                    fixed: "right"
                  }, {
                    default: withCtx(({ row }, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        if (row.status === "pending") {
                          _push4(ssrRenderComponent(_component_el_button, {
                            type: "primary",
                            link: "",
                            onClick: ($event) => openAuditDialog(row)
                          }, {
                            default: withCtx((_3, _push5, _parent5, _scopeId4) => {
                              if (_push5) {
                                _push5(` 审核 `);
                              } else {
                                return [
                                  createTextVNode(" 审核 ")
                                ];
                              }
                            }),
                            _: 2
                          }, _parent4, _scopeId3));
                        } else {
                          _push4(`<span data-v-180d457b${_scopeId3}>-</span>`);
                        }
                      } else {
                        return [
                          row.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
                            key: 0,
                            type: "primary",
                            link: "",
                            onClick: ($event) => openAuditDialog(row)
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" 审核 ")
                            ]),
                            _: 1
                          }, 8, ["onClick"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_table_column, {
                      label: "捐助人",
                      "min-width": "120"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(row.donorName || row.donor?.nickname || "-"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "类型",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(row.donationType === "money" ? "资金" : "物资"), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "金额/物资",
                      "min-width": "120"
                    }, {
                      default: withCtx(({ row }) => [
                        row.donationType === "money" ? (openBlock(), createBlock("span", { key: 0 }, "¥" + toDisplayString(row.amount), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(row.goodsDescription || "-"), 1))
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "凭证",
                      width: "100"
                    }, {
                      default: withCtx(({ row }) => [
                        row.proofImage ? (openBlock(), createBlock(_component_el_image, {
                          key: 0,
                          src: row.proofImage,
                          "preview-src-list": [row.proofImage],
                          style: { "width": "50px", "height": "50px" },
                          fit: "cover"
                        }, null, 8, ["src", "preview-src-list"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
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
                      label: "提交时间",
                      width: "180"
                    }, {
                      default: withCtx(({ row }) => [
                        createTextVNode(toDisplayString(formatDate(row.createdAt)), 1)
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_table_column, {
                      label: "操作",
                      width: "120",
                      fixed: "right"
                    }, {
                      default: withCtx(({ row }) => [
                        row.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
                          key: 0,
                          type: "primary",
                          link: "",
                          onClick: ($event) => openAuditDialog(row)
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" 审核 ")
                          ]),
                          _: 1
                        }, 8, ["onClick"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
                      ]),
                      _: 1
                    })
                  ];
                }
              }),
              _: 1
            }, _parent2, _scopeId));
            _push2(`<div class="pagination-wrap" data-v-180d457b${_scopeId}>`);
            _push2(ssrRenderComponent(_component_el_pagination, {
              "current-page": unref(pagination).page,
              "onUpdate:currentPage": ($event) => unref(pagination).page = $event,
              "page-size": unref(pagination).pageSize,
              "onUpdate:pageSize": ($event) => unref(pagination).pageSize = $event,
              total: unref(pagination).total,
              "page-sizes": [10, 20, 50],
              layout: "total, sizes, prev, pager, next, jumper",
              onSizeChange: loadDonations,
              onCurrentChange: loadDonations
            }, null, _parent2, _scopeId));
            _push2(`</div>`);
          } else {
            return [
              withDirectives((openBlock(), createBlock(_component_el_table, {
                data: unref(donations),
                stripe: ""
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_table_column, {
                    label: "捐助人",
                    "min-width": "120"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(row.donorName || row.donor?.nickname || "-"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    label: "类型",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(row.donationType === "money" ? "资金" : "物资"), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    label: "金额/物资",
                    "min-width": "120"
                  }, {
                    default: withCtx(({ row }) => [
                      row.donationType === "money" ? (openBlock(), createBlock("span", { key: 0 }, "¥" + toDisplayString(row.amount), 1)) : (openBlock(), createBlock("span", { key: 1 }, toDisplayString(row.goodsDescription || "-"), 1))
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    label: "凭证",
                    width: "100"
                  }, {
                    default: withCtx(({ row }) => [
                      row.proofImage ? (openBlock(), createBlock(_component_el_image, {
                        key: 0,
                        src: row.proofImage,
                        "preview-src-list": [row.proofImage],
                        style: { "width": "50px", "height": "50px" },
                        fit: "cover"
                      }, null, 8, ["src", "preview-src-list"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
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
                    label: "提交时间",
                    width: "180"
                  }, {
                    default: withCtx(({ row }) => [
                      createTextVNode(toDisplayString(formatDate(row.createdAt)), 1)
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_table_column, {
                    label: "操作",
                    width: "120",
                    fixed: "right"
                  }, {
                    default: withCtx(({ row }) => [
                      row.status === "pending" ? (openBlock(), createBlock(_component_el_button, {
                        key: 0,
                        type: "primary",
                        link: "",
                        onClick: ($event) => openAuditDialog(row)
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 审核 ")
                        ]),
                        _: 1
                      }, 8, ["onClick"])) : (openBlock(), createBlock("span", { key: 1 }, "-"))
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
                  onSizeChange: loadDonations,
                  onCurrentChange: loadDonations
                }, null, 8, ["current-page", "onUpdate:currentPage", "page-size", "onUpdate:pageSize", "total"])
              ])
            ];
          }
        }),
        _: 1
      }, _parent));
      _push(ssrRenderComponent(_component_el_dialog, {
        modelValue: unref(auditDialogVisible),
        "onUpdate:modelValue": ($event) => isRef(auditDialogVisible) ? auditDialogVisible.value = $event : null,
        title: "审核捐助",
        width: "500px"
      }, {
        footer: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_button, {
              onClick: ($event) => auditDialogVisible.value = false
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
              loading: unref(auditSubmitting),
              onClick: handleAudit
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
                onClick: ($event) => auditDialogVisible.value = false
              }, {
                default: withCtx(() => [
                  createTextVNode("取消")
                ]),
                _: 1
              }, 8, ["onClick"]),
              createVNode(_component_el_button, {
                type: "primary",
                loading: unref(auditSubmitting),
                onClick: handleAudit
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
              model: unref(auditForm),
              "label-width": "80px"
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "审核结果" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_radio_group, {
                          modelValue: unref(auditForm).result,
                          "onUpdate:modelValue": ($event) => unref(auditForm).result = $event
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(ssrRenderComponent(_component_el_radio, { value: "approved" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`通过`);
                                  } else {
                                    return [
                                      createTextVNode("通过")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                              _push5(ssrRenderComponent(_component_el_radio, { value: "rejected" }, {
                                default: withCtx((_5, _push6, _parent6, _scopeId5) => {
                                  if (_push6) {
                                    _push6(`拒绝`);
                                  } else {
                                    return [
                                      createTextVNode("拒绝")
                                    ];
                                  }
                                }),
                                _: 1
                              }, _parent5, _scopeId4));
                            } else {
                              return [
                                createVNode(_component_el_radio, { value: "approved" }, {
                                  default: withCtx(() => [
                                    createTextVNode("通过")
                                  ]),
                                  _: 1
                                }),
                                createVNode(_component_el_radio, { value: "rejected" }, {
                                  default: withCtx(() => [
                                    createTextVNode("拒绝")
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
                          createVNode(_component_el_radio_group, {
                            modelValue: unref(auditForm).result,
                            "onUpdate:modelValue": ($event) => unref(auditForm).result = $event
                          }, {
                            default: withCtx(() => [
                              createVNode(_component_el_radio, { value: "approved" }, {
                                default: withCtx(() => [
                                  createTextVNode("通过")
                                ]),
                                _: 1
                              }),
                              createVNode(_component_el_radio, { value: "rejected" }, {
                                default: withCtx(() => [
                                  createTextVNode("拒绝")
                                ]),
                                _: 1
                              })
                            ]),
                            _: 1
                          }, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { label: "审核意见" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(auditForm).reason,
                          "onUpdate:modelValue": ($event) => unref(auditForm).reason = $event,
                          type: "textarea",
                          rows: 3,
                          placeholder: "请输入审核意见"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(auditForm).reason,
                            "onUpdate:modelValue": ($event) => unref(auditForm).reason = $event,
                            type: "textarea",
                            rows: 3,
                            placeholder: "请输入审核意见"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, { label: "审核结果" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_radio_group, {
                          modelValue: unref(auditForm).result,
                          "onUpdate:modelValue": ($event) => unref(auditForm).result = $event
                        }, {
                          default: withCtx(() => [
                            createVNode(_component_el_radio, { value: "approved" }, {
                              default: withCtx(() => [
                                createTextVNode("通过")
                              ]),
                              _: 1
                            }),
                            createVNode(_component_el_radio, { value: "rejected" }, {
                              default: withCtx(() => [
                                createTextVNode("拒绝")
                              ]),
                              _: 1
                            })
                          ]),
                          _: 1
                        }, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { label: "审核意见" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(auditForm).reason,
                          "onUpdate:modelValue": ($event) => unref(auditForm).reason = $event,
                          type: "textarea",
                          rows: 3,
                          placeholder: "请输入审核意见"
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
                model: unref(auditForm),
                "label-width": "80px"
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { label: "审核结果" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_radio_group, {
                        modelValue: unref(auditForm).result,
                        "onUpdate:modelValue": ($event) => unref(auditForm).result = $event
                      }, {
                        default: withCtx(() => [
                          createVNode(_component_el_radio, { value: "approved" }, {
                            default: withCtx(() => [
                              createTextVNode("通过")
                            ]),
                            _: 1
                          }),
                          createVNode(_component_el_radio, { value: "rejected" }, {
                            default: withCtx(() => [
                              createTextVNode("拒绝")
                            ]),
                            _: 1
                          })
                        ]),
                        _: 1
                      }, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { label: "审核意见" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(auditForm).reason,
                        "onUpdate:modelValue": ($event) => unref(auditForm).reason = $event,
                        type: "textarea",
                        rows: 3,
                        placeholder: "请输入审核意见"
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/donations/index.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const index = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-180d457b"]]);

export { index as default };
//# sourceMappingURL=index-Apecb76K.mjs.map
