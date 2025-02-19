<!-- filepath: /D:/code/vue3/lime_ui/src/pages/project/compile/CompileScripts.vue -->
<template>
  <el-form-item :label="label">
    <div class="w-full flex gap-2 items-center">
      <el-tag
        v-for="(item, index) in scripts"
        :key="index"
        closable
        :size="props.size"
        effect="plain"
        @close="removeScript(index)"
        @dblclick="onEdit(item, index)"
      >
        {{ item.name }}
      </el-tag>
      <el-input
        v-if="visible"
        v-model="inputValue"
        :size="props.size"
        class="w-32"
        @keyup.enter="addScript"
      ></el-input>
      <el-button
        v-else
        type="primary"
        plain
        icon="Plus"
        size="small"
        @click="showInput"
      ></el-button>
    </div>
  </el-form-item>
</template>

<script setup>
import { ref } from "vue";
const props = defineProps({
  scripts: {
    type: Array,
    default: () => [],
  },
  type: {
    type: String,
    required: true,
  },
  label: {
    type: String,
    default: "",
  },
  size: {
    type: String,
    default: "small",
  }
});
const emit = defineEmits(["update:scripts", "edit"]);
const visible = ref(false);
const inputValue = ref("");

const showInput = () => {
  visible.value = true;
  inputValue.value = "";
};

const addScript = () => {
  if (!inputValue.value) return;
  if (props.scripts.some((item) => item.name === inputValue.value)) return;
  const newScript = { name: inputValue.value, content: "" };
  emit("update:scripts", [...props.scripts, newScript]);
  visible.value = false;
};

const removeScript = (index) => {
  const newScripts = props.scripts.slice();
  newScripts.splice(index, 1);
  emit("update:scripts", newScripts);
};

const onEdit = (item, index) => {
  emit("edit", { type: props.type, value: item, index });
};
</script>