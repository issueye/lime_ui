<template>
  <div class="flex flex-col h-full">
    <div class="flex items-center justify-between p-4 border-b border-gray-200">
      <div class="text-lg font-medium">文件下载管理</div>
      <el-button type="primary" @click="openAddDialog">添加下载任务</el-button>
    </div>

    <div class="flex-1 p-4 overflow-auto">
      <el-table :data="downloadList" border stripe style="width: 100%">
        <el-table-column prop="name" label="任务名称" width="180" />
        <el-table-column prop="url" label="下载地址" />
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">{{
              getStatusText(row.status)
            }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="progress" label="进度" width="200">
          <template #default="{ row }">
            <el-progress
              :percentage="row.progress"
              :status="getProgressStatus(row.status)"
            />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="{ row }">
            <el-button
              v-if="row.status !== 'completed'"
              type="primary"
              link
              @click="startDownload(row)"
              >开始</el-button
            >
            <el-button
              v-if="row.status === 'downloading'"
              type="warning"
              link
              @click="pauseDownload(row)"
              >暂停</el-button
            >
            <el-button type="danger" link @click="deleteDownload(row)"
              >删除</el-button
            >
          </template>
        </el-table-column>
      </el-table>
    </div>

    <!-- 添加下载任务对话框 -->
    <el-dialog
      v-model="dialogVisible"
      title="添加下载任务"
      width="500px"
      destroy-on-close
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="rules"
        label-width="100px"
      >
        <el-form-item label="任务名称" prop="name">
          <el-input v-model="formData.name" placeholder="请输入任务名称" />
        </el-form-item>
        <el-form-item label="下载地址" prop="url">
          <el-input v-model="formData.url" placeholder="请输入下载地址" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span class="dialog-footer">
          <el-button @click="dialogVisible = false">取消</el-button>
          <el-button type="primary" @click="submitForm">确定</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";

// 下载列表数据
const downloadList = ref([]);

// 对话框相关
const dialogVisible = ref(false);
const formRef = ref(null);
const formData = reactive({
  name: "",
  url: "",
});

// 表单验证规则
const rules = {
  name: [{ required: true, message: "请输入任务名称", trigger: "blur" }],
  url: [
    { required: true, message: "请输入下载地址", trigger: "blur" },
    { type: "url", message: "请输入有效的URL地址", trigger: "blur" },
  ],
};

// 获取状态类型
const getStatusType = (status) => {
  const types = {
    waiting: "info",
    downloading: "primary",
    paused: "warning",
    completed: "success",
    error: "danger",
  };
  return types[status] || "info";
};

// 获取状态文本
const getStatusText = (status) => {
  const texts = {
    waiting: "等待中",
    downloading: "下载中",
    paused: "已暂停",
    completed: "已完成",
    error: "错误",
  };
  return texts[status] || "未知";
};

// 获取进度条状态
const getProgressStatus = (status) => {
  if (status === "completed") return "success";
  if (status === "error") return "exception";
  return "";
};

// 打开添加对话框
const openAddDialog = () => {
  dialogVisible.value = true;
};

// 提交表单
const submitForm = async () => {
  if (!formRef.value) return;

  await formRef.value.validate((valid) => {
    if (valid) {
      // TODO: 调用API添加下载任务
      downloadList.value.push({
        ...formData,
        status: "waiting",
        progress: 0,
      });
      dialogVisible.value = false;
      ElMessage.success("添加成功");
    }
  });
};

// 开始下载
const startDownload = (row) => {
  // TODO: 调用API开始下载
  row.status = "downloading";
};

// 暂停下载
const pauseDownload = (row) => {
  // TODO: 调用API暂停下载
  row.status = "paused";
};

// 删除下载
const deleteDownload = (row) => {
  ElMessageBox.confirm("确定要删除该下载任务吗？", "提示", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(() => {
    // TODO: 调用API删除下载任务
    const index = downloadList.value.indexOf(row);
    if (index > -1) {
      downloadList.value.splice(index, 1);
    }
    ElMessage.success("删除成功");
  });
};
</script>