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

// 添加用户信息
export function addUser(data) {
  return request({
    url: "/User/AddUser",
    method: "post",
    data
  });
}

// 修改用户信息
export function updateUser(data) {
  return request({
    url: "/User/UpdateUser",
    method: "post",
    data
  });
}

// 修改密码
export function changePassword(params) {
  return request({
    url: "/User/ChangePassword",
    method: "get",
    params
  });
}
