<!-- filepath: /D:/code/vue3/lime_ui/src/pages/project/compile/InjectVars.vue -->
<template>
  <div class="w-full border border-solid border-gray-200 p-2">
    <div class="h-[100px] flex flex-col gap-2 w-full overflow-y-scroll">
      <div
        v-for="(item, index) in injectVars"
        :key="index"
        class="w-full flex justify-between gap-2 items-center"
      >
        <div class="w-4/5 gap-2 flex items-center">
          <el-input
            v-model="injectVars[index].key"
            placeholder="变量名"
            class="w-4/5"
            size="small"
          />
          <el-button
            type="primary"
            plain
            icon="Edit"
            size="small"
            @click="onEdit(index)"
          ></el-button>
        </div>
        <el-button
          type="danger"
          icon="remove"
          size="small"
          @click="removeVar(index)"
        ></el-button>
      </div>
    </div>
    <el-button
      type="primary"
      plain
      @click="addVar"
      :class="injectVars.length > 0 ? 'mt-2' : ''"
      icon="Plus"
      size="small"
    ></el-button>
  </div>
</template>

<script setup>
const props = defineProps({
  injectVars: {
    type: Array,
    default: () => [],
  },
});
const emit = defineEmits(["update:injectVars", "edit"]);

const addVar = () => {
  const newVars = [...props.injectVars, { key: "", value: "" }];
  emit("update:injectVars", newVars);
};

const removeVar = (index) => {
  const newVars = props.injectVars.slice();
  newVars.splice(index, 1);
  emit("update:injectVars", newVars);
};

const onEdit = (index) => {
  emit("edit", {
    type: "inject_env",
    value: {
      name: props.injectVars[index].key,
      content: props.injectVars[index].value,
    },
    index,
  });
};
</script>