<template>
  <div v-if="$route.path === '/login'" class="fullscreen">
    <router-view />
  </div>
  <el-container v-else class="layout">
    <el-aside width="200px">
      <el-menu :default-active="$route.path" router class="menu" background-color="#304156" text-color="#fff" active-text-color="#ffd04b">
        <el-menu-item index="/user">
          <el-icon><User /></el-icon>
          <span>用户管理</span>
        </el-menu-item>
        <el-menu-item index="/dish">
          <el-icon><Food /></el-icon>
          <span>菜品管理</span>
        </el-menu-item>
        <el-menu-item index="/logout" @click="handleLogout">
          <el-icon><SwitchButton /></el-icon>
          <span>退出登录</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>后台管理系统</el-header>
      <el-main>
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { useRouter } from "vue-router";
import { useAuthStore } from "./stores/auth";
import { ElMessage } from "element-plus";
import { User, Food, SwitchButton } from "@element-plus/icons-vue";

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = () => {
  authStore.logout();
  ElMessage.success("已退出登录");
  router.push("/login");
};
</script>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  height: 100%;
}
.layout {
  height: 100%;
}
.el-aside {
  background-color: #304156;
}
.menu {
  border-right: none;
}
.el-header {
  background-color: #fff;
  border-bottom: 1px solid #ddd;
  line-height: 60px;
}
.el-main {
  background-color: #f0f2f5;
}
.fullscreen {
  height: 100%;
}
</style>
