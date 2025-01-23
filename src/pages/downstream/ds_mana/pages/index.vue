<template>
  <div class="w-full h-full flex flex-col">
    <div class="search-bar">
      <el-form ref="queryFormRef" :model="queryParams" :inline="true">
        <el-form-item label="关键字" prop="keywords" label-position="left">
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
      <div class="mb-4">
        <el-button
          type="success"
          :disabled="indexPort === 0"
          icon="plus"
          @click="handleAddClick"
          >新增</el-button
        >
      </div>
    </div>

    <div class="flex flex-col" style="height: calc(100% - 100px)">
      <div class="h-full overflow-y-auto">
        <div class="flex flex-wrap">
          <card
            v-for="(item, index) in pageList"
            :data="item"
            :key="index"
            @delete="handleDeleteClick"
            @edit="handleEditClick"
            @upload="handleUploadClick"
            @copy="handleCopyClick"
          />
        </div>
      </div>
      <div class="mt-4 flex justify-end items-center">
        <div class="h-full flex justify-between items-center">
          <div class="text-gray-500 mr-2">
            总共 {{ pageConfig.total }} 条信息
          </div>
          <el-pagination
            size="small"
            v-model:current-page="pageConfig.currentPage"
            background
            layout="prev, pager, next"
            :page-size="pageConfig.pageSize"
            :total="pageConfig.total"
            @current-change="pageConfig.qryData"
          />
        </div>
      </div>
    </div>

    <Dialog
      v-model:visible="dialog.visible"
      v-model:form-data="formData"
      :operation-type="operationType"
      @close="handleDialogClose"
    />

    <UploadDialog
      v-model:visible="dialog.upload_visible"
      v-model:form-data="formData"
    />
  </div>
</template>

<script setup>
import { apiGetPageList, apiDeletePage, apiModifyStatusPage } from "~/api/page";
import { ref, reactive, onMounted } from "vue";
import Dialog from "./dialog.vue";
import UploadDialog from "./upload_dialog.vue";
import { toast } from "~/composables/util";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";
import { nanoid } from "nanoid";
import { copyText } from "vue3-clipboard";
import card from "./card.vue";

const dialog = reactive({
  visible: false,
  upload_visible: false,
});

const proxyStore = useProxyStore();
const { selectPort, indexPort, pageList } = storeToRefs(proxyStore);

const queryFormRef = ref(null);
const queryParams = reactive({
  keywords: "",
  port: selectPort.value,
});

const loading = ref(false);
const operationType = ref(0); // 0:新增 1:编辑

const formData = reactive({
  id: 0, // ID
  name: "", // 名称
  title: "", // 标题
  version: "", // 版本号
  port: 0, // 端口号
  product_code: "", // 产品编码
  use_version_route: false, // 是否使用版本路由
  status: false, // 状态
  remark: "", // 备注
});

/**
 * 分页查询
 */
const pageConfig = reactive({
  pageSize: 10,
  currentPage: 1,
  total: 0,
  qryData: () => {
    getData();
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

/**
 * 新增
 */
const handleAddClick = () => {
  operationType.value = 0;
  if (selectPort.port <= 0) toast("请选择端口号", "error");
  resetValue();
  dialog.visible = true;
};

/**
 * 修改信息
 * @param value 信息
 */
const handleEditClick = (value) => {
  console.log("value", value);
  operationType.value = 1;
  setValue(value);
  dialog.visible = true;
};

const setValue = (value) => {
  formData.id = value.id;
  formData.name = value.name;
  formData.title = value.title;
  formData.version = value.version;
  formData.port = value.port;
  formData.product_code = value.product_code;
  formData.use_version_route = value.use_version_route;
  formData.status = value.status;
  formData.remark = value.remark;
};

const resetValue = () => {
  formData.id = 0;
  formData.name = "";
  formData.title = "";
  formData.version = "";
  formData.port = selectPort.value;
  formData.product_code = nanoid();
  formData.use_version_route = 0;
  formData.status = false;
  formData.remark = "";
};

/**
 * 修改状态
 * @param value 信息
 */
const handleModifyStatusClick = async (value) => {
  try {
    loading.value = true;
    await apiModifyStatusPage(value.id);
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
    await apiDeletePage(value.id);
    loading.value = false;
    toast("删除成功");
    getData();
  } catch (error) {
    toast("更新状态失败", "error");
  } finally {
    loading.value = false;
  }
};

/**
 * 上传
 * @param value
 */
const handleUploadClick = (value) => {
  setValue(value);
  dialog.upload_visible = true;
};

/**
 * 复制
 * @param value
 */
const handleCopyClick = (data) => {
  let port = data.port;
  let name = data.name;
  let use_version_route = data.use_version_route;
  if (use_version_route) {
    name = `${data.version}/${name}`;
  }

  let str = "";
  if (port === 80) {
    str = `http://${location.hostname}/${name}/`;
  } else {
    str = `http://${location.hostname}:${port}/${name}/`;
  }

  copyText(str, undefined, () => {
    toast("复制成功");
  });
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
  let res = await apiGetPageList(params);
  loading.value = false;

  pageList.value = res.list;
  pageConfig.total = res.total;
};

onMounted(() => {
  getData();
});
</script>