<template>
  <div class="w-full flex items-center mb-2" @click="handleCellClick">
    <div class="h-12 w-1 bg-header-500 text-header-500" v-if="isShowActive">
      .
    </div>
    <div :class="cellClass">
      <div class="ml-2">
        <span class="text-gray-400 text-xs mr-2">{{ data.code }}</span>
        <span class="font-medium text-sm">{{ data.name }}</span>
      </div>
      <div class="flex items-center mr-2">
        <el-button link @click="handleEditClick" type="primary">修改</el-button>
        <el-divider direction="vertical" />
        <el-button type="danger" link @click="handleDeleteClick"
          >删除</el-button
        >
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs } from "vue";
import { useDictStore } from "~/store/dict";
import { storeToRefs } from "pinia";

const props = defineProps({
  data: {
    type: Object,
    default: () => {
      return {
        id: 0, // ID
        code: "", // 编码
        name: "", // 名称
        remark: "", // 备注
      };
    },
  },
});

const dictStore = useDictStore();
const { activeData } = storeToRefs(dictStore);

const emits = defineEmits(["edit", "delete", "cell"]);

const { data } = toRefs(props);

const cellClass = computed(() => {
  if (!activeData.value) {
    return "w-full flex justify-between px-2 h-12 items-center hover:shadow-md border border-slate-100 border-solid";
  }

  return data.value.id === activeData.value.id
    ? "w-full flex justify-between px-2 h-12 items-center hover:shadow shadow-md bg-slate-100"
    : "w-full flex justify-between px-2 h-12 items-center hover:shadow-md border border-slate-100 border-solid";
});

const isShowActive = computed(() => {
  if (!activeData.value) return false;

  return data.value.id === activeData.value.id;
});

const handleEditClick = () => {
  emits("edit", data.value);
};

const handleDeleteClick = () => {
  emits("delete", data.value);
};

const handleCellClick = () => {
  emits("cell", data.value);
};
</script>