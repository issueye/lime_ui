<template>
  <!--弹窗-->
  <el-dialog v-model="visible" :title="dialog.title" width="700px" @close="handleClose" @open="handleOpen"
    :close-on-click-modal="false">
    <el-form ref="dataFormRef" :model="formData" :rules="computedRules" label-width="auto">
      <el-form-item label="版本号" prop="version">
        <el-input v-model="formData.version" placeholder="请输入版本号" />
      </el-form-item>

      <el-form-item label="分支名称" prop="branch_name">
        <el-select v-model="formData.branch_name" placeholder="请选择分支名称">
          <el-option v-for="item in branchList" :key="item.id" :label="item.name" :value="item.name"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="HASH" prop="hash">
        <el-input v-model="formData.hash" placeholder="请输入HASH" />
      </el-form-item>

      <el-form-item label="更新内容" prop="update_content">
        <el-input v-model="formData.update_content" type="textarea" :rows="10" placeholder="请输入更新内容" />
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
import { apiGetList as apiGetBranchList } from "~/api/project/branch";

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
        repo_url: "", // 仓库地址
        repo_user: "", // 仓库用户
        repo_password: "", // 用户密码
        description: "", // 备注
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


const branchList = ref([]);

/**
 * 表单验证规则
 */
const computedRules = computed(() => {
  const rules = {
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    repo_url: [{ required: true, message: "请输入仓库地址", trigger: "blur" }],
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

const getBranchList = async () => {
    let res = await apiGetBranchList();
    branchList.value = res.list;
};

const handleOpen = () => {
  getBranchList();

  switch (operationType.value) {
    case 0:
      dialog.title = "新增版本信息";
      dataFormRef.value.clearValidate();
      break;
    case 1:
      dialog.title = "新增版本信息";
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
    await apiAddData(formData.value);
    dialog.loading = false;
    toast("新增代码生成配置成功");
  } catch (error) { }
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
  } catch (error) { }
};
</script>