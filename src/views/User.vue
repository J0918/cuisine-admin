<template>
  <div>
    <h2 style="margin: 0 0 16px 0">用户管理</h2>

    <!-- 筛选表单 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline" @submit.prevent>
      <el-form-item label="用户名">
        <el-input v-model="queryParams.userName" placeholder="用户名" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item label="昵称">
        <el-input v-model="queryParams.nickName" placeholder="昵称" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="success" @click="handleAdd">新增用户</el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="userList" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column prop="phoneNumber" label="手机号" />
      <el-table-column label="操作" width="240">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="warning" @click="handleChangePassword(row)">修改密码</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageIndex"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange" />

    <!-- 新增/编辑用户弹窗 -->
    <UserFormDialog v-model:visible="userFormVisible" :mode="userFormMode" :initial-data="editData" @success="onUserFormSuccess" />

    <!-- 修改密码对话框 -->
    <el-dialog v-model="passwordDialogVisible" title="修改密码" width="500px" @close="resetPasswordForm">
      <el-form :model="passwordForm" :rules="passwordRules" ref="passwordFormRef" label-width="100px">
        <el-form-item label="旧密码" prop="oldPassword">
          <el-input v-model="passwordForm.oldPassword" type="password" show-password placeholder="请输入旧密码" />
        </el-form-item>
        <el-form-item label="新密码" prop="newPassword">
          <el-input v-model="passwordForm.newPassword" type="password" show-password placeholder="请输入新密码" />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input v-model="passwordForm.confirmPassword" type="password" show-password placeholder="请再次输入新密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="passwordDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitChangePassword" :loading="passwordLoading">确认修改</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getUserList, changePassword } from "../api/user";
import UserFormDialog from "../components/UserFormDialog.vue";
import { useRouter } from "vue-router";
const router = useRouter();
const currentUserId = localStorage.getItem("userId");

// ---------- 查询参数 ----------
const queryParams = reactive({
  userName: "",
  nickName: "",
  pageIndex: 1,
  pageSize: 10
});

const userList = ref([]);
const total = ref(0);
const loading = ref(false);

const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList(queryParams);
    if (res.code === 200 && res.data) {
      userList.value = res.data.data || [];
      total.value = res.data.totalCount || 0;
    } else {
      ElMessage.error(res.message || "获取用户列表失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  queryParams.pageIndex = 1;
  fetchUserList();
};

const resetSearch = () => {
  queryParams.userName = "";
  queryParams.nickName = "";
  queryParams.pageIndex = 1;
  fetchUserList();
};

const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageIndex = 1;
  fetchUserList();
};

const handleCurrentChange = (page) => {
  queryParams.pageIndex = page;
  fetchUserList();
};

// ---------- 新增/编辑弹窗 ----------
const userFormVisible = ref(false);
const userFormMode = ref("add");
const editData = ref(null);

const handleAdd = () => {
  userFormMode.value = "add";
  editData.value = null;
  userFormVisible.value = true;
};

const handleEdit = (row) => {
  userFormMode.value = "edit";
  editData.value = { ...row };
  userFormVisible.value = true;
};

// ---------- 删除用户 ----------
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除用户“${row.userName}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(() => {
      // 模拟删除，实际可替换为真实接口调用
      ElMessage.info("删除功能暂未开放，敬请期待");
      // 如果后端接口已准备好，可替换为以下代码：
      // await deleteUser({ id: row.id });
      // ElMessage.success('删除成功');
      // fetchUserList();
    })
    .catch(() => {});
};

// ---------- 修改密码 ----------
const passwordDialogVisible = ref(false);
const passwordLoading = ref(false);
const passwordFormRef = ref(null);
const passwordForm = reactive({
  id: null,
  oldPassword: "",
  newPassword: "",
  confirmPassword: ""
});

const validateConfirm = (rule, value, callback) => {
  if (value !== passwordForm.newPassword) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const passwordRules = {
  oldPassword: [{ required: true, message: "请输入旧密码", trigger: "blur" }],
  newPassword: [
    { required: true, message: "请输入新密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入新密码", trigger: "blur" },
    { validator: validateConfirm, trigger: "blur" }
  ]
};

const handleChangePassword = (row) => {
  passwordForm.id = row.id;
  passwordDialogVisible.value = true;
};

const resetPasswordForm = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordFormRef.value?.clearValidate();
};

// 用户表单提交成功后的回调
const onUserFormSuccess = () => {
  fetchUserList();
  if (userFormMode.value === "edit" && editData.value && Number(editData.value.id) === Number(currentUserId)) {
    ElMessageBox.confirm("您修改了当前登录账号的信息，需要重新登录才能生效。是否立即退出？", "提示", {
      confirmButtonText: "立即退出",
      cancelButtonText: "稍后",
      type: "warning"
    })
      .then(() => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userName");
        localStorage.removeItem("nickName");
        localStorage.removeItem("userId");
        router.push("/login");
      })
      .catch(() => {});
  }
};

const submitChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate();
  passwordLoading.value = true;
  try {
    const res = await changePassword({
      id: passwordForm.id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    if (res.code === 200) {
      ElMessage.success(res.message || "密码修改成功");
      passwordDialogVisible.value = false;
      if (Number(passwordForm.id) === Number(currentUserId)) {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
        localStorage.removeItem("userName");
        localStorage.removeItem("nickName");
        localStorage.removeItem("userId");
        ElMessage.info("请使用新密码重新登录");
        router.push("/login");
      }
    } else {
      ElMessage.error(res.message || "密码修改失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("密码修改失败，请重试");
  } finally {
    passwordLoading.value = false;
  }
};

onMounted(() => {
  fetchUserList();
});
</script>

<style scoped>
.demo-form-inline {
  margin-bottom: 20px;
}
.el-pagination {
  margin-top: 20px;
  justify-content: flex-end;
}
</style>
