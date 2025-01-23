<template>
  <div class="search-bar">
    <el-form ref="queryFormRef" :model="queryParams" :inline="true">
      <el-form-item prop="keywords">
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
        <el-button type="success" icon="plus" @click="handleAddClick"
          >新增</el-button
        >
      </el-form-item>
    </el-form>
  </div>

  <div class="grow flex flex-col">
    <div class="grow">
      <d-table
        :columns="columns"
        :table-data="tableData"
        :page-config="pageConfig"
        usePagination
        highlight-current-row
        stripe
        :loading="loading"
        empty-text="暂无数据"
        @row-click="handleRowClick"
      >
        <template #port="{ scope }">
          <div class="flex items-center">
            <span class="mr-2">{{ scope.row.port }}</span>
            <el-tag size="small" effect="plain" type="danger" v-if="scope.row.use_gzip">GZIP</el-tag>
          </div>
        </template>
        <template #status="{ scope }">
          <el-tag size="small" effect="plain" :type="scope.row.status ? 'success' : 'danger'">
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
            >{{ scope.row.status ? "关闭" : "开启" }}</el-button
          >
          <el-divider direction="vertical" />
          <el-dropdown @command="handleCommand">
            <span class="flex items-center text-[--el-color-primary]">
              更多<el-icon class="el-icon--right"><arrow-down /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item :command="{ data: scope.row, type: 'reload' }"
                  >重载</el-dropdown-item
                >
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

  <PortDialog
    v-model:visible="dialog.visible"
    v-model:form-data="formData"
    :operation-type="operationType"
    @close="handlePortClose"
  />
</template>

<script setup>
import {
  apiGetPortList,
  apiDeletePort,
  apiStartPort,
  apiStopPort,
  apiReloadPort,
  apiModifyUseGZ,
} from "~/api/port";
import { ref, reactive, onMounted } from "vue";
import PortDialog from "../components/dialog.vue";
import { toast } from "~/composables/util";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
});

const dialog = reactive({
  visible: false,
});

const proxyStore = useProxyStore();
const { selectPort, indexPort } = storeToRefs(proxyStore);

const loading = ref(false);
const operationType = ref(0); // 0:新增 1:编辑

/**
 * 获取表格数据
 */
const tableData = ref([]);

/**
 * 表格信息
 */
const columns = [
  {
    prop: "port",
    label: "端口号",
    slot: true,
    attrs: { minWidth: 110, showOverflowTooltip: true, fixed: "left" },
  },
  {
    prop: "status",
    label: "状态",
    slot: true,
    attrs: { width: 70, fixed: "right" },
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
  use_gzip: false, // 使用 GZIP
  remark: "", // 备注
});

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
  formData.use_gzip = value.use_gzip;
  formData.remark = value.remark;
};

const resetValue = () => {
  formData.id = 0;
  formData.port = 0;
  formData.use_gzip = false;
  formData.remark = "";
};

/**
 * 修改状态
 * @param value 信息
 */
const handleModifyStatusClick = (value) => {
  if (value.status) {
    handleStopClick(value);
  } else {
    handleStartClick(value);
  }
};

/**
 * 开启
 * @param value 信息
 */
const handleStartClick = async (value) => {
  loading.value = true;
  await apiStartPort(value.port);
  loading.value = false;
  toast("开启成功");
  getData();
};

/**
 * 关闭
 * @param value 信息
 */
const handleStopClick = async (value) => {
  loading.value = true;
  await apiStopPort(value.port);
  loading.value = false;
  toast("关闭成功");
  getData();
};

const handleRowClick = (row) => {
  selectPort.value = row.port;
  indexPort.value = row.port;
  proxyStore.getData();
};

const handleDeleteClick = async (value) => {
  try {
    loading.value = true;
    await apiDeletePort(value.id);
    loading.value = false;
    toast("删除成功");
    indexPort.value = 0;
    getData();
    proxyStore.getData();
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const handleReloadClick = async (value) => {
  try {
    loading.value = true;
    await apiReloadPort(value.port);
    loading.value = false;
    toast("重载成功");
    getData();
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const handleUseGZClick = async (value) => {
  try {
    loading.value = true;
    await apiModifyUseGZ(value.port);
    toast("修改成功");
    getData();
  } catch (error) {
  } finally {
    loading.value = false;
  }
};

const handleCommand = ({ data, type }) => {
  switch (type) {
    case "gzip":
      handleUseGZClick(data);
      break;
    case "reload":
      handleReloadClick(data);
      break;
    case "del":
      handleDeleteClick(data);
      break;
  }
};

const handlePortClose = () => {
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
  let res = await apiGetPortList(params);
  loading.value = false;

  tableData.value = res.list;
  pageConfig.total = res.total;
};

onMounted(() => {
  getData();
});
</script>