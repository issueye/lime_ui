<template>
  <div class="search-bar">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item label="关键字" prop="keywords">
        <el-input
          v-model="queryParams.keywords"
          placeholder="名称/编码"
          clearable
          @keyup.enter="handleQuery"
        />
      </el-form-item>
      <el-form-item>
        <el-button type="primary" icon="search" @click="handleQuery"
          >搜索</el-button
        >
        <el-button icon="refresh" @click="handleResetQuery">重置</el-button>
      </el-form-item>
    </el-form>
  </div>

  <div class="grow flex flex-col">
    <div class="mb-[10px]">
      <el-button type="success" icon="plus" @click="handleAddClick"
        >新增</el-button
      >
    </div>

    <div class="grow">
      <d-table
        :columns="columns"
        :table-data="GZList"
        :page-config="pageConfig"
        usePagination
        highlight-current-row
        stripe
        :loading="loading"
        empty-text="暂无数据"
      >
        <template #match_type="{ scope }">
          <el-tag size="small" :type="getType(scope.row.match_type).type" effect="plain">
            {{ getType(scope.row.match_type).label }}
          </el-tag>
        </template>
        <template #status="{ scope }">
          <el-tag size="small" :type="scope.row.status ? 'success' : 'danger'" effect="plain">
            {{ scope.row.status ? "启用" : "停用" }}
          </el-tag>
        </template>
        <template #operation="{ scope }">
          <el-button type="primary" link @click="handleEditClick(scope.row)"
            >编辑</el-button
          >
          <el-divider direction="vertical" />
          <el-button
            type="primary"
            link
            @click="handleModifyStatusClick(scope.row)"
            >{{ scope.row.status ? "停用" : "启用" }}</el-button
          >
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <span class="flex items-center text-[--el-color-primary]">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item
                  :command="{ data: scope.row, type: 'del' }"
                  class="text-[--el-color-danger]"
                  >删除</el-dropdown-item
                >
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </template>
      </d-table>
    </div>
  </div>

  <Dialog
    v-model:visible="dialog.visible"
    v-model:form-data="formData"
    :operation-type="operationType"
    @close="handleDialogClose"
  />
</template>

<script setup>
import {
  apiGetGzipFilterList,
  apiModifyStatusGzipFilter,
  apiDeleteGzipFilter,
} from "~/api/gzip_filter";
import { ref, reactive, onMounted } from "vue";
import Dialog from "./dialog.vue";
import { toast } from "~/composables/util";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
});

const proxyStore = useProxyStore();
const { selectPort, types, GZList } = storeToRefs(proxyStore);

const dialog = reactive({
  visible: false,
});

const loading = ref(false);
const operationType = ref(0); // 0:新增 1:编辑

/**
 * 表格信息
 */
const columns = [
  {
    prop: "match_type",
    label: "匹配模式",
    slot: true,
    attrs: { width: 150, showOverflowTooltip: true },
  },
  { prop: "match_content", label: "匹配内容", attrs: { minWidth: 150 } },
  {
    prop: "remark",
    label: "备注",
    attrs: { width: 150, showOverflowTooltip: true },
  },
  {
    prop: "status",
    label: "状态",
    slot: true,
    attrs: { width: 70, showOverflowTooltip: true, fixed: "right" },
  },
  {
    prop: "operation",
    label: "操作",
    slot: true,
    attrs: { width: 180, fixed: "right" },
  },
];

const formData = reactive({
  id: 0, // ID
  port: 0, // 端口号
  match_type: 0, // 匹配模式
  match_content: "", // 匹配内容
  remark: "", // 备注
});

const getType = (value) => {
  return types.value.find((e) => e.value === value);
};

/**
 * 分页查询
 */
const pageConfig = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
});

/**
 * 查询
 */
const handleQuery = () => {
  getData();
};

/**
 * 重置查询
 */
const handleResetQuery = () => {
  queryFormRef.value.resetFields();
  pageConfig.currentPage = 1;
  handleQuery();
};

/**
 * 新增
 */
const handleAddClick = () => {
  operationType.value = 0;
  resetValue();
  dialog.visible = true;
};

/**
 * 修改信息
 * @param value 信息
 */
const handleEditClick = (value) => {
  operationType.value = 1;
  setValue(value);
  dialog.visible = true;
};

const setValue = (value) => {
  formData.id = value.id;
  formData.port = value.port;
  formData.match_type = value.match_type;
  formData.match_content = value.match_content;
  formData.remark = value.remark;
};

const resetValue = () => {
  formData.id = 0;
  formData.port = selectPort.value;
  formData.match_type = 1;
  formData.match_content = "";
  formData.remark = "";
};

/**
 * 修改状态
 * @param value 信息
 */
const handleModifyStatusClick = async (value) => {
  try {
    loading.value = true;
    await apiModifyStatusGzipFilter(value.id);
    toast("更新状态成功");
    getData();
  } catch (error) {
    toast("更新状态失败", "error");
  } finally {
    loading.value = false;
  }
};

const handleDeleteClick = async (value) => {
  loading.value = true;
  await apiDeleteGzipFilter(value.id);
  loading.value = false;
  toast("删除成功");
  getData();
};

const handleCommand = ({ data, type }) => {
  if (type === "del") {
    handleDeleteClick(data);
  }
};

const handleDialogClose = () => {
  getData();
};

/**
 * 查询数据
 */
const getData = async () => {
  let params = {
    pageNum: pageConfig.currentPage,
    pageSize: pageConfig.pageSize,
    condition: queryParams,
  };

  loading.value = true;
  let res = await apiGetGzipFilterList(params);
  loading.value = false;

  GZList.value = res.list;
  pageConfig.total = res.total;
};

onMounted(() => {
  getData();
});
</script>