import request from "../utils/request";

// 获取菜品列表
export function getCuisineList(params) {
  return request({
    url: "/Cuisine/GetCuisineList",
    method: "post",
    data: params
  });
}

// 新增菜品
export function addCuisine(params) {
  return request({
    url: "/Cuisine/AddCuisine",
    method: "post",
    data: params
  });
}
