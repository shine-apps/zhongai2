"use strict";
const common_vendor = require("../../common/vendor.js");
const utils_request = require("../../utils/request.js");
const utils_auth = require("../../utils/auth.js");
if (!Array) {
  const _component_wd_radio = common_vendor.resolveComponent("wd-radio");
  const _component_wd_radio_group = common_vendor.resolveComponent("wd-radio-group");
  const _component_wd_input = common_vendor.resolveComponent("wd-input");
  const _component_wd_textarea = common_vendor.resolveComponent("wd-textarea");
  const _component_wd_icon = common_vendor.resolveComponent("wd-icon");
  const _component_wd_button = common_vendor.resolveComponent("wd-button");
  (_component_wd_radio + _component_wd_radio_group + _component_wd_input + _component_wd_textarea + _component_wd_icon + _component_wd_button)();
}
const _sfc_main = /* @__PURE__ */ common_vendor.defineComponent({
  __name: "submit",
  setup(__props) {
    const donationType = common_vendor.ref("money");
    const amount = common_vendor.ref("");
    const materialDesc = common_vendor.ref("");
    const estimatedValue = common_vendor.ref("");
    const evidenceImages = common_vendor.ref([]);
    const evidenceDesc = common_vendor.ref("");
    const submitting = common_vendor.ref(false);
    const donationTypes = [
      { value: "money", label: "资金捐助" },
      { value: "material", label: "物资捐助" }
    ];
    const isMoney = common_vendor.computed(() => donationType.value === "money");
    function chooseImages() {
      const remaining = 9 - evidenceImages.value.length;
      if (remaining <= 0) {
        common_vendor.index.showToast({ title: "最多上传9张图片", icon: "none" });
        return;
      }
      common_vendor.index.chooseImage({
        count: remaining,
        sizeType: ["compressed"],
        sourceType: ["album", "camera"],
        success: (res) => {
          evidenceImages.value.push(...res.tempFilePaths);
        }
      });
    }
    function removeImage(index) {
      evidenceImages.value.splice(index, 1);
    }
    async function uploadImages() {
      const urls = [];
      for (const img of evidenceImages.value) {
        const uploadRes = await new Promise((resolve, reject) => {
          common_vendor.index.uploadFile({
            url: `${"http://localhost:3001"}/api/upload`,
            filePath: img,
            name: "file",
            success(res) {
              var _a;
              if (res.statusCode === 200) {
                const data = JSON.parse(res.data);
                resolve(((_a = data.data) == null ? void 0 : _a.url) || "");
              } else {
                reject(new Error("上传失败"));
              }
            },
            fail: reject
          });
        });
        if (uploadRes) urls.push(uploadRes);
      }
      return urls;
    }
    async function handleSubmit() {
      if (!utils_auth.isLoggedIn()) {
        common_vendor.index.navigateTo({ url: "/pages/login/index" });
        return;
      }
      if (isMoney.value) {
        if (!amount.value || Number(amount.value) <= 0) {
          common_vendor.index.showToast({ title: "请输入有效金额", icon: "none" });
          return;
        }
      } else {
        if (!materialDesc.value.trim()) {
          common_vendor.index.showToast({ title: "请输入物资描述", icon: "none" });
          return;
        }
      }
      submitting.value = true;
      try {
        let imageUrls = [];
        if (evidenceImages.value.length) {
          imageUrls = await uploadImages();
        }
        const payload = {
          type: donationType.value,
          evidenceImages: imageUrls,
          evidenceDesc: evidenceDesc.value
        };
        if (isMoney.value) {
          payload.amount = Number(amount.value);
        } else {
          payload.materialDesc = materialDesc.value;
          payload.estimatedValue = Number(estimatedValue.value) || 0;
        }
        await utils_request.post("/api/donations", payload);
        common_vendor.index.showToast({ title: "提交成功", icon: "success" });
        setTimeout(() => {
          common_vendor.index.navigateBack();
        }, 1500);
      } catch {
        common_vendor.index.showToast({ title: "提交失败", icon: "none" });
      } finally {
        submitting.value = false;
      }
    }
    return (_ctx, _cache) => {
      return common_vendor.e({
        a: common_vendor.f(donationTypes, (item, k0, i0) => {
          return {
            a: common_vendor.t(item.label),
            b: item.value,
            c: "65a240d4-1-" + i0 + ",65a240d4-0",
            d: common_vendor.p({
              value: item.value
            })
          };
        }),
        b: common_vendor.o(($event) => donationType.value = $event),
        c: common_vendor.p({
          shape: "button",
          modelValue: donationType.value
        }),
        d: isMoney.value
      }, isMoney.value ? {
        e: common_vendor.o(($event) => amount.value = $event),
        f: common_vendor.p({
          type: "number",
          placeholder: "请输入捐助金额",
          modelValue: amount.value
        })
      } : {
        g: common_vendor.o(($event) => materialDesc.value = $event),
        h: common_vendor.p({
          placeholder: "请描述捐助的物资",
          maxlength: 500,
          ["show-word-limit"]: true,
          modelValue: materialDesc.value
        }),
        i: common_vendor.o(($event) => estimatedValue.value = $event),
        j: common_vendor.p({
          type: "number",
          placeholder: "请输入预估价值",
          modelValue: estimatedValue.value
        })
      }, {
        k: common_vendor.f(evidenceImages.value, (img, index, i0) => {
          return {
            a: img,
            b: "65a240d4-5-" + i0,
            c: common_vendor.o(($event) => removeImage(index), index),
            d: index
          };
        }),
        l: common_vendor.p({
          name: "close",
          size: "24rpx",
          color: "#fff"
        }),
        m: evidenceImages.value.length < 9
      }, evidenceImages.value.length < 9 ? {
        n: common_vendor.p({
          name: "add",
          size: "48rpx",
          color: "#ccc"
        }),
        o: common_vendor.o(chooseImages)
      } : {}, {
        p: common_vendor.o(($event) => evidenceDesc.value = $event),
        q: common_vendor.p({
          placeholder: "请输入凭证说明（选填）",
          maxlength: 500,
          ["show-word-limit"]: true,
          modelValue: evidenceDesc.value
        }),
        r: common_vendor.o(handleSubmit),
        s: common_vendor.p({
          type: "primary",
          block: true,
          loading: submitting.value,
          ["custom-style"]: "height: 88rpx; border-radius: 44rpx; font-size: 32rpx;"
        })
      });
    };
  }
});
const MiniProgramPage = /* @__PURE__ */ common_vendor._export_sfc(_sfc_main, [["__scopeId", "data-v-65a240d4"]]);
wx.createPage(MiniProgramPage);
