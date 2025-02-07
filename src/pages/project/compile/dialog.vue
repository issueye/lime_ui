<template>
  <!--弹窗-->
  <el-dialog
    v-model="visible"
    :title="dialog.title"
    width="800px"
    @close="handleClose"
    @open="handleOpen"
    :close-on-click-modal="false"
  >
    <Codemirror
      v-model:value="data.content"
      ref="cmRef"
      :options="cmOptions"
      border
      height="500"
    />
    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { reactive, ref, toRefs, nextTick } from "vue";

import "codemirror/mode/javascript/javascript.js";
import "codemirror/mode/shell/shell.js";
import Codemirror from "codemirror-editor-vue3";
import { onMounted, onUnmounted } from "vue";

const props = defineProps({
  // 是否显示
  visible: {
    type: Boolean,
    default: false,
  },
  data: {
    type: Object,
    default: () => {
      return {
        name: "",
        content: "",
        type: "text/javascript",
      };
    },
  },
});

const { visible, data } = toRefs(props);
const emits = defineEmits(["update:visible", "close"]);

const dialog = reactive({
  title: "编辑脚本",
  loading: false,
});

const cmRef = ref();
const cmOptions = {
  mode: "text/javascript", // 语言模式
};

onMounted(() => {
  // 在加载完成之后

  nextTick(() => {
    cmRef.value?.refresh();
  });
});

onUnmounted(() => {
  cmRef.value?.destroy();
});

/**
 * 关闭弹窗
 */
const handleClose = () => {
  emits("update:visible", false);
  emits("close", data.value.content);
};

const handleOpen = () => {
  console.log("handleOpen", data.value);
  dialog.title = `编辑脚本 - [${data.value.name}]`;
  cmOptions.mode = data.value.type;
  cmRef.value?.refresh();
};

/**
 * 提交表单按钮
 */
const handleSubmitClick = () => {
  dialog.loading = true;

  setTimeout(() => {
    dialog.loading = false;
    handleClose();
  }, 500);
};
</script>

<style scoped>
</style>