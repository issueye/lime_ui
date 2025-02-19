<template>
  <base-page :title="title" desc="文件下载管理">
    <template #content>
      <div class="flex flex-col h-full">
        <div class="search-bar">
          <el-form ref="queryFormRef" :model="queryParams" :inline="true">
            <el-form-item label="关键字" prop="keywords">
              <el-input v-model="queryParams.keywords" placeholder="名称/编码" clearable @keyup.enter="handleQuery" />
            </el-form-item>
            <el-form-item>
              <el-button type="primary" icon="search" @click="handleQuery">搜索</el-button>
              <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="grow">
          <d-table :columns="columns" :table-data="tableData" :page-config="pageConfig" usePagination
            highlight-current-row stripe :loading="loading" empty-text="暂无数据">
            <template #created_at="{ scope }">
              {{ parseTime(scope.row.created_at) }}
            </template>
            <template #operation="{ scope }">
              <el-button type="primary" link @click="handleFiledownClick(scope.row)">下载</el-button>
              <el-divider direction="vertical" />
              <el-button type="danger" link @click="handleDeleteClick(scope.row)">删除</el-button>
            </template>
          </d-table>
        </div>
      </div>
    </template>
  </base-page>
</template>

<script setup>
import { ref, reactive, onMounted } from "vue";
import { apiGetList, apiDown, apiDel } from '~/api/project/filedown';
import { ElMessageBox, ElMessage } from "element-plus";
import { toast } from "~/composables/util";

// 下载列表数据
const tableData = ref([]);
const title = ref('文件管理');
const loading = ref(false);

/**
 * 查询条件
 */
const queryParams = reactive({
  keywords: "",
});

/**
 * 分页查询
 */
const pageConfig = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
  handleCurrentChange: (val) => {
    getData();
  }
});

const columns = [
  { prop: "name", label: "文件名称", attrs: { minWidth: 150 } },
  { prop: "version", label: "版本", attrs: { width: 250 } },
  { prop: "hash", label: "文件HASH", attrs: { minWidth: 250, showOverflowTooltip: true } },
  { prop: "size", label: "大小", attrs: { width: 150 } },
  { prop: "download_num", label: "下载次数", attrs: { width: 150 } },
  { prop: "created_at", label: "打包时间", slot: true, attrs: { width: 200, showOverflowTooltip: true } },
  {
    prop: "operation",
    label: "操作",
    slot: true,
    attrs: { width: 120, fixed: "right" },
  },
]

/**
 * 解析时间   例：2025-02-18T21:56:35.4802577+08:00
 * @param {*} val 
 */
const parseTime = (val) => {
  if (!val) return '';
  const date = new Date(val);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

/**
 * 获取数据
 */
const getData = async () => {
  let params = {
    pageNum: pageConfig.currentPage,
    pageSize: pageConfig.pageSize,
    condition: queryParams,
  }

  let res = await apiGetList(params);
  tableData.value = res.list;
  pageConfig.total = res.total;
}

const handleQuery = () => {
  getData();
}

/**
 * 文件下载
 * @param {*} val 
 */
const handleFiledownClick = (value) => {
  apiDown(value.id).then((res) => {
    let objectUrl = window.URL.createObjectURL(new Blob([res.data]));
    let a = document.createElement('a');
    a.href = objectUrl;
    a.download = value.name; // 设置下载文件的名字
    a.click();
    a.remove();
  })
}

const handleDeleteClick = (value) => {
  ElMessageBox.confirm("确认删除已选中的数据项?", "警告", {
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    type: "warning",
  }).then(
    async () => {
      await apiDel(value.id);
      toast("删除文件成功");
      getData();
    },
    () => {
      ElMessage.info("已取消删除");
    }
  );
}

/**
 * 重置
 */
const handleResetQuery = () => {
  queryParams.keywords = ""
  getData();
}

onMounted(() => {
  getData();
})

</script>