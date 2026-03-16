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
      </el-form-item>
    </el-form>

    <!-- 表格 -->
    <el-table v-loading="loading" :data="userList" border stripe>
      <el-table-column type="index" label="序号" width="60" />
      <el-table-column prop="userName" label="用户名" />
      <el-table-column prop="nickName" label="昵称" />
      <el-table-column prop="phoneNumber" label="手机号" />
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
      @current-change="handleCurrentChange" />
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, watch } from "vue";
import { ElMessage } from "element-plus";
import { getUserList } from "../api/user";

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
