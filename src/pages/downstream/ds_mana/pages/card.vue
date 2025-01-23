<template>
  <div
    class="w-[300px] h-[200px] mr-4 mb-4 flex flex-col border border-solid border-gray-300 rounded-sm shadow-md hover:shadow-lg transition-all duration-300 ease-out cursor-pointer"
  >
    <div class="p-4 flex justify-between mb-2">
      <div class="w-full flex items-center justify-between">
        <span class="text-xl font-semibold subpixel-antialiased leading-5">
          {{ data.title }}
        </span>
        <el-tag
          class="font-semibold"
          :type="data.status ? 'success' : 'danger'"
          size="small"
          effect="plain"
        >
          {{ data.status ? "启用" : "停用" }}
        </el-tag>
      </div>
    </div>
    <div class="grow px-4">
      <div class="w-full mb-1 flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-500 tracking-wide"
          >名　称：</span
        >
        <span class="text-xs">{{ data.name }}</span>
      </div>
      <div class="w-full my-1 flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-500 tracking-wide"
          >版　本：</span
        >
        <span class="text-xs">{{ data.version }}</span>
      </div>
      <div class="w-full my-1 flex items-center justify-between">
        <span class="text-sm font-semibold text-slate-500 tracking-wide"
          >唯一码：</span
        >
        <span class="text-xs">{{ data.product_code }}</span>
      </div>
    </div>
    <div class="flex justify-end p-4">
      <el-dropdown split-button type="primary" @click="handleEditClick">
        <el-icon class="mr-2">
          <component is="edit"></component>
        </el-icon>
        编辑
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="handleUploadClick">
              <el-icon class="mr-2">
                <component is="upload"></component>
              </el-icon>
              上传
            </el-dropdown-item>
            <el-dropdown-item @click="handleCopyClick">
              <el-icon class="mr-2">
                <component is="DocumentCopy"></component>
              </el-icon>
              复制
            </el-dropdown-item>
            <el-dropdown-item
              class="text-danger-500"
              @click="handleDeleteClick"
            >
              <el-icon class="mr-2">
                <component is="delete"></component>
              </el-icon>
              删除
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
<script setup>
import { toRefs } from "vue";

const props = defineProps({
  data: {
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

const emits = defineEmits(["edit", "upload", "delete", "copy"]);

const { data } = toRefs(props);

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

const handleDeleteClick = async () => {
  emits("delete", data.value);
};

const handleEditClick = async () => {
  emits("edit", data.value);
};

const handleUploadClick = async () => {
  emits("upload", data.value);
};

const handleCopyClick = async () => {
  emits("copy", data.value);
};
</script>