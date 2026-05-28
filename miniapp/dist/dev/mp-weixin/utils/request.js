"use strict";
const common_vendor = require("../common/vendor.js");
const utils_auth = require("./auth.js");
const BASE_URL = "https://api.zhongai.example.com";
function showToast(title) {
  common_vendor.index.showToast({
    title,
    icon: "none",
    duration: 2e3
  });
}
function handle401() {
  utils_auth.clearToken();
  common_vendor.index.reLaunch({ url: "/pages/login/index" });
}
function request(config) {
  const {
    url,
    method = "GET",
    data,
    header = {},
    showLoading = false,
    showError = true
  } = config;
  if (showLoading) {
    common_vendor.index.showLoading({ title: "加载中...", mask: true });
  }
  const token = utils_auth.getToken();
  if (token) {
    header["Authorization"] = `Bearer ${token}`;
  }
  return new Promise((resolve, reject) => {
    common_vendor.index.request({
      url: `${BASE_URL}${url}`,
      method,
      data,
      header: {
        "Content-Type": "application/json",
        ...header
      },
      success(res) {
        if (showLoading) {
          common_vendor.index.hideLoading();
        }
        const statusCode = res.statusCode;
        if (statusCode === 401) {
          handle401();
          reject(new Error("未授权，请重新登录"));
          return;
        }
        if (statusCode >= 400) {
          const msg = `请求失败 (${statusCode})`;
          if (showError) showToast(msg);
          reject(new Error(msg));
          return;
        }
        const body = res.data;
        if (body.code !== 0) {
          if (body.code === 401) {
            handle401();
            reject(new Error("未授权，请重新登录"));
            return;
          }
          if (showError) showToast(body.message || "请求失败");
          reject(new Error(body.message || "请求失败"));
          return;
        }
        resolve(body.data);
      },
      fail(err) {
        if (showLoading) {
          common_vendor.index.hideLoading();
        }
        const msg = "网络异常，请稍后重试";
        if (showError) showToast(msg);
        reject(new Error(msg));
      }
    });
  });
}
function get(url, data, config) {
  return request({ url, method: "GET", data, ...config });
}
function post(url, data, config) {
  return request({ url, method: "POST", data, ...config });
}
function patch(url, data, config) {
  return request({ url, method: "PATCH", data, ...config });
}
exports.get = get;
exports.patch = patch;
exports.post = post;
