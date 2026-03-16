import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import User from "../views/User.vue";
import Dish from "../views/Dish.vue";

const routes = [
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: "/",
    redirect: "/user"
  },
  {
    path: "/user",
    name: "User",
    component: User,
    meta: { requiresAuth: true }
  },
  {
    path: "/dish",
    name: "Dish",
    component: Dish,
    meta: { requiresAuth: true }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫：检查是否已登录
router.beforeEach((to, from, next) => {
  const token = localStorage.getItem("token");
  if (to.meta.requiresAuth && !token) {
    next("/login");
  } else if (to.path === "/login" && token) {
    next("/user");
  } else {
    next();
  }
});

export default router;
