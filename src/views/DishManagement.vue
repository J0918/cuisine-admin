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
        <el-button type="warning" @click="randomDialogVisible = true" style="margin-left: 12px"> 今天吃什么 </el-button>
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="dishList" border stripe style="margin-top: 16px">
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="cuisineName" label="菜品名称" />
      <el-table-column prop="ingredients" label="食材" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.ingredients }}
        </template>
      </el-table-column>
      <el-table-column prop="seasonings" label="调料" min-width="120" show-overflow-tooltip>
        <template #default="{ row }">
          {{ row.seasonings }}
        </template>
      </el-table-column>
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

    <!-- 新增/编辑弹窗 -->
    <DishFormDialog v-model:visible="dishFormVisible" :mode="dishFormMode" :initial-data="editData" :category-type="parseInt(activeTab)" @success="fetchDishList" />

    <!-- 随机菜单弹窗 -->
    <RandomMenuDialog v-model:visible="randomDialogVisible" />
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import { getCuisineList, deleteCuisine } from "../api/dish";
import DishFormDialog from "../components/DishFormDialog.vue";
import RandomMenuDialog from "../components/RandomMenuDialog.vue";

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
    if (params.cuisineName === "") params.cuisineName = null;
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

// 当前分类名称（用于按钮文字）
const currentTabName = computed(() => {
  const map = { 0: "荤菜", 1: "素菜", 2: "汤粥", 3: "其他菜系" };
  return map[activeTab.value] || "菜品";
});

// 新增/编辑弹窗控制
const dishFormVisible = ref(false);
const dishFormMode = ref("add"); // 'add' 或 'edit'
const editData = ref(null);

const handleAdd = () => {
  dishFormMode.value = "add";
  editData.value = null;
  dishFormVisible.value = true;
};

const handleEdit = (row) => {
  dishFormMode.value = "edit";
  // 深拷贝数据，避免弹窗内修改影响原数据
  editData.value = JSON.parse(JSON.stringify(row));
  dishFormVisible.value = true;
};

// 删除菜品
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

// 随机菜单弹窗
const randomDialogVisible = ref(false);

// 图片基础路径
const imageBaseUrl = import.meta.env.VITE_IMAGE_BASE_URL || "";
const getImageUrl = (relativePath) => {
  if (!relativePath) return "";
  if (relativePath.startsWith("http")) return relativePath;
  return `${imageBaseUrl}${relativePath}`;
};

onMounted(() => {
  fetchDishList();
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
