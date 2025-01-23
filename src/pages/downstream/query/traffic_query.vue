<template>
  <base-page title="转发查询" desc="转发查询">
    <template #content>
      <div class="h-full flex flex-col p-2">
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
              <el-button icon="refresh" @click="handleResetQuery"
                >重置</el-button
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
            >
              <template #req_time="{ scope }">
                {{ scope.row.request.time }}
              </template>
              <template #method="{ scope }">
                <el-tag :type="getMethod(scope.row.request.method).type" size="small" effect="plain">{{
                  scope.row.request.method
                }}</el-tag>
              </template>
              <template #url="{ scope }">
                {{ scope.row.request.path }}
              </template>
              <template #status_code="{ scope }">
                {{ scope.row.response.status_code }}
              </template>
              <template #res_body="{ scope }">
                {{ scope.row.response.body }}
              </template>
              <template #operation="{ scope }">
                <el-button
                  type="primary"
                  link
                  @click="handleCopyClick(scope.row)"
                  >复制</el-button
                >
              </template>
            </d-table>
          </div>
        </div>
      </div>
    </template>
  </base-page>
</template>

<script setup>
import { apiGetTrafficMessages } from "~/api/page";
import { ref, reactive, onMounted } from "vue";
import { toast } from "~/composables/util";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";

import { copyText } from "vue3-clipboard";

const proxyStore = useProxyStore();
const { methods } = storeToRefs(proxyStore);

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
});

const loading = ref(false);

/**
 * 获取表格数据
 */
const tableData = ref([]);

/**
 * 表格信息
 */
const columns = [
  {
    prop: "id",
    label: "ID",
    attrs: { width: 200, showOverflowTooltip: true, fixed: "left" },
  },
  {
    prop: "in_bytes",
    label: "入栈流量(bytes)",
    slot: true,
    attrs: { width: 120, showOverflowTooltip: true },
  },
  {
    prop: "out_bytes",
    label: "出栈流量(bytes)",
    slot: true,
    attrs: { width: 120, showOverflowTooltip: true },
  },
  {
    prop: "total_bytes",
    label: "总流量(bytes)",
    slot: true,
    attrs: { width: 120, showOverflowTooltip: true },
  },
  {
    prop: "req_time",
    label: "请求时间",
    slot: true,
    attrs: { width: 170, showOverflowTooltip: true },
  },
  {
    prop: "url",
    label: "URL",
    slot: true,
    attrs: { width: 170, showOverflowTooltip: true },
  },
  {
    prop: "method",
    label: "备注",
    slot: true,
    attrs: { width: 170, showOverflowTooltip: true },
  },
  {
    prop: "status_code",
    label: "状态",
    slot: true,
    attrs: { width: 70, showOverflowTooltip: true },
  },
  {
    prop: "res_body",
    label: "返回内容",
    slot: true,
    attrs: { minWidth: 200, showOverflowTooltip: true },
  },
  {
    prop: "operation",
    label: "操作",
    slot: true,
    attrs: { width: 80, fixed: "right" },
  },
];

/**
 * 分页查询
 */
const pageConfig = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
  handleCurrentChange: (val) => {
    pageConfig.currentPage = val;
    handleQuery();
  },
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

const getMethod = (value) => {
  let list = [...methods.value];
  return list.find((item) => item.value === value);
};

const handleCopyClick = (data) => {
  let str = data.response.body;
  copyText(str, undefined, () => {
    toast("复制成功");
  });
}

/**
 * 查询数据
 */
const getData = async () => {
  loading.value = true;
  let params = {
    pageNum: pageConfig.currentPage,
    pageSize: pageConfig.pageSize,
    condition: queryParams,
  };
  let res = await apiGetTrafficMessages(params);
  loading.value = false;

  tableData.value = res.list;
  pageConfig.total = res.total;
};

onMounted(() => {
  getData();
});
</script>