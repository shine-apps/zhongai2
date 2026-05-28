"use strict";
const common_vendor = require("../common/vendor.js");
const TOKEN_KEY = "zhongai_token";
function getToken() {
  return common_vendor.index.getStorageSync(TOKEN_KEY) || "";
}
function setToken(token) {
  common_vendor.index.setStorageSync(TOKEN_KEY, token);
}
function clearToken() {
  common_vendor.index.removeStorageSync(TOKEN_KEY);
}
function isLoggedIn() {
  return !!getToken();
}
exports.clearToken = clearToken;
exports.getToken = getToken;
exports.isLoggedIn = isLoggedIn;
exports.setToken = setToken;
