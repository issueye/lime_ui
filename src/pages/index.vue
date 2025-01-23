<template>
  <div>
    <el-row :gutter="20">
      <!-- 骨架屏，数据加载前的占位 -->
      <template v-if="panels.length === 0">
        <el-col :span="6" v-for="i in 4" :key="i">
          <el-skeleton style="width: 100%" animated loading>
            <template #template>
              <el-card shadow="hover" class="border-0">
                <template #header>
                  <div class="flex justify-between">
                    <el-skeleton-item variant="text" style="width: 50%" />
                    <el-skeleton-item variant="text" style="width: 10%" />
                  </div>
                </template>
                <el-skeleton-item variant="h3" style="width: 80%" />
                <el-divider />
                <div class="flex justify-between text-sm text-gray-500">
                  <el-skeleton-item variant="text" style="width: 50%" />
                  <el-skeleton-item variant="text" style="width: 10%" />
                </div>
              </el-card>
            </template>
          </el-skeleton>
        </el-col>
      </template>

      <!-- 数据展示部分 -->
      <el-col :span="6" v-for="(item, index) in panels" :key="index">
        <el-card shadow="hover">
          <div class="flex">
            <div class="bg-gray-100 p-3 rounded-md">
              <el-icon :size="60" :class="item.color">
                <component :is="item.icon" />
              </el-icon>
            </div>
            <div class="flex flex-col grow h-full items-center">
              <span class="p-3 text-sm text-gray-400">{{ item.title }}</span>
              <div>
                <span class="grow text-3xl font-bold text-gray-500">
                  <CountTo :value="item.value" />
                </span>
                <span class="font-bold text-gray-400 ml-2">{{
                  item.unit
                }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 其他组件 -->
    <IndexNavs />

    <!-- 图表区域 -->
    <el-row :gutter="20" class="mt-5">
      <el-col :span="24"> </el-col>
    </el-row>
  </div>
</template>
  
  <script setup>
import { onMounted, onUnmounted, ref } from "vue";
import CountTo from "~/components/CountTo.vue";
import IndexNavs from "~/components/IndexNavs.vue";
const panels = ref([]);

const setData = () => {
  panels.value = [
    {
      title: "请求总数",
      color: "text-light-blue-500",
      icon: "Switch",
      value: 1,
      unit: "个",
    },
    {
      title: "入栈总流量",
      color: "text-light-blue-500",
      icon: "Bottom",
      value: 1,
      unit: "mb",
    },
    {
      title: "出栈总流量",
      color: "text-violet-500",
      icon: "Top",
      value: 1,
      unit: "mb",
    },
    {
      title: "总流量",
      color: "text-fuchsia-500",
      icon: "histogram",
      value: 1,
      unit: "mb",
    },
  ];
};

onMounted(() => {
  setData();
});

onUnmounted(() => {});
</script>
  
  <style scoped>
/* 添加必要的样式 */
:deep(.el-card__body) {
  padding: 10px;
}
</style>
  