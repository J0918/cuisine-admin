<template>
  <div>
    <h2>用户管理</h2>

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

    <!-- 新增用户对话框 -->
    <el-dialog v-model="addDialogVisible" title="新增用户" width="500px" @close="resetAddForm">
      <el-form :model="addForm" :rules="addRules" ref="addFormRef" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="addForm.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="addForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="addForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="addForm.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="addDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitAdd" :loading="addLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 编辑用户对话框 -->
    <el-dialog v-model="editDialogVisible" title="编辑用户" width="500px" @close="resetEditForm">
      <el-form :model="editForm" :rules="editRules" ref="editFormRef" label-width="80px">
        <el-form-item label="用户名" prop="userName">
          <el-input v-model="editForm.userName" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="昵称" prop="nickName">
          <el-input v-model="editForm.nickName" placeholder="请输入昵称" />
        </el-form-item>
        <el-form-item label="手机号" prop="phoneNumber">
          <el-input v-model="editForm.phoneNumber" placeholder="请输入手机号" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="editDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitEdit" :loading="editLoading">保存</el-button>
        </span>
      </template>
    </el-dialog>

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
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { getUserList, addUser, updateUser, changePassword } from "../api/user";

// 查询参数（包含分页）
const queryParams = reactive({
  userName: "",
  nickName: "",
  pageIndex: 1,
  pageSize: 10
});

const userList = ref([]); // 表格数据
const total = ref(0); // 总记录数
const loading = ref(false); // 加载状态

// 获取用户列表
const fetchUserList = async () => {
  loading.value = true;
  try {
    const res = await getUserList(queryParams);
    userList.value = res.data || []; // 数据数组
    total.value = res.totalCount || 0; // 总条数
  } catch (error) {
    console.error(error);
    ElMessage.error("获取用户列表失败");
  } finally {
    loading.value = false;
  }
};

// 查询按钮
const handleSearch = () => {
  queryParams.pageIndex = 1; // 重置到第一页
  fetchUserList();
};

// 重置筛选条件
const resetSearch = () => {
  queryParams.userName = "";
  queryParams.nickName = "";
  queryParams.pageIndex = 1;
  fetchUserList();
};

// 每页条数变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageIndex = 1; // 通常改变每页条数后也回到第一页
  fetchUserList();
};

// 当前页变化
const handleCurrentChange = (page) => {
  queryParams.pageIndex = page;
  fetchUserList();
};

// 初始化加载
onMounted(() => {
  fetchUserList();
});

// ---------- 新增用户 ----------
const addDialogVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  userName: "",
  nickName: "",
  phoneNumber: "",
  password: "",
  confirmPassword: ""
});

// 新增表单校验规则
const validateAddConfirm = (rule, value, callback) => {
  if (value !== addForm.password) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const addRules = {
  userName: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  phoneNumber: [
    { required: true, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
  ],
  password: [
    { required: true, message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: true, message: "请再次输入密码", trigger: "blur" },
    { validator: validateAddConfirm, trigger: "blur" }
  ]
};

// 点击新增按钮
const handleAdd = () => {
  addDialogVisible.value = true;
};

// 重置新增表单
const resetAddForm = () => {
  addForm.userName = "";
  addForm.nickName = "";
  addForm.phoneNumber = "";
  addForm.password = "";
  addForm.confirmPassword = "";
  addFormRef.value?.clearValidate();
};

// 提交新增
const submitAdd = async () => {
  if (!addFormRef.value) return;
  await addFormRef.value.validate();
  addLoading.value = true;
  try {
    const res = await addUser({
      userName: addForm.userName,
      nickName: addForm.nickName,
      phoneNumber: addForm.phoneNumber,
      password: addForm.password
    });
    if (res.code === 200) {
      ElMessage.success(res.message || "新增成功");
      addDialogVisible.value = false;
      fetchUserList(); // 刷新列表
    } else {
      ElMessage.error(res.message || "新增失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("新增失败，请重试");
  } finally {
    addLoading.value = false;
  }
};

// ---------- 编辑用户 ----------
const editDialogVisible = ref(false);
const editLoading = ref(false);
const editFormRef = ref(null);
const editForm = reactive({
  id: null,
  userName: "",
  nickName: "",
  phoneNumber: ""
});

// 编辑表单校验规则
const editRules = {
  userName: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  phoneNumber: [{ pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }]
};

// 点击编辑按钮
const handleEdit = (row) => {
  // 将当前行数据填充到表单（注意不要直接赋值整个对象，避免影响原数据）
  editForm.id = row.id;
  editForm.userName = row.userName;
  editForm.nickName = row.nickName;
  editForm.phoneNumber = row.phoneNumber;
  editDialogVisible.value = true;
};

// 重置编辑表单
const resetEditForm = () => {
  editForm.id = null;
  editForm.userName = "";
  editForm.nickName = "";
  editForm.phoneNumber = "";
  editFormRef.value?.clearValidate(); // 清除校验状态
};

// 提交编辑
const submitEdit = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(); // 校验表单
  editLoading.value = true;
  try {
    const res = await updateUser({
      id: editForm.id,
      userName: editForm.userName,
      nickName: editForm.nickName,
      phoneNumber: editForm.phoneNumber
    });
    // 假设后端返回格式：{ code:200, message:'修改成功', data:false }
    if (res.code === 200) {
      ElMessage.success(res.message || "修改成功");
      editDialogVisible.value = false;
      fetchUserList(); // 刷新列表
    } else {
      ElMessage.error(res.message || "修改失败");
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("修改失败，请重试");
  } finally {
    editLoading.value = false;
  }
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

// 密码校验规则
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

// 点击修改密码按钮
const handleChangePassword = (row) => {
  passwordForm.id = row.id; // 记录当前用户ID
  passwordDialogVisible.value = true;
};

// 重置密码表单
const resetPasswordForm = () => {
  passwordForm.oldPassword = "";
  passwordForm.newPassword = "";
  passwordForm.confirmPassword = "";
  passwordFormRef.value?.clearValidate();
};

// 提交修改密码
const submitChangePassword = async () => {
  if (!passwordFormRef.value) return;
  await passwordFormRef.value.validate();
  passwordLoading.value = true;
  try {
    // 调用接口，使用 GET 传参
    const res = await changePassword({
      id: passwordForm.id,
      oldPassword: passwordForm.oldPassword,
      newPassword: passwordForm.newPassword
    });
    if (res.code === 200) {
      ElMessage.success(res.message || "密码修改成功");
      passwordDialogVisible.value = false;
      // 修改密码后通常不需要刷新列表，但可以提示成功
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

const handleDelete = (row) => {
  ElMessage.info("删除功能待实现");
};
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
