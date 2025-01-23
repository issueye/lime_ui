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
      <el-form-item label="标题" prop="title">
        <el-input v-model="formData.title" placeholder="请输入标题" />
      </el-form-item>
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="名称" prop="name">
            <el-input v-model="formData.name" placeholder="请输入名称" />
          </el-form-item>
        </el-col>
        <el-col :span="12">
          <el-form-item label="版本号" prop="version">
            <!-- <el-input v-model="formData.version" placeholder="请输入版本号" /> -->
            <el-select v-model="formData.version" placeholder="请输入版本号">
              <el-option
                v-for="(item, index) in versionList"
                :key="index"
                :label="item.version"
                :value="item.version"
              />
            </el-select>
          </el-form-item>
        </el-col>
      </el-row>

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
      <el-row :gutter="20">
        <el-col :span="12">
          <el-form-item label="状态" prop="status">
            <el-switch
              v-model="formData.status"
              :active-value="true"
              :inactive-value="false"
            />
          </el-form-item>
        </el-col>
      </el-row>

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
import { apiAddPage, apiUpdatePage, apiGetVersionList } from "~/api/page";
import { reactive, ref, toRefs, computed } from "vue";
import { toast } from "~/composables/util";

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
        title: "", // 标题
        version: "", // 版本号
        port: 0, // 端口号
        product_code: "", // 产品编码
        use_version_route: false, // 是否使用版本路由
        status: false, // 状态
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

const versionList = ref([]);

/**
 * 表单验证规则
 */
const computedRules = computed(() => {
  const rules = {
    name: [{ required: true, message: "请输入名称", trigger: "blur" }],
    title: [{ required: true, message: "请输入标题", trigger: "blur" }],
    product_code: [
      { required: true, message: "请输入产品编码", trigger: "blur" },
    ],
    port: [{ required: true, message: "请输入端口号", trigger: "blur" }],
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
      dialog.title = "新增静态页面信息";
      dataFormRef.value.clearValidate();
      break;
    case 1:
      dialog.title = "编辑静态页面信息";
      getVersionList(formData.id);
      break;
  }
};

const getVersionList = async () => {
  try {
    let res = await apiGetVersionList(formData.value.id);
    versionList.value = res;
  } catch (error) {}
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
    await apiAddPage(formData.value);
    dialog.loading = false;
    toast("新增端口号信息成功");
  } catch (error) {}
};

/**
 * 修改数据
 */
const editData = async () => {
  try {
    dialog.loading = true;
    // 接口调用
    await apiUpdatePage(formData.value);
    dialog.loading = false;
    toast("修改端口号信息成功");
  } catch (error) {}
};
</script>