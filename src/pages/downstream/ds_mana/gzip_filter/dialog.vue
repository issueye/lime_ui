<template>
  <!--弹窗-->
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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="匹配类型" prop="match_type">
            <el-select
              v-model.number="formData.match_type"
              placeholder="请选择匹配类型"
            >
              <el-option
                v-for="(item, index) in types"
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
      <el-form-item label="匹配内容" prop="match_content">
        <el-input
          v-model="formData.match_content"
          placeholder="请输入匹配内容"
        />
      </el-form-item>

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
import { apiAddGzipFilter, apiUpdateGzipFilter } from "~/api/gzip_filter";
import { reactive, ref, toRefs, computed } from "vue";
import { storeToRefs } from "pinia";
import { useProxyStore } from "~/store/proxy";

const props = defineProps({
  // 操作类型 0:新增 1:编辑
  operationType: {
    type: Number,
    default: 0,
  },
  // 是否显示
  visible: {
    type: Boolean,
    default: false,
  },
  // 获取表单数据
  formData: {
    type: Object,
    default: () => {
      return {
        id: 0, // ID
        port: 0, // 端口号
        match_type: 1, // 匹配模式
        match_content: "", // 匹配内容
        remark: "", // 备注
      };
    },
  },
});

const proxyStore = useProxyStore();
const { types } = storeToRefs(proxyStore);

const { visible, operationType, formData } = toRefs(props);

const emits = defineEmits(["update:visible", "close"]);
const dataFormRef = ref(null);

const dialog = reactive({
  title: "",
  loading: false,
});

/**
 * 表单验证规则
 */
const computedRules = computed(() => {
  const rules = {
    match_type: [
      { required: true, message: "请选择匹配类型", trigger: "blur" },
    ],
    match_content: [
      { required: true, message: "请输入匹配内容", trigger: "blur" },
    ],
  };
  return rules;
});

/**
 * 关闭弹窗
 */
const handleClose = () => {
  emits("update:visible", false);
  emits("close");
};

const handleOpen = () => {
  switch (operationType.value) {
    case 0:
      dialog.title = "新增过滤信息";
      dataFormRef.value.clearValidate();
      break;
    case 1:
      dialog.title = "编辑过滤信息";
      break;
  }
};

/**
 * 提交表单按钮
 */
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

/**
 * 新增数据
 */
const addData = async () => {
  try {
    dialog.loading = true;
    // 接口调用
    await apiAddGzipFilter(formData.value);
    dialog.loading = false;
    toast("新增过滤信息成功");
  } catch (error) {}
};

/**
 * 修改数据
 */
const editData = async () => {
  try {
    dialog.loading = true;
    // 接口调用
    await apiUpdateGzipFilter(formData.value);
    dialog.loading = false;
    toast("修改过滤信息成功");
  } catch (error) {}
};
</script>