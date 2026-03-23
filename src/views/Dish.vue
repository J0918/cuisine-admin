<template>
  <div>
    <h2 style="margin: 0 0 16px 0">菜品管理</h2>

    <!-- 分类 Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="荤菜" name="0"></el-tab-pane>
      <el-tab-pane label="素菜" name="1"></el-tab-pane>
      <el-tab-pane label="汤粥" name="2"></el-tab-pane>
      <el-tab-pane label="其他菜系" name="3"></el-tab-pane>
    </el-tabs>

    <!-- 筛选区域 + 新增按钮 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline" style="margin-top: 16px" @submit.prevent>
      <el-form-item label="菜品名称">
        <el-input v-model="queryParams.cuisineName" placeholder="请输入菜品名称" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <el-button type="success" @click="handleAdd" style="margin-left: 12px"> 新增{{ currentTabName }} </el-button>
        <el-button type="warning" @click="openRandomDialog" style="margin-left: 12px"> 今天吃什么 </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dishList" border stripe style="margin-top: 16px">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="cuisineName" label="菜品名称" />
      <el-table-column prop="description" label="菜品描述" />
      <el-table-column label="菜品图片" width="100">
        <template #default="{ row }">
          <el-image v-if="row.imageUrl" :src="getImageUrl(row.imageUrl)" :preview-src-list="[getImageUrl(row.imageUrl)]" fit="cover" style="width: 50px; height: 50px; border-radius: 4px" />
          <span v-else style="color: #999">无图</span>
        </template>
      </el-table-column>
      <el-table-column label="分类" width="120">
        <template #default="{ row }">
          {{ getCuisineTypeText(row.cuisineType) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180">
        <template #default="{ row }">
          <el-button size="small" type="primary" @click="handleEdit(row)">编辑</el-button>
          <el-button size="small" type="danger" @click="handleDelete(row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 随机菜单弹窗 -->
    <el-dialog v-model="randomDialogVisible" title="今天吃什么" width="600px" @close="randomDialogVisible = false">
      <div style="margin-bottom: 20px">
        <el-form :inline="true" :model="randomParams" label-width="80px">
          <el-form-item label="荤菜数量">
            <el-input-number v-model="randomParams.meatCount" :min="0" :max="99" controls-position="right" />
          </el-form-item>
          <el-form-item label="素菜数量">
            <el-input-number v-model="randomParams.vegetableCount" :min="0" :max="99" controls-position="right" />
          </el-form-item>
          <el-form-item label="汤粥数量">
            <el-input-number v-model="randomParams.soupCount" :min="0" :max="99" controls-position="right" />
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="generateRandomMenu" :loading="randomLoading">生成菜单</el-button>
          </el-form-item>
        </el-form>
      </div>

      <!-- 展示结果 -->
      <div v-if="randomResult.length > 0">
        <el-divider>今日推荐</el-divider>
        <el-row :gutter="16">
          <!-- 荤菜 -->
          <el-col :span="8" v-if="randomResult.filter((item) => item.cuisineType === 0).length > 0">
            <h4 style="color: #f56c6c">荤菜</h4>
            <ul style="padding-left: 20px">
              <li v-for="item in randomResult.filter((item) => item.cuisineType === 0)" :key="item.id">
                {{ item.cuisineName }}
                {{ item.description }}
              </li>
            </ul>
          </el-col>
          <!-- 素菜 -->
          <el-col :span="8" v-if="randomResult.filter((item) => item.cuisineType === 1).length > 0">
            <h4 style="color: #67c23a">素菜</h4>
            <ul style="padding-left: 20px">
              <li v-for="item in randomResult.filter((item) => item.cuisineType === 1)" :key="item.id">
                {{ item.cuisineName }}
                {{ item.description }}
              </li>
            </ul>
          </el-col>
          <!-- 汤粥 -->
          <el-col :span="8" v-if="randomResult.filter((item) => item.cuisineType === 2).length > 0">
            <h4 style="color: #409eff">汤粥</h4>
            <ul style="padding-left: 20px">
              <li v-for="item in randomResult.filter((item) => item.cuisineType === 2)" :key="item.id">
                {{ item.cuisineName }}
                {{ item.description }}
              </li>
            </ul>
          </el-col>
          <!-- 其他菜系 -->
          <el-col :span="8" v-if="randomResult.filter((item) => item.cuisineType === 3).length > 0">
            <h4 style="color: #909399">其他菜系</h4>
            <ul style="padding-left: 20px">
              <li v-for="item in randomResult.filter((item) => item.cuisineType === 3)" :key="item.id">
                {{ item.cuisineName }}
                {{ item.description }}
              </li>
            </ul>
          </el-col>
        </el-row>
      </div>
      <div v-else style="text-align: center; color: #999; padding: 20px">点击「生成菜单」查看今日随机菜品</div>

      <template #footer>
        <el-button @click="randomDialogVisible = false">关闭</el-button>
      </template>
    </el-dialog>

    <!-- 分页 -->
    <el-pagination
      v-model:current-page="queryParams.pageIndex"
      v-model:page-size="queryParams.pageSize"
      :page-sizes="[10, 20, 30, 50]"
      layout="total, sizes, prev, pager, next, jumper"
      :total="total"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      style="margin-top: 20px; justify-content: flex-end" />

    <!-- 新增菜品弹窗 -->
    <el-dialog v-model="addDialogVisible" title="新增菜品" width="500px" @close="resetAddForm">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px" label-position="right">
        <el-form-item label="菜品名称" prop="cuisineName">
          <el-input v-model="addForm.cuisineName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="菜品说明" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="3" placeholder="请输入菜品说明" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="菜品图片">
          <el-upload class="avatar-uploader" action="#" :before-upload="(file) => handleBeforeUpload(file, 'add')" :http-request="() => {}" :show-file-list="false">
            <img v-if="addForm.imageUrl" :src="getImageUrl(addForm.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">只能上传 jpg/png/gif 文件，且不超过 10MB</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd" :loading="addLoading">确定</el-button>
      </template>
    </el-dialog>

    <!-- 编辑菜品弹窗 -->
    <el-dialog v-model="editDialogVisible" title="编辑菜品" width="500px" @close="resetEditForm">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px" label-position="right">
        <el-form-item label="菜品名称" prop="cuisineName">
          <el-input v-model="editForm.cuisineName" placeholder="请输入菜品名称" />
        </el-form-item>
        <el-form-item label="菜品说明" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" placeholder="请输入菜品说明" maxlength="500" show-word-limit />
        </el-form-item>
        <el-form-item label="菜品图片">
          <el-upload class="avatar-uploader" action="#" :before-upload="(file) => handleBeforeUpload(file, 'edit')" :http-request="() => {}" :show-file-list="false">
            <img v-if="editForm.imageUrl" :src="getImageUrl(editForm.imageUrl)" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
          </el-upload>
          <div class="el-upload__tip">只能上传 jpg/png/gif 文件，且不超过 10MB</div>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEdit" :loading="editLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCuisineList, addCuisine, updateCuisine, deleteCuisine, getRandomCuisine, uploadImage } from "../api/dish";
import { Plus } from "@element-plus/icons-vue";

// 当前激活的 tab（对应 cuisineType）
const activeTab = ref("0");

// 查询参数
const queryParams = reactive({
  cuisineType: 0,
  cuisineName: "",
  pageIndex: 1,
  pageSize: 10
});

const dishList = ref([]);
const total = ref(0);
const loading = ref(false);

// 获取菜品列表
const fetchDishList = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams };
    if (params.cuisineName === "") {
      params.cuisineName = null;
    }
    const res = await getCuisineList(params);
    if (res.code === 200 && res.data) {
      dishList.value = res.data.data || [];
      total.value = res.data.totalCount || 0;
    } else {
      ElMessage.error(res.message || "获取菜品列表失败");
      dishList.value = [];
      total.value = 0;
    }
  } catch (error) {
    console.error("获取菜品列表失败：", error);
    ElMessage.error("获取菜品列表失败");
  } finally {
    loading.value = false;
  }
};

const handleTabClick = (tab) => {
  queryParams.cuisineType = parseInt(tab.paneName);
  queryParams.pageIndex = 1;
  fetchDishList();
};

const handleSearch = () => {
  queryParams.pageIndex = 1;
  fetchDishList();
};

const resetSearch = () => {
  queryParams.cuisineName = "";
  queryParams.pageIndex = 1;
  fetchDishList();
};

const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageIndex = 1;
  fetchDishList();
};

const handleCurrentChange = (page) => {
  queryParams.pageIndex = page;
  fetchDishList();
};

const getCuisineTypeText = (type) => {
  const map = { 0: "荤菜", 1: "素菜", 2: "汤粥", 3: "其他菜系" };
  return map[type] || "未知";
};

// ---------- 新增菜品 ----------
const addDialogVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref(null);
// 新增表单
const addForm = reactive({
  cuisineName: "",
  cuisineType: 0,
  description: "",
  imageUrl: ""
});

const addFormRules = {
  cuisineName: [
    { required: true, message: "请输入菜品名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

// 根据当前 tab 获取分类名称（用于按钮文字）
const currentTabName = computed(() => {
  const map = { 0: "荤菜", 1: "素菜", 2: "汤粥", 3: "其他菜系" };
  return map[activeTab.value] || "菜品";
});

const handleAdd = () => {
  addForm.cuisineType = parseInt(activeTab.value);
  addDialogVisible.value = true;
};

const resetAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields();
  }
  addForm.cuisineName = "";
  addForm.description = "";
  addForm.imageUrl = "";
};

//新增提交
const submitAdd = async () => {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      addLoading.value = true;
      try {
        console.log("新增提交参数：", {
          cuisineName: addForm.cuisineName,
          cuisineType: addForm.cuisineType,
          description: addForm.description || null,
          imageUrl: addForm.imageUrl || null
        });
        await addCuisine({
          cuisineName: addForm.cuisineName,
          cuisineType: addForm.cuisineType,
          description: addForm.description || null,
          imageUrl: addForm.imageUrl || null
        });
        ElMessage.success("新增成功");
        addDialogVisible.value = false;
        fetchDishList();
      } catch (error) {
        console.error("新增菜品失败：", error);
        ElMessage.error("新增失败");
      } finally {
        addLoading.value = false;
      }
    }
  });
};

// ---------- 编辑菜品 ----------
const editDialogVisible = ref(false);
const editLoading = ref(false);
const editFormRef = ref(null);
// 编辑表单
const editForm = reactive({
  id: null,
  cuisineName: "",
  description: "",
  imageUrl: ""
});

const editFormRules = {
  cuisineName: [
    { required: true, message: "请输入菜品名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

const handleEdit = (row) => {
  editForm.id = row.id;
  editForm.cuisineName = row.cuisineName;
  editForm.description = row.description || "";
  editForm.imageUrl = row.imageUrl || "";
  editDialogVisible.value = true;
  console.log("编辑弹窗打开时 imageUrl：", editForm.imageUrl);
};

const resetEditForm = () => {
  if (editFormRef.value) {
    editFormRef.value.resetFields();
  }
  editForm.id = null;
  editForm.cuisineName = "";
  editForm.description = "";
  editForm.imageUrl = "";
};

//编辑提交
const submitEdit = async () => {
  if (!editFormRef.value) return;
  await editFormRef.value.validate(async (valid) => {
    if (valid) {
      editLoading.value = true;
      try {
        console.log("编辑提交参数：", {
          id: editForm.id,
          cuisineName: editForm.cuisineName,
          description: editForm.description || null,
          imageUrl: editForm.imageUrl || null
        });
        await updateCuisine({
          id: editForm.id,
          cuisineName: editForm.cuisineName,
          description: editForm.description || null,
          imageUrl: editForm.imageUrl || null
        });
        ElMessage.success("修改成功");
        editDialogVisible.value = false;
        fetchDishList();
      } catch (error) {
        console.error("修改菜品失败：", error);
        ElMessage.error("修改失败");
      } finally {
        editLoading.value = false;
      }
    }
  });
};

// ---------- 删除菜品 ----------
const handleDelete = (row) => {
  ElMessageBox.confirm(`确认删除菜品“${row.cuisineName}”吗？`, "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning"
  })
    .then(async () => {
      try {
        await deleteCuisine({ id: row.id });
        ElMessage.success("删除成功");
        fetchDishList();
      } catch (error) {
        console.error("删除菜品失败：", error);
        ElMessage.error("删除失败");
      }
    })
    .catch(() => {});
};

// ---------- 随机菜单 ----------
const randomDialogVisible = ref(false);
const randomLoading = ref(false);
const randomParams = reactive({
  meatCount: 0,
  vegetableCount: 0,
  soupCount: 0
});
const randomResult = ref([]);

const openRandomDialog = () => {
  randomParams.meatCount = 0;
  randomParams.vegetableCount = 0;
  randomParams.soupCount = 0;
  randomResult.value = [];
  randomDialogVisible.value = true;
};

const generateRandomMenu = async () => {
  // 数据验证
  if (randomParams.meatCount < 0 || randomParams.vegetableCount < 0 || randomParams.soupCount < 0) {
    ElMessage.warning("数量不能为负数");
    return;
  }
  if (randomParams.meatCount + randomParams.vegetableCount + randomParams.soupCount === 0) {
    ElMessage.warning("请至少选择一道菜");
    return;
  }
  if (randomParams.meatCount > 5 || randomParams.vegetableCount > 5 || randomParams.soupCount > 5) {
    ElMessage.warning("每类菜品最多选择5个");
    return;
  }
  if (randomParams.meatCount + randomParams.vegetableCount + randomParams.soupCount > 10) {
    ElMessage.warning("菜品总数不能超过10");
    return;
  }

  randomLoading.value = true;
  try {
    const res = await getRandomCuisine({
      meatCount: randomParams.meatCount,
      vegetableCount: randomParams.vegetableCount,
      soupCount: randomParams.soupCount
    });
    if (res.code === 200) {
      randomResult.value = res.data || [];
      if (randomResult.value.length === 0) {
        ElMessage.info("暂无符合条件的菜品");
      } else {
        // 提示实际返回的数量（如果少于请求数量）
        const meatActual = randomResult.value.filter((item) => item.cuisineType === 0).length;
        const vegActual = randomResult.value.filter((item) => item.cuisineType === 1).length;
        const soupActual = randomResult.value.filter((item) => item.cuisineType === 2).length;
        if (meatActual < randomParams.meatCount || vegActual < randomParams.vegetableCount || soupActual < randomParams.soupCount) {
          ElMessage.warning("部分菜品数量不足，已返回全部可用菜品");
        }
      }
    } else {
      ElMessage.error(res.message || "获取失败");
    }
  } catch (error) {
    console.error("生成随机菜单失败：", error);
    ElMessage.error("随机菜单生成失败");
  } finally {
    randomLoading.value = false;
  }
};

// 初始化加载
onMounted(() => {
  fetchDishList();
});

// 图片上传核心逻辑（简化版）
const handleBeforeUpload = async (file, type) => {
  // 1. 校验文件格式和大小
  const isImage = ["image/jpeg", "image/jpg", "image/png", "image/gif"].includes(file.type);
  const isLt5M = file.size / 1024 / 1024 < 10;

  if (!isImage) {
    ElMessage.error("上传图片只能是 JPG/PNG/GIF 格式!");
    return false;
  }
  if (!isLt5M) {
    ElMessage.error("上传图片大小不能超过 10MB!");
    return false;
  }

  // 2. 直接调用上传接口
  try {
    const res = await uploadImage(file);
    if (res.code === 200) {
      const imageUrl = res.data;
      // 3. 根据类型赋值到对应表单
      if (type === "add") {
        addForm.imageUrl = imageUrl;
        console.log("新增上传后 imageUrl：", addForm.imageUrl);
      } else if (type === "edit") {
        editForm.imageUrl = imageUrl;
        console.log("编辑上传后 imageUrl：", editForm.imageUrl);
      }
      ElMessage.success("图片上传成功");
    } else {
      ElMessage.error(res.message || "图片上传失败");
    }
  } catch (err) {
    console.error("图片上传异常：", err);
    ElMessage.error("图片上传请求异常，请重试");
  }

  // 阻止组件默认上传行为
  return false;
};

// 从环境变量获取图片基础路径（注意不要尾部斜杠）
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";

// 处理图片 URL
const getImageUrl = (relativePath) => {
  if (!relativePath) return "";
  // 如果已经是完整 URL 则直接返回
  if (relativePath.startsWith("http")) return relativePath;
  return `${imageBaseUrl}${relativePath}`;
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
  margin-top: 0; /* 清除提示文字的上边距，由 avatar-uploader 控制间距 */
  color: #909399;
  font-size: 12px;
  line-height: 1.5; /* 增加行高，避免文字拥挤 */
}
.avatar-uploader {
  margin-bottom: 16px; /* 给上传组件底部增加一点间距 */
}
</style>
