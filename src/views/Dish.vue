<template>
  <div>
    <h2 style="margin: 0 0 16px 0">菜品管理</h2>

    <!-- 分类 Tab 切换 -->
    <el-tabs v-model="activeTab" @tab-click="handleTabClick">
      <el-tab-pane label="荤菜" name="0"></el-tab-pane>
      <el-tab-pane label="素菜" name="1"></el-tab-pane>
      <el-tab-pane label="汤粥" name="2"></el-tab-pane>
    </el-tabs>

    <!-- 筛选区域 + 新增按钮 -->
    <el-form :inline="true" :model="queryParams" class="demo-form-inline" style="margin-top: 16px" @submit.prevent>
      <el-form-item label="菜品名称">
        <el-input v-model="queryParams.cuisineName" placeholder="请输入菜品名称" clearable @keyup.enter="handleSearch" />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="handleSearch">查询</el-button>
        <el-button @click="resetSearch">重置</el-button>
        <!-- 新增按钮，根据当前 tab 显示对应分类名称 -->
        <el-button type="success" @click="handleAdd" style="margin-left: 12px"> 新增{{ currentTabName }} </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dishList" border stripe style="margin-top: 16px">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="cuisineName" label="菜品名称" />
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

    <!-- 新增菜品弹窗（只保留菜品名称输入） -->
    <el-dialog v-model="addDialogVisible" title="新增菜品" width="500px" @close="resetAddForm">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px" label-position="right">
        <el-form-item label="菜品名称" prop="cuisineName">
          <el-input v-model="addForm.cuisineName" placeholder="请输入菜品名称" />
        </el-form-item>
        <!-- 分类已根据当前标签页自动填充，无需显示 -->
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAdd" :loading="addLoading">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from "vue";
import { ElMessage } from "element-plus";
import { getCuisineList, addCuisine } from "../api/dish";

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

// 新增弹窗
const addDialogVisible = ref(false);
const addLoading = ref(false);
const addFormRef = ref(null);
const addForm = reactive({
  cuisineName: "",
  cuisineType: 0
});
const addFormRules = {
  cuisineName: [
    { required: true, message: "请输入菜品名称", trigger: "blur" },
    { min: 2, max: 20, message: "长度在 2 到 20 个字符", trigger: "blur" }
  ]
};

// 根据当前 tab 获取分类名称（用于按钮文字）
const currentTabName = computed(() => {
  const map = { 0: "荤菜", 1: "素菜", 2: "汤粥" };
  return map[activeTab.value] || "菜品";
});

// 获取菜品列表
const fetchDishList = async () => {
  loading.value = true;
  try {
    const params = { ...queryParams };
    if (params.cuisineName === "") {
      params.cuisineName = null;
    }
    const res = await getCuisineList(params);
    dishList.value = res.data || [];
    total.value = res.totalCount || 0;
  } catch (error) {
    console.error(error);
    ElMessage.error("获取菜品列表失败");
  } finally {
    loading.value = false;
  }
};

// Tab 点击事件
const handleTabClick = (tab) => {
  queryParams.cuisineType = parseInt(tab.paneName);
  queryParams.pageIndex = 1;
  fetchDishList();
};

// 查询按钮
const handleSearch = () => {
  queryParams.pageIndex = 1;
  fetchDishList();
};

// 重置筛选条件
const resetSearch = () => {
  queryParams.cuisineName = "";
  queryParams.pageIndex = 1;
  fetchDishList();
};

// 每页条数变化
const handleSizeChange = (size) => {
  queryParams.pageSize = size;
  queryParams.pageIndex = 1;
  fetchDishList();
};

// 当前页变化
const handleCurrentChange = (page) => {
  queryParams.pageIndex = page;
  fetchDishList();
};

// 分类数字转中文显示
const getCuisineTypeText = (type) => {
  const map = { 0: "荤菜", 1: "素菜", 2: "汤粥" };
  return map[type] || "未知";
};

// 新增菜品：根据当前 tab 设置分类并打开弹窗
const handleAdd = () => {
  addForm.cuisineType = parseInt(activeTab.value);
  addDialogVisible.value = true;
};

// 重置新增表单
const resetAddForm = () => {
  if (addFormRef.value) {
    addFormRef.value.resetFields();
  }
  addForm.cuisineName = "";
};

// 提交新增
const submitAdd = async () => {
  if (!addFormRef.value) return;
  await addFormRef.value.validate(async (valid) => {
    if (valid) {
      addLoading.value = true;
      try {
        await addCuisine({
          cuisineName: addForm.cuisineName,
          cuisineType: addForm.cuisineType
        });
        ElMessage.success("新增成功");
        addDialogVisible.value = false;
        fetchDishList();
      } catch (error) {
        console.error(error);
        ElMessage.error("新增失败");
      } finally {
        addLoading.value = false;
      }
    }
  });
};

// 初始化加载
onMounted(() => {
  fetchDishList();
});

// 操作函数（待实现）
const handleEdit = (row) => {
  ElMessage.info("编辑功能待实现");
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
