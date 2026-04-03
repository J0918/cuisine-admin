<template>
  <el-dialog v-model="dialogVisible" title="今天吃什么" width="600px" @close="resetDialog">
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

    <div v-if="randomResult.length > 0">
      <el-divider>今日推荐</el-divider>
      <el-row :gutter="16">
        <template v-for="group in groupedResult" :key="group.type">
          <el-col :span="8" v-if="group && group.list && group.list.length">
            <h4 :style="{ color: group.color }">{{ group.label }}</h4>
            <ul style="padding-left: 20px">
              <li v-for="item in group.list" :key="item.id">
                {{ item.cuisineName }}
                {{ item.description }}
              </li>
            </ul>
          </el-col>
        </template>
      </el-row>
    </div>
    <div v-else style="text-align: center; color: #999; padding: 20px">点击「生成菜单」查看今日随机菜品</div>

    <template #footer>
      <el-button @click="dialogVisible = false">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, computed, watch } from "vue";
import { ElMessage } from "element-plus";
import { getRandomCuisine } from "../api/dish";

const props = defineProps({
  visible: Boolean
});
const emit = defineEmits(["update:visible"]);

const dialogVisible = computed({
  get: () => props.visible,
  set: (val) => emit("update:visible", val)
});

const randomParams = ref({
  meatCount: 0,
  vegetableCount: 0,
  soupCount: 0
});
const randomResult = ref([]);
const randomLoading = ref(false);

const groupedResult = computed(() => {
  const groups = [
    { type: 0, label: "荤菜", color: "#f56c6c", list: [] },
    { type: 1, label: "素菜", color: "#67c23a", list: [] },
    { type: 2, label: "汤粥", color: "#409eff", list: [] },
    { type: 3, label: "其他菜系", color: "#909399", list: [] }
  ];
  randomResult.value.forEach((item) => {
    const group = groups.find((g) => g.type === item.cuisineType);
    if (group) group.list.push(item);
  });
  return groups.filter((g) => g.list.length);
});

const generateRandomMenu = async () => {
  const { meatCount, vegetableCount, soupCount } = randomParams.value;
  if (meatCount < 0 || vegetableCount < 0 || soupCount < 0) {
    ElMessage.warning("数量不能为负数");
    return;
  }
  if (meatCount + vegetableCount + soupCount === 0) {
    ElMessage.warning("请至少选择一道菜");
    return;
  }
  if (meatCount > 5 || vegetableCount > 5 || soupCount > 5) {
    ElMessage.warning("每类菜品最多选择5个");
    return;
  }
  if (meatCount + vegetableCount + soupCount > 10) {
    ElMessage.warning("菜品总数不能超过10，请不要造成浪费");
    return;
  }

  randomLoading.value = true;
  try {
    const res = await getRandomCuisine({
      meatCount,
      vegetableCount,
      soupCount
    });
    if (res.code === 200) {
      randomResult.value = res.data || [];
      if (randomResult.value.length === 0) {
        ElMessage.info("暂无符合条件的菜品");
      } else {
        const meatActual = randomResult.value.filter((item) => item.cuisineType === 0).length;
        const vegActual = randomResult.value.filter((item) => item.cuisineType === 1).length;
        const soupActual = randomResult.value.filter((item) => item.cuisineType === 2).length;
        if (meatActual < meatCount || vegActual < vegetableCount || soupActual < soupCount) {
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

const resetDialog = () => {
  randomParams.value = { meatCount: 0, vegetableCount: 0, soupCount: 0 };
  randomResult.value = [];
};

// 弹窗打开时重置数据（避免显示旧数据）
watch(
  () => props.visible,
  (newVal) => {
    if (newVal) {
      resetDialog();
    }
  }
);
</script>
