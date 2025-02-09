<!-- filepath: /D:/code/vue3/lime_ui/src/pages/project/compile/OsEnvVars.vue -->
<template>
  <el-form-item label="系统环境变量">
    <div class="w-full border border-solid border-gray-200 p-2">
      <div class="h-[100px] flex flex-col gap-2 w-full overflow-y-scroll">
        <div
          v-for="(item, index) in envVars"
          :key="index"
          class="w-full flex justify-between gap-2 items-center"
        >
          <div class="w-4/5 gap-2 flex items-center">
            <el-input
              v-model="envVars[index].key"
              placeholder="变量名"
              class="w-4/5"
              size="small"
            />
            <el-input
              v-model="envVars[index].value"
              placeholder="变量值"
              class="w-4/5"
              size="small"
            />
          </div>
          <el-button
            type="danger"
            @click="removeEnv(index)"
            icon="Delete"
            size="small"
          ></el-button>
        </div>
      </div>
      <el-button
        type="primary"
        plain
        @click="addEnv"
        :class="envVars.length > 0 ? 'mt-2' : ''"
        icon="Plus"
        size="small"
      ></el-button>
    </div>
  </el-form-item>
</template>

<script setup>
const props = defineProps({
  envVars: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["update:envVars"]);

const addEnv = () => {
  const newEnv = { key: "", value: "" };
  const newVars = [...props.envVars, newEnv];
  emit("update:envVars", newVars);
};

const removeEnv = (index) => {
  const newVars = props.envVars.slice();
  newVars.splice(index, 1);
  emit("update:envVars", newVars);
};
</script>