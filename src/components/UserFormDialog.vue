<template>
  <el-dialog :model-value="visible" :title="mode === 'add' ? '新增用户' : '编辑用户'" width="500px" @close="handleClose">
    <el-form ref="formRef" :model="formData" :rules="rules" label-width="80px">
      <el-form-item label="用户名" prop="userName">
        <el-input v-model="formData.userName" placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="昵称" prop="nickName">
        <el-input v-model="formData.nickName" placeholder="请输入昵称" />
      </el-form-item>
      <el-form-item label="手机号" prop="phoneNumber">
        <el-input v-model="formData.phoneNumber" placeholder="请输入手机号" />
      </el-form-item>
      <!-- 新增时才显示密码字段 -->
      <template v-if="mode === 'add'">
        <el-form-item label="密码" prop="password">
          <el-input v-model="formData.password" type="password" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-form-item label="确认密码" prop="confirmPassword">
          <el-input v-model="formData.confirmPassword" type="password" show-password placeholder="请再次输入密码" />
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="handleClose">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="loading"> 保存 </el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick } from "vue";
import { ElMessage } from "element-plus";
import { addUser, updateUser } from "../api/user";

const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: "add" // 'add' 或 'edit'
  },
  initialData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(["update:visible", "success"]);

const formRef = ref(null);
const loading = ref(false);

// 表单数据
const formData = reactive({
  id: null,
  userName: "",
  nickName: "",
  phoneNumber: "",
  password: "",
  confirmPassword: ""
});

// 校验规则
const validateConfirm = (rule, value, callback) => {
  if (value !== formData.password) {
    callback(new Error("两次输入密码不一致"));
  } else {
    callback();
  }
};

const rules = {
  userName: [
    { required: true, message: "请输入用户名", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ],
  nickName: [{ required: true, message: "请输入昵称", trigger: "blur" }],
  phoneNumber: [
    { required: props.mode === "add" ? true : false, message: "请输入手机号", trigger: "blur" },
    { pattern: /^1[3-9]\d{9}$/, message: "请输入正确的手机号", trigger: "blur" }
  ],
  password: [
    { required: props.mode === "add", message: "请输入密码", trigger: "blur" },
    { min: 6, max: 20, message: "长度在 6 到 20 个字符", trigger: "blur" }
  ],
  confirmPassword: [
    { required: props.mode === "add", message: "请再次输入密码", trigger: "blur" },
    { validator: validateConfirm, trigger: "blur" }
  ]
};

// 监听弹窗打开，填充数据（编辑模式）
watch(
  () => props.visible,
  (newVal) => {
    if (newVal && props.mode === "edit" && props.initialData) {
      nextTick(() => {
        formData.id = props.initialData.id;
        formData.userName = props.initialData.userName;
        formData.nickName = props.initialData.nickName;
        formData.phoneNumber = props.initialData.phoneNumber || "";
        // 编辑时不展示密码字段，清空
        formData.password = "";
        formData.confirmPassword = "";
      });
    } else if (newVal && props.mode === "add") {
      // 新增模式重置表单
      resetForm();
    }
  }
);

const resetForm = () => {
  formData.id = null;
  formData.userName = "";
  formData.nickName = "";
  formData.phoneNumber = "";
  formData.password = "";
  formData.confirmPassword = "";
  nextTick(() => {
    formRef.value?.clearValidate();
  });
};

const handleClose = () => {
  emit("update:visible", false);
  resetForm();
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate();
  loading.value = true;
  try {
    let res;
    if (props.mode === "add") {
      res = await addUser({
        userName: formData.userName,
        nickName: formData.nickName,
        phoneNumber: formData.phoneNumber,
        password: formData.password
      });
    } else {
      res = await updateUser({
        id: formData.id,
        userName: formData.userName,
        nickName: formData.nickName,
        phoneNumber: formData.phoneNumber
      });
    }
    if (res.code === 200) {
      ElMessage.success(res.message || (props.mode === "add" ? "新增成功" : "修改成功"));
      emit("success");
      handleClose();
    } else {
      ElMessage.error(res.message || (props.mode === "add" ? "新增失败" : "修改失败"));
    }
  } catch (error) {
    console.error(error);
    ElMessage.error("操作失败，请重试");
  } finally {
    loading.value = false;
  }
};
</script>
