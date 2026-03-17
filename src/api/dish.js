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

// 获取随机菜品
export function getRandomCuisine(params) {
  return request({
    url: "/Cuisine/GetRandomCuisine",
    method: "get",
    params
  });
}
