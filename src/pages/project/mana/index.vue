<template>
  <base-page title="项目管理" desc="项目管理">
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
          <div class="mb-[10px]">
            <el-button type="success" icon="plus" @click="handleAddClick"
              >新增</el-button
            >
          </div>

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
              <template #operation="{ scope }">
                <el-button
                  type="primary"
                  link
                  @click="handleEditClick(scope.row)"
                  >编辑</el-button
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
      </div>
    </template>
  </base-page>

  <Dialog
    v-model:visible="dialog.visible"
    v-model:form-data="formData"
    :operation-type="operationType"
    @close="handleDialogClose"
  />
</template>

<script setup>
import { apiGetList, apiDeleteById } from "~/api/project";
import { ref, reactive, onMounted } from "vue";
import Dialog from "./dialog.vue";
import { toast } from "~/composables/util";

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
});

const dialog = reactive({
  visible: false,
});

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
    prop: "name",
    label: "名称",
    attrs: { width: 200, showOverflowTooltip: true },
  },
  {
    prop: "repo_url",
    label: "仓库地址",
    attrs: { minWidth: 400, showOverflowTooltip: true },
  },
  {
    prop: "repo_user",
    label: "用户名称",
    attrs: { width: 200, showOverflowTooltip: true },
  },
  {
    prop: "repo_password",
    label: "用户密码",
    attrs: { width: 200, showOverflowTooltip: true },
  },
  {
    prop: "description",
    label: "备注",
    attrs: { minWidth: 150, showOverflowTooltip: true },
  },
  {
    prop: "operation",
    label: "操作",
    slot: true,
    attrs: { width: 140, fixed: "right" },
  },
];

const formData = reactive({
  id: 0, // ID
  name: "", // 名称
  repo_url: "", // 仓库地址
  repo_user: "", // 仓库用户
  repo_password: "", // 用户密码
  description: "", // 备注
});

/**
 * 分页查询
 */
const pageConfig = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
});

onMounted(() => {
  getData();
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
  formData.name = value.name;
  formData.repo_url = value.repo_url;
  formData.repo_user = value.repo_user;
  formData.repo_password = value.repo_password;
  formData.remark = value.remark;
};

const resetValue = () => {
  formData.id = 0;
  formData.name = "";
  formData.repo_url = "";
  formData.repo_user = "";
  formData.repo_password = "";
  formData.remark = "";
};

/**
 * 删除
 * @param value
 */
const handleDeleteClick = async (value) => {
  loading.value = true;
  await apiDeleteById(value.id);
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
  let res = await apiGetList(params);
  loading.value = false;

  tableData.value = res.list;
  pageConfig.total = res.total;
};
</script>