import { E as ElCard } from './el-card-DetSgD7E.mjs';
import { E as ElForm, a as ElFormItem, b as ElInput, c as ElMessage, u as useAdminAuth } from './index-DjsCpFrD.mjs';
import { E as ElButton } from './el-button-DIpjTHL8.mjs';
import { defineComponent, ref, reactive, mergeProps, withCtx, unref, createVNode, withKeys, createTextVNode, withModifiers, useSSRContext } from 'vue';
import { ssrRenderAttrs, ssrRenderComponent } from 'vue/server-renderer';
import { _ as _export_sfc, k as navigateTo } from './server.mjs';
import './base-C_ywmTr3.mjs';
import '@vue/shared';
import 'lodash-unified';
import '@vueuse/core';
import 'async-validator';
import './event-YY_EUtOs.mjs';
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
  __name: "login",
  __ssrInlineRender: true,
  setup(__props) {
    const { setToken } = useAdminAuth();
    const formRef = ref();
    const loading = ref(false);
    const form = reactive({
      username: "",
      password: ""
    });
    const rules = {
      username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
      password: [{ required: true, message: "请输入密码", trigger: "blur" }]
    };
    const handleLogin = async () => {
      const valid = await formRef.value?.validate().catch(() => false);
      if (!valid) return;
      loading.value = true;
      try {
        const res = await $fetch("/api/auth/admin-login", {
          method: "POST",
          body: form
        });
        setToken(res.token);
        ElMessage.success("登录成功");
        await navigateTo("/admin");
      } catch (error) {
        ElMessage.error(error?.data?.message || "登录失败");
      } finally {
        loading.value = false;
      }
    };
    return (_ctx, _push, _parent, _attrs) => {
      const _component_el_card = ElCard;
      const _component_el_form = ElForm;
      const _component_el_form_item = ElFormItem;
      const _component_el_input = ElInput;
      const _component_el_button = ElButton;
      _push(`<div${ssrRenderAttrs(mergeProps({ class: "login-container" }, _attrs))} data-v-e8f27987>`);
      _push(ssrRenderComponent(_component_el_card, { class: "login-card" }, {
        header: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(`<div class="login-header" data-v-e8f27987${_scopeId}><h2 data-v-e8f27987${_scopeId}>众爱联盟 - 管理后台</h2></div>`);
          } else {
            return [
              createVNode("div", { class: "login-header" }, [
                createVNode("h2", null, "众爱联盟 - 管理后台")
              ])
            ];
          }
        }),
        default: withCtx((_, _push2, _parent2, _scopeId) => {
          if (_push2) {
            _push2(ssrRenderComponent(_component_el_form, {
              ref_key: "formRef",
              ref: formRef,
              model: unref(form),
              rules,
              "label-width": "0",
              onSubmit: handleLogin
            }, {
              default: withCtx((_2, _push3, _parent3, _scopeId2) => {
                if (_push3) {
                  _push3(ssrRenderComponent(_component_el_form_item, { prop: "username" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).username,
                          "onUpdate:modelValue": ($event) => unref(form).username = $event,
                          placeholder: "请输入用户名",
                          "prefix-icon": "User",
                          size: "large"
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).username,
                            "onUpdate:modelValue": ($event) => unref(form).username = $event,
                            placeholder: "请输入用户名",
                            "prefix-icon": "User",
                            size: "large"
                          }, null, 8, ["modelValue", "onUpdate:modelValue"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                  _push3(ssrRenderComponent(_component_el_form_item, { prop: "password" }, {
                    default: withCtx((_3, _push4, _parent4, _scopeId3) => {
                      if (_push4) {
                        _push4(ssrRenderComponent(_component_el_input, {
                          modelValue: unref(form).password,
                          "onUpdate:modelValue": ($event) => unref(form).password = $event,
                          type: "password",
                          placeholder: "请输入密码",
                          "prefix-icon": "Lock",
                          size: "large",
                          "show-password": "",
                          onKeyup: handleLogin
                        }, null, _parent4, _scopeId3));
                      } else {
                        return [
                          createVNode(_component_el_input, {
                            modelValue: unref(form).password,
                            "onUpdate:modelValue": ($event) => unref(form).password = $event,
                            type: "password",
                            placeholder: "请输入密码",
                            "prefix-icon": "Lock",
                            size: "large",
                            "show-password": "",
                            onKeyup: withKeys(handleLogin, ["enter"])
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
                          size: "large",
                          loading: unref(loading),
                          class: "login-btn",
                          onClick: handleLogin
                        }, {
                          default: withCtx((_4, _push5, _parent5, _scopeId4) => {
                            if (_push5) {
                              _push5(` 登录 `);
                            } else {
                              return [
                                createTextVNode(" 登录 ")
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
                            loading: unref(loading),
                            class: "login-btn",
                            onClick: handleLogin
                          }, {
                            default: withCtx(() => [
                              createTextVNode(" 登录 ")
                            ]),
                            _: 1
                          }, 8, ["loading"])
                        ];
                      }
                    }),
                    _: 1
                  }, _parent3, _scopeId2));
                } else {
                  return [
                    createVNode(_component_el_form_item, { prop: "username" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).username,
                          "onUpdate:modelValue": ($event) => unref(form).username = $event,
                          placeholder: "请输入用户名",
                          "prefix-icon": "User",
                          size: "large"
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, { prop: "password" }, {
                      default: withCtx(() => [
                        createVNode(_component_el_input, {
                          modelValue: unref(form).password,
                          "onUpdate:modelValue": ($event) => unref(form).password = $event,
                          type: "password",
                          placeholder: "请输入密码",
                          "prefix-icon": "Lock",
                          size: "large",
                          "show-password": "",
                          onKeyup: withKeys(handleLogin, ["enter"])
                        }, null, 8, ["modelValue", "onUpdate:modelValue"])
                      ]),
                      _: 1
                    }),
                    createVNode(_component_el_form_item, null, {
                      default: withCtx(() => [
                        createVNode(_component_el_button, {
                          type: "primary",
                          size: "large",
                          loading: unref(loading),
                          class: "login-btn",
                          onClick: handleLogin
                        }, {
                          default: withCtx(() => [
                            createTextVNode(" 登录 ")
                          ]),
                          _: 1
                        }, 8, ["loading"])
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
                "label-width": "0",
                onSubmit: withModifiers(handleLogin, ["prevent"])
              }, {
                default: withCtx(() => [
                  createVNode(_component_el_form_item, { prop: "username" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).username,
                        "onUpdate:modelValue": ($event) => unref(form).username = $event,
                        placeholder: "请输入用户名",
                        "prefix-icon": "User",
                        size: "large"
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, { prop: "password" }, {
                    default: withCtx(() => [
                      createVNode(_component_el_input, {
                        modelValue: unref(form).password,
                        "onUpdate:modelValue": ($event) => unref(form).password = $event,
                        type: "password",
                        placeholder: "请输入密码",
                        "prefix-icon": "Lock",
                        size: "large",
                        "show-password": "",
                        onKeyup: withKeys(handleLogin, ["enter"])
                      }, null, 8, ["modelValue", "onUpdate:modelValue"])
                    ]),
                    _: 1
                  }),
                  createVNode(_component_el_form_item, null, {
                    default: withCtx(() => [
                      createVNode(_component_el_button, {
                        type: "primary",
                        size: "large",
                        loading: unref(loading),
                        class: "login-btn",
                        onClick: handleLogin
                      }, {
                        default: withCtx(() => [
                          createTextVNode(" 登录 ")
                        ]),
                        _: 1
                      }, 8, ["loading"])
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
  (ssrContext.modules || (ssrContext.modules = /* @__PURE__ */ new Set())).add("pages/admin/login.vue");
  return _sfc_setup ? _sfc_setup(props, ctx) : void 0;
};
const login = /* @__PURE__ */ _export_sfc(_sfc_main, [["__scopeId", "data-v-e8f27987"]]);

export { login as default };
//# sourceMappingURL=login-BF1jwKRp.mjs.map
