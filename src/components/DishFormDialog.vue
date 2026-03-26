<template>
  <el-dialog :title="mode === 'add' ? '新增菜品' : '编辑菜品'" v-model="dialogVisible" width="500px" @close="resetForm">
    <el-form ref="formRef" :model="formData" :rules="formRules" label-width="80px" label-position="right">
      <el-form-item label="菜品名称" prop="cuisineName">
        <el-input v-model="formData.cuisineName" placeholder="请输入菜品名称" />
      </el-form-item>
      <el-form-item label="食材">
        <el-input v-model="formData.ingredients" type="textarea" :rows="2" placeholder="例如：猪肉、白菜、豆腐" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="调料">
        <el-input v-model="formData.seasonings" type="textarea" :rows="2" placeholder="例如：盐、生抽、料酒" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="菜品说明" prop="description">
        <el-input v-model="formData.description" type="textarea" :rows="3" placeholder="请输入菜品说明" maxlength="500" show-word-limit />
      </el-form-item>
      <el-form-item label="菜品图片">
        <el-upload class="avatar-uploader" action="#" :before-upload="handleBeforeUpload" :http-request="() => {}" :show-file-list="false">
          <img v-if="formData.imageUrl" :src="getImageUrl(formData.imageUrl)" class="avatar" />
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
        <div class="el-upload__tip">只能上传 jpg/png/gif 文件，且不超过 10MB</div>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogVisible = false">取消</el-button>
      <el-button type="primary" @click="submitForm" :loading="submitLoading">确定</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch, reactive, computed } from "vue";
import { ElMessage } from "element-plus";
import { addCuisine, updateCuisine } from "../api/dish";
import { useImageUpload } from "../composables/useImageUpload";
import { Plus } from "@element-plus/icons-vue";

const props = defineProps({
  visible: Boolean,
  mode: {
    type: String,
    default: "add" // 'add' 或 'edit'
  },
  initialData: {
    type: Object,
    default: null
  },
  categoryType: {
    type: Number,
    default: 0 // 新增时使用的分类类型
  }
});

const emit = defineEmits(["update:visible", "success"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

const formRef = ref(null);
const submitLoading = ref(false);

// 表单数据
const formData = reactive({
  id: null,
  cuisineName: "",
  ingredients: "",
  seasonings: "",
  description: "",
  imageUrl: "",
  cuisineType: 0
});

// 表单验证规则
const formRules = {
  cuisineName: [
    { required: true, message: "请输入菜品名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

// 监听 visible 和 initialData 变化，填充表单
watch(
  () => [props.visible, props.initialData],
  () => {
    if (props.visible) {
      if (props.mode === "edit" && props.initialData) {
        formData.id = props.initialData.id;
        formData.cuisineName = props.initialData.cuisineName;
        formData.description = props.initialData.description || "";
        formData.ingredients = props.initialData.ingredients || "";
        formData.seasonings = props.initialData.seasonings || "";
        formData.imageUrl = props.initialData.imageUrl || "";
        formData.cuisineType = props.initialData.cuisineType;
      } else {
        resetForm();
        formData.cuisineType = props.categoryType;
      }
    }
  },
  { immediate: true }
);

const resetForm = () => {
  if (formRef.value) formRef.value.resetFields();
  formData.id = null;
  formData.cuisineName = "";
  formData.ingredients = "";
  formData.seasonings = "";
  formData.description = "";
  formData.imageUrl = "";
};

const { uploadImage, uploading } = useImageUpload();

const handleBeforeUpload = async (file) => {
  // 调用 useImageUpload 中的上传方法
  const url = await uploadImage(file);
  if (url) {
    formData.imageUrl = url;
    return false; // 阻止默认上传
  }
  return false;
};

const submitForm = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const submitData = {
        cuisineName: formData.cuisineName,
        ingredients: formData.ingredients || null,
        seasonings: formData.seasonings || null,
        description: formData.description || null,
        imageUrl: formData.imageUrl || null
      };
      if (props.mode === "add") {
        submitData.cuisineType = formData.cuisineType;
        await addCuisine(submitData);
        ElMessage.success("新增成功");
      } else {
        submitData.id = formData.id;
        await updateCuisine(submitData);
        ElMessage.success("修改成功");
      }
      dialogVisible.value = false;
      emit("success");
    } catch (error) {
      console.error("提交失败：", error);
      ElMessage.error(props.mode === "add" ? "新增失败" : "修改失败");
    } finally {
      submitLoading.value = false;
    }
  });
};

// 图片URL辅助函数
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";
const getImageUrl = (relativePath) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `${imageBaseUrl}${relativePath}`;
};
</script>

<style scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
  object-fit: cover;
  border-radius: 6px;
  border: 1px solid #dcdfe6;
}
.avatar-uploader .el-upload {
  border: 1px dashed #d9d9d9;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}
.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}
.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 100px;
  height: 100px;
  text-align: center;
  line-height: 100px;
}
.el-upload__tip {
  margin-top: 0;
  color: #909399;
  font-size: 12px;
  line-height: 1.5;
}
.avatar-uploader {
  margin-bottom: 16px;
}
</style>
