<template>
  <el-dialog
    v-model="visible"
    :title="dialog.title"
    width="700px"
    @close="handleClose"
    @open="handleOpen"
    :close-on-click-modal="false"
  >
    <el-form
      ref="dataFormRef"
      :model="formData"
      :rules="computedRules"
      label-width="auto"
    >
      <el-form-item label="代理路由" prop="name">
        <el-input v-model="formData.name" placeholder="请输入代理路由" />
      </el-form-item>

      <el-form-item label="目标路由" prop="target_route">
        <el-input
          v-model="formData.target_route"
          :placeholder="
            formData.match_type === 2
              ? '请输入正则表达式（如 /api/users/[0-9]+）'
              : formData.match_type === 3
              ? '请输入通配符路径（如 /api/*）'
              : '请输入目标路由'
          "
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="目标服务" prop="target_id">
            <el-select
              v-model.number="formData.target_id"
              placeholder="请选择目标服务"
            >
              <el-option
                v-for="(item, index) in targetDataList"
                :key="index"
                :label="item.title"
                :value="item.id"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="匹配类型" prop="match_type">
            <el-select
              v-model.number="formData.match_type"
              placeholder="请选择匹配类型"
            >
              <el-option
                v-for="(item, index) in matchTypes"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="WS" prop="is_ws">
        <el-switch
          v-model="formData.is_ws"
          :active-value="true"
          :inactive-value="false"
        />
      </el-form-item>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="请求方法" prop="method">
            <el-select
              v-model.number="formData.method"
              placeholder="请选择请求方法"
            >
              <el-option
                v-for="(item, index) in methods"
                :key="index"
                :label="item.label"
                :value="item.value"
              />
            </el-select>
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="端口号" prop="port">
            <el-input
              v-model.number="formData.port"
              :disabled="true"
              placeholder="请输入端口号"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="序号" prop="order">
            <el-input-number
              v-model.number="formData.order"
              controls-position="right"
              placeholder="请输入序号"
              class="w-full"
            />
          </el-form-item>
        </el-col>
      </el-row>

      <!-- <el-form-item label="Header 匹配">
        <el-table
          :data="formData.headers"
          style="width: 100%"
          empty-text="没有数据"
        >
          <el-table-column label="Header 名称" prop="k" width="200">
            <template #default="{ row }">
              <el-input v-model="row.k" placeholder="请输入 Header 名称" />
            </template>
          </el-table-column>
          <el-table-column label="Header 值" prop="v" min-width="200">
            <template #default="{ row }">
              <el-input v-model="row.v" placeholder="请输入 Header 值" />
            </template>
          </el-table-column>
          <el-table-column label="操作" width="100">
            <template #default="{ $index }">
              <el-button type="danger" @click="removeHeader($index)"
                >删除</el-button
              >
            </template>
          </el-table-column>
        </el-table>
        <el-button type="primary" @click="addHeader" class="mt-2"
          >添加 Header</el-button
        >
      </el-form-item> -->

      <el-form-item label="备注">
        <el-input
          v-model="formData.remark"
          placeholder="请输入备注"
          type="textarea"
          :rows="4"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <div class="dialog-footer">
        <el-button type="primary" @click="handleSubmitClick">确 定</el-button>
        <el-button @click="handleClose">取 消</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { apiAddRule, apiUpdateRule } from "~/api/rule";
import { apiGetTargetList } from "~/api/target";
import { reactive, ref, toRefs, computed } from "vue";
import { useProxyStore } from "~/store/proxy";
import { storeToRefs } from "pinia";

const props = defineProps({
  operationType: {
    type: Number,
    default: 0,
  },
  visible: {
    type: Boolean,
    default: false,
  },
  formData: {
    type: Object,
    default: () => {
      return {
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
        match_type: 0, // 匹配类型 (0: 精确匹配, 1: 前缀匹配, 2: 正则匹配)
        headers: [], // Header 匹配规则
      };
    },
  },
});

const proxyStore = useProxyStore();
const { methods, matchTypes } = storeToRefs(proxyStore); // 新增 matchTypes

const { visible, operationType, formData } = toRefs(props);
const emits = defineEmits(["update:visible", "close"]);
const dataFormRef = ref(null);
const targetDataList = ref([]);

const dialog = reactive({
  title: "",
  loading: false,
});

const computedRules = computed(() => {
  const rules = {
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    method: [{ required: true, message: "请选择请求方法", trigger: "blur" }],
    target_id: [{ required: true, message: "请选择目标服务", trigger: "blur" }],
    target_route: [
      { required: true, message: "请输入目标路由", trigger: "blur" },
    ],
    port: [{ required: true, message: "请输入端口号", trigger: "blur" }],
    match_type: [
      { required: true, message: "请选择匹配类型", trigger: "blur" },
    ],
  };
  return rules;
});

// 添加 Header
const addHeader = () => {
  console.log("formData.value", formData.value);

  formData.value.headers.push({ k: "", v: "" });
};

const handleClose = () => {
  emits("update:visible", false);
  emits("close");
};

// 删除 Header
const removeHeader = (index) => {
  formData.value.headers.splice(index, 1);
};

const handleOpen = () => {
  switch (operationType.value) {
    case 0:
      dialog.title = "新增转发规则信息";
      dataFormRef.value.clearValidate();
      formData.value.match_type = 0; // 默认精确匹配
      break;
    case 1:
      dialog.title = "编辑转发规则信息";
      break;
  }

  getTargetList();
};

const handleSubmitClick = () => {
  dataFormRef.value.validate(async (isValid) => {
    if (isValid) {
      switch (operationType.value) {
        case 0:
          await addData();
          break;
        case 1:
          await editData();
          break;
      }
      emits("update:visible", false);
    }
  });
};

const getTargetList = async () => {
  let res = await apiGetTargetList();
  targetDataList.value = res.list;
};

const addData = async () => {
  try {
    dialog.loading = true;
    await apiAddRule(formData.value);
    dialog.loading = false;
    toast("新增转发规则信息成功");
  } catch (error) {
    dialog.loading = false;
  }
};

const editData = async () => {
  try {
    dialog.loading = true;
    await apiUpdateRule(formData.value);
    dialog.loading = false;
    toast("修改转发规则信息成功");
  } catch (error) {
    dialog.loading = false;
  }
};
</script>