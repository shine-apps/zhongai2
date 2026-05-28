"use strict";
const common_vendor = require("../common/vendor.js");
const utils_request = require("../utils/request.js");
const utils_auth = require("../utils/auth.js");
const defaultUserInfo = {
  id: 0,
  nickname: "",
  avatar: "",
  phone: "",
  realName: "",
  isRealNameVerified: false,
  points: 0,
  level: 0
};
const userInfo = common_vendor.reactive({ ...defaultUserInfo });
function useUserStore() {
  function setUserInfo(info) {
    Object.assign(userInfo, info);
  }
  function clearUserInfo() {
    Object.assign(userInfo, defaultUserInfo);
    utils_auth.clearToken();
  }
  async function fetchUserInfo() {
    const data = await utils_request.get("/api/users/me");
    setUserInfo(data);
    return data;
  }
  return {
    userInfo,
    setUserInfo,
    clearUserInfo,
    fetchUserInfo
  };
}
exports.useUserStore = useUserStore;
