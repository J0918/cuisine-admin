import { createRouter, createWebHistory } from "vue-router";
import Login from "../views/Login.vue";
import User from "../views/User.vue";
import DishManagement from "../views/DishManagement.vue";

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
    meta: {
      requiresAuth: true,
      title: "用户管理"
    }
  },
  {
    path: "/dish",
    name: "Dish",
    component: DishManagement,
    meta: {
      requiresAuth: true,
      title: "菜品管理"
    }
  }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 路由守卫（保持不变）
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
