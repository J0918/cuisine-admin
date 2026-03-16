import axios from "axios";
import { ElMessage } from "element-plus";
import router from "../router";

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  timeout: 10000
});

// 请求拦截器：自动添加 token
request.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 响应拦截器：处理业务状态码和 HTTP 错误
request.interceptors.response.use(
  (response) => {
    // 如果后端返回的数据中有 code 字段，进行业务状态判断
    if (response.data && response.data.code !== undefined) {
      if (response.data.code === 200) {
        // 业务成功，返回整个响应体（包含 data、totalCount 等）
        return response.data;
      } else {
        // 业务失败，显示错误信息并 reject
        ElMessage.error(response.data.message || "请求失败");
        return Promise.reject(new Error(response.data.message || "请求失败"));
      }
    }
    // 如果没有 code 字段（兼容旧接口），直接返回整个数据
    return response.data;
  },
  (error) => {
    // HTTP 错误（如 401、500 等）
    if (error.response) {
      const status = error.response.status;
      if (status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        ElMessage.error("登录已过期，请重新登录");
      } else {
        ElMessage.error(error.response.data.message || "请求失败");
      }
    } else {
      ElMessage.error("网络错误，请稍后重试");
    }
    return Promise.reject(error);
  }
);

export default request;
