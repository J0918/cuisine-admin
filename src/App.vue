<template>
  <!-- 如果不是登录页，显示完整的后台布局（侧边栏+顶栏） -->
  <el-container v-if="!isLoginPage" class="layout-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapse ? '64px' : '200px'" class="aside">
      <!-- LOGO 区域 -->
      <div class="logo" :class="{ 'logo-collapse': isCollapse }">
        {{ isCollapse ? "Admin" : "后台管理系统" }}
      </div>
      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        class="el-menu-vertical"
        :collapse="isCollapse"
        :collapse-transition="false"
        router
        background-color="#304156"
        text-color="#fff"
        active-text-color="#ffd04b">
        <el-menu-item index="/dish">
          <el-icon><Dish /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <el-container>
      <!-- 顶栏 -->
      <el-header class="header">
        <div class="header-left">
          <!-- 汉堡图标，点击切换折叠状态 -->
          <el-icon class="collapse-icon" @click="toggleCollapse">
            <Fold v-if="!isCollapse" />
            <Expand v-else />
          </el-icon>
          <span class="page-title">{{ currentRouteName }}</span>
        </div>
        <div class="header-right">
          <!-- 显示当前登录用户名，下拉菜单包含退出选项 -->
          <el-dropdown @command="handleCommand">
            <span class="user-dropdown">
              {{ username }}<el-icon class="el-icon--right"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="logout">退出登录</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容区：渲染当前路由对应的组件（如用户管理、菜品管理） -->
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>

  <!-- 登录页：只显示登录组件本身，不包含任何布局 -->
  <router-view v-else />
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Fold, Expand, ArrowDown, Dish, User } from "@element-plus/icons-vue";
import { ElMessageBox } from "element-plus";

const router = useRouter();
const route = useRoute();

// 判断当前是否是登录页
const isLoginPage = computed(() => route.path === "/login");

// 侧边栏折叠状态
const isCollapse = ref(false);
const toggleCollapse = () => {
  isCollapse.value = !isCollapse.value;
};

// 当前激活的菜单项（根据路由路径高亮）
const activeMenu = computed(() => route.path);

// 当前路由名称（用于顶栏显示），优先使用 meta.title，否则回退到 route.name
const currentRouteName = computed(() => {
  return route.meta?.title || route.name || "首页";
});

// 当前登录用户名（从 localStorage 获取，默认空字符串）
const username = ref(localStorage.getItem("username") || "");

// 监听路由变化，确保用户名及时更新（例如登录后跳转过来时）
watch(
  () => route.path,
  () => {
    username.value = localStorage.getItem("username") || "";
  }
);

// 退出登录
const handleCommand = (command) => {
  if (command === "logout") {
    ElMessageBox.confirm("确认退出登录吗？", "提示", {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "info"
    })
      .then(() => {
        // 清除登录信息
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        router.push("/login");
      })
      .catch(() => {});
  }
};
</script>

<style scoped>
.layout-container {
  height: 100vh;
}
.aside {
  background-color: #304156;
  transition: width 0.3s;
  overflow: hidden;
}
.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  font-weight: bold;
  background-color: #1f2d3d;
  white-space: nowrap;
  overflow: hidden;
  transition: all 0.3s;
}
.logo-collapse {
  font-size: 14px;
}
.el-menu-vertical:not(.el-menu--collapse) {
  width: 200px;
}
.header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background-color: #fff;
  border-bottom: 1px solid #e6e6e6;
  padding: 0 20px;
}
.header-left {
  display: flex;
  align-items: center;
}
.collapse-icon {
  font-size: 20px;
  cursor: pointer;
  margin-right: 15px;
}
.page-title {
  font-size: 16px;
  font-weight: 500;
}
.header-right {
  display: flex;
  align-items: center;
}
.user-dropdown {
  cursor: pointer;
  display: flex;
  align-items: center;
}
</style>
