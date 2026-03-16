import request from "../utils/request";

// 登录
export function login(data) {
  return request({
    url: "/Login/Login",
    method: "post",
    data
  });
}

// 获取用户列表
export function getUserList(params) {
  return request({
    url: "/User/GetUserList",
    method: "post",
    data: params
  });
}
