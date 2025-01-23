<template>
  <!--弹窗-->
  <el-dialog
    v-model="visible"
    title="上传页面"
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
          <el-form-item label="产品编码" prop="product_code">
            <el-input
              v-model="formData.product_code"
              :disabled="true"
              placeholder="请输入产品编码"
            />
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
      <el-form-item label="版本号" prop="version">
        <el-input v-model="formData.version" placeholder="请输入版本号" />
      </el-form-item>
      <el-form-item label="文件">
        <el-upload
          drag
          :file-list="fileList"
          :auto-upload="true"
          :on-change="handleFileChange"
          class="w-full"
          :http-request="handleUpload"
        >
          <el-icon class="el-icon--upload"><upload-filled /></el-icon>
          <div class="el-upload__text">拖动文件或 <em>点击上传</em></div>
        </el-upload>
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
import { apiUploadFile } from "~/api/user";
import { apiSaveVersion } from "~/api/page";
import { reactive, ref, toRefs, computed } from "vue";

import { toast } from "~/composables/util";

const props = defineProps({
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
        version: "", // 版本号
        port: 0, // 端口号
        product_code: "", // 产品编码
        remark: "", // 备注
        path: "",
      };
    },
  },
});

const dataFormRef = ref(null);

const { visible, formData } = toRefs(props);

const fileList = ref([]);

const handleFileChange = (file, fList) => {
  fileList.value = fList.slice(-1); // 只保留最新的文件
};

const emits = defineEmits(["update:visible", "close"]);

/**
 * 表单验证规则
 */
const computedRules = computed(() => {
  const rules = {
    product_code: [
      { required: true, message: "请输入产品编码", trigger: "blur" },
    ],
    port: [{ required: true, message: "请输入端口号", trigger: "blur" }],
    version: [{ required: true, message: "请输入版本号", trigger: "blur" }],
    path: [{ required: true, message: "请上传文件", trigger: "blur" }],
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
  dataFormRef.value.clearValidate();
};

const handleUpload = async () => {
  const data = new FormData();
  data.append("file", fileList.value[0].raw);

  const uploadRes = await apiUploadFile(data);
  formData.value.path = uploadRes.url;
};

/**
 * 提交表单按钮
 */
const handleSubmitClick = async () => {
  dataFormRef.value.validate(async (isValid) => {
    if (fileList.value.length === 0) {
      toast("请先上传页面", "error");
      return;
    }

    try {
      let params = {
        port: formData.value.port,
        product_code: formData.value.product_code,
        version: formData.value.version,
        path: formData.value.path,
      };

      console.log("params", params);

      await apiSaveVersion(params);

      fileList.value = [];
      toast("添加版本成功");
    } catch (error) {
      // 错误处理
      toast("添加版本失败", "error");
    }

    emits("update:visible", false);
  });
};
</script>