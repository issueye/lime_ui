<template>
  <div class="w-full h-full">
    <el-tabs class="h-full">
      <el-tab-pane label="静态页面">
        <Pages />
      </el-tab-pane>
      <el-tab-pane label="转发规则">
        <Rules />
      </el-tab-pane>
    </el-tabs>
  </div>
</template>

<script setup>
import Pages from "../pages/index.vue";
import Rules from "../rules/index.vue";
</script>
<style scoped>
  .el-tab-pane{
    height: 100%;
  }
</style>