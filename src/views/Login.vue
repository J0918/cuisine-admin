<template>
  <div class="login-container">
    <el-card class="login-card" shadow="hover">
      <!-- 系统图标和标题 -->
      <div class="login-header">
        <el-icon class="system-icon"><Monitor /></el-icon>
        <h2>菜品后台管理系统</h2>
      </div>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="0px" class="login-form" @keyup.enter="handleLogin">
        <!-- 用户名 -->
        <el-form-item prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" :prefix-icon="User" size="large" clearable />
        </el-form-item>

        <!-- 密码 -->
        <el-form-item prop="password">
          <el-input v-model="form.password" type="password" placeholder="请输入密码" :prefix-icon="Lock" show-password size="large" clearable />
        </el-form-item>

        <!-- 验证码 -->
        <el-form-item prop="captcha">
          <div class="captcha-wrapper">
            <el-input v-model="form.captcha" placeholder="请输入验证码" :prefix-icon="Picture" size="large" class="captcha-input" />
            <div class="captcha-image" @click="refreshCaptcha">
              <span v-html="captchaSvg"></span>
            </div>
          </div>
        </el-form-item>

        <!-- 登录按钮 -->
        <el-form-item>
          <el-button type="primary" @click="handleLogin" :loading="loading" size="large" class="login-button"> 登录 </el-button>
        </el-form-item>
      </el-form>

      <!-- 底部提示（可选） -->
      <div class="login-footer">
        <span>© 2026 后台管理系统</span>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { useRouter } from "vue-router";
import { ElMessage } from "element-plus";
import { User, Lock, Picture, Monitor } from "@element-plus/icons-vue";
import { useAuthStore } from "../stores/auth";
import { login } from "../api/user";

const router = useRouter();
const authStore = useAuthStore();

// 表单数据
const form = reactive({
  username: "",
  password: "",
  captcha: ""
});

// 验证码正确值（模拟）
const correctCaptcha = ref("");

// 生成随机验证码（4位数字）
const generateCaptcha = () => {
  const num = Math.floor(1000 + Math.random() * 9000);
  correctCaptcha.value = num.toString();
  return num.toString();
};

// 生成简单的 SVG 验证码（实际可用 canvas 绘制更复杂的样式）
const captchaSvg = ref("");
const renderCaptchaSvg = (code) => {
  // 简单样式：不同颜色、倾斜、干扰线
  const chars = code.split("");
  const svg = `
    <svg width="100" height="40" xmlns="http://www.w3.org/2000/svg">
      <rect width="100" height="40" fill="#f5f7fa" />
      ${chars
        .map((char, index) => {
          const x = 15 + index * 20;
          const y = 25 + Math.sin(index) * 5;
          const rotate = (Math.random() * 20 - 10).toFixed(2);
          const color = `hsl(${Math.random() * 360}, 70%, 50%)`;
          return `<text x="${x}" y="${y}" font-size="24" font-weight="bold" fill="${color}" transform="rotate(${rotate} ${x} ${y})">${char}</text>`;
        })
        .join("")}
      <!-- 干扰线 -->
      <line x1="5" y1="20" x2="95" y2="30" stroke="#ccc" stroke-width="1" />
      <line x1="10" y1="35" x2="90" y2="10" stroke="#ccc" stroke-width="1" />
    </svg>
  `;
  captchaSvg.value = svg;
};

// 刷新验证码
const refreshCaptcha = () => {
  const code = generateCaptcha();
  renderCaptchaSvg(code);
};

// 表单校验规则
const rules = {
  username: [{ required: true, message: "请输入用户名", trigger: "blur" }],
  password: [{ required: true, message: "请输入密码", trigger: "blur" }]
};

const formRef = ref(null);
const loading = ref(false);

const handleLogin = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (valid) {
      // 手动验证验证码
      if (form.captcha !== correctCaptcha.value) {
        refreshCaptcha(); // 刷新验证码
        ElMessage.error("验证码错误");
        return; // 终止登录
      }

      loading.value = true;
      try {
        const res = await login({
          username: form.username,
          password: form.password
        });
        const token = res.data; // token 字符串
        authStore.setToken(token);
        localStorage.setItem("token", token);
        localStorage.setItem("username", form.username); // 保存用户名
        ElMessage.success("登录成功");
        router.push("/dish");
      } catch (error) {
        console.error(error);
        // ========== 核心修改：用户名/密码错误时，刷新验证码+清空输入 ==========
        refreshCaptcha();
        form.captcha = "";
        // 优化错误提示：优先展示接口返回的错误信息（如用户名或密码错误），兜底通用提示
        const errMsg = error.response?.data?.message || "登录失败，请重试";
        ElMessage.error(errMsg);
      } finally {
        loading.value = false;
      }
    }
  });
};

// 初始化验证码
onMounted(() => {
  refreshCaptcha();
});
</script>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.login-card {
  width: 450px;
  border-radius: 12px;
  padding: 20px;
}

.login-header {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 30px;
}

.system-icon {
  font-size: 32px;
  color: #409eff;
  margin-right: 10px;
}

.login-header h2 {
  margin: 0;
  color: #333;
  font-weight: 500;
}

.login-form {
  margin-top: 20px;
}

.captcha-wrapper {
  display: flex;
  align-items: center;
  gap: 10px;
}

.captcha-input {
  flex: 1;
}

.captcha-image {
  width: 100px;
  height: 40px;
  background-color: #f5f7fa;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #dcdfe6;
  overflow: hidden;
}

.captcha-image svg {
  width: 100%;
  height: 100%;
}

.login-button {
  width: 100%;
  font-size: 16px;
}

.login-footer {
  text-align: center;
  margin-top: 20px;
  color: #999;
  font-size: 14px;
}
</style>
