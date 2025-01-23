<template>
  <!--弹窗-->
  <el-dialog
    v-model="visible"
    :title="dialog.title"
    width="500px"
    @close="handleClose"
    @open="handleOpen"
    :close-on-click-modal="false"
    fullscreen
  >
    <el-form
      ref="dataFormRef"
      :model="formData"
      :rules="computedRules"
      label-width="auto"
    >
      <el-row :gutter="20">
        <el-col :span="18">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="6">
          <el-form-item label="模板类型" prop="template_type">
            <el-select
              v-model="formData.template_type"
              placeholder="请选择模板类型"
            >
              <el-option
                v-for="(item, index) in templateTypeOptions"
                :key="index"
                :value="item.key"
                :label="item.val"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

      <el-form-item label="输出路径" prop="output_path">
        <el-input v-model="formData.output_path" placeholder="请输入输出路径" />
      </el-form-item>

      <el-form-item label="备注" prop="remark">
        <el-input
          v-model="formData.remark"
          type="textarea"
          :rows="2"
          placeholder="请输入备注"
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
import { apiAddData, apiUpdateData } from "~/api/project/version";
import { reactive, ref, toRefs, computed } from "vue";

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
        name: "", // 名称
        template_type: "", // 模板类型
        output_path: "", // 输出路径
        remark: "", // 备注
      };
    },
  },
});

const { visible, operationType, formData } = toRefs(props);

const emits = defineEmits(["update:visible", "close"]);
const dataFormRef = ref(null);

const dialog = reactive({
  title: "",
  loading: false,
});

const templateTypeOptions = ref([]);

/**
 * 表单验证规则
 */
const computedRules = computed(() => {
  const rules = {
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    template_type: [
      { required: true, message: "请选择模板类型", trigger: "blur" },
    ],
    output_path: [
      { required: true, message: "请输入输出路径", trigger: "blur" },
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
  getTemplateTypeOptions();

  switch (operationType.value) {
    case 0:
      dialog.title = "新增代码生成配置";
      dataFormRef.value.clearValidate();
      break;
    case 1:
      dialog.title = "编辑代码生成配置";
      break;
  }
};

const getTemplateTypeOptions = async () => {
  let res = await apiGetDictDetails("10004"); // 假设10004是模板类型字典
  templateTypeOptions.value = res.list;
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
    await apiAddData(formData.value);
    dialog.loading = false;
    toast("新增代码生成配置成功");
  } catch (error) {}
};

/**
 * 修改数据
 */
const editData = async () => {
  try {
    dialog.loading = true;
    await apiUpdateData(formData.value);
    dialog.loading = false;
    toast("修改代码生成配置成功");
  } catch (error) {}
};
</script>