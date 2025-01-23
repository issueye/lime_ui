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
      <el-button
        type="success"
        :disabled="indexPort === 0"
        icon="plus"
        @click="handleAddClick"
        >新增</el-button
      >
    </div>

    <div class="grow">
      <d-table
        :columns="columns"
        :table-data="ruleList"
        :page-config="pageConfig"
        usePagination
        highlight-current-row
        stripe
        :loading="loading"
        empty-text="暂无数据"
      >
        <template #rule="{ scope }">
          <div class="flex items-center">
            <el-tag type="primary" class="mr-2" size="small" effect="plain">
              {{ scope.row.is_ws ? "WS" : "HTTP" }}://{{ scope.row.port }}
            </el-tag>
            <el-tag
              type="warning"
              class="flex items-center"
              size="small"
              effect="plain"
            >
              {{ scope.row.name }} <el-icon><CaretRight /></el-icon>
              {{ scope.row.target_route }}
            </el-tag>
          </div>
        </template>
        <template #method="{ scope }">
          <el-tag
            :type="getMethod(scope.row.method).type"
            size="small"
            effect="plain"
          >
            {{ getMethod(scope.row.method).value }}
          </el-tag>
        </template>
        <template #status="{ scope }">
          <el-tag
            :type="scope.row.status ? 'success' : 'danger'"
            size="small"
            effect="plain"
          >
            {{ scope.row.status ? "启用" : "停用" }}
          </el-tag>
        </template>
        <template #target="{ scope }">
          {{ scope.row.target.title }}
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
            >{{ !scope.row.status ? "启用" : "停用" }}</el-button
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
import { apiGetRuleList, apiDeleteRule, apiModifyStatusRule } from "~/api/rule";
import { ref, reactive, onMounted } from "vue";
import Dialog from "./dialog.vue";
import { toast } from "~/composables/util";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";

const proxyStore = useProxyStore();
const { selectPort, indexPort, methods, ruleList } = storeToRefs(proxyStore);

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
  port: selectPort.value,
});

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
    prop: "rule",
    label: "规则",
    slot: true,
    attrs: { minWidth: 400, showOverflowTooltip: true, fixed: "left" },
  },
  {
    prop: "method",
    label: "请求方法",
    slot: true,
    attrs: { width: 80 },
  },
  {
    prop: "target",
    label: "目标地址",
    slot: true,
    attrs: { minWidth: 200, showOverflowTooltip: true },
  },
  {
    prop: "order",
    label: "序号",
    attrs: { width: 80 },
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
  id: 0,
  port: 0,
  target_id: 0,
  target_route: "",
  status: true,
  name: "",
  method: "",
  order: 0,
  is_ws: false,
  remark: "",
  match_type: 0, // 匹配类型 (0: 精确匹配, 1: 前缀匹配, 2: 正则匹配, 3: 通配符匹配)
  headers: [], // Header 匹配规则
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
  formData.name = value.name;
  formData.method = value.method;
  formData.target_id = value.target_id;
  formData.target_route = value.target_route;
  formData.status = value.status;
  formData.order = value.order;
  formData.is_ws = value.is_ws;
  formData.remark = value.remark;
  formData.match_type = value.match_type;
  formData.headers = value.headers;
};

const resetValue = () => {
  formData.id = 0;
  formData.port = selectPort.value;
  formData.name = "";
  formData.method = "";
  formData.target_id = "";
  formData.target_route = "";
  formData.status = true;
  formData.order = 0;
  formData.is_ws = false;
  formData.remark = "";
  formData.match_type = 0;
  formData.headers = [];
};

const getMethod = (value) => {
  let list = [...methods.value];
  return list.find((item) => item.value === value);
};

/**
 * 修改状态
 * @param value 信息
 */
const handleModifyStatusClick = async (value) => {
  try {
    loading.value = true;
    await apiModifyStatusRule(value.id);
    toast("更新状态成功");
    getData();
  } catch (error) {
    toast("更新状态失败", "error");
  } finally {
    loading.value = false;
  }
};

const handleDeleteClick = async (value) => {
  try {
    loading.value = true;
    await apiDeleteRule(value.id);
    toast("删除成功");
    getData();
  } catch (error) {
  } finally {
    loading.value = false;
  }
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
    condition: {
      keywords: queryParams.keywords,
      port: selectPort.value,
    },
  };

  loading.value = true;
  let res = await apiGetRuleList(params);
  loading.value = false;

  ruleList.value = res.list;
  pageConfig.total = res.total;
};

onMounted(() => {
  getData();
});
</script>