<template>
  <base-page :title="title" desc="项目编译" padding="0px">
    <template #actions>
      <div>
        <el-select
          v-model="compile.version_id"
          placeholder="请选择版本"
          class="w-[300px] mr-2"
        >
          <el-option
            v-for="item in versionList"
            :key="item.id"
            :label="item.version"
            :value="item.id"
          ></el-option>
        </el-select>
        <el-button type="primary" @click="handleBackClick">返回</el-button>
      </div>
    </template>
    <template #content>
      <div class="flex h-full">
        <div class="w-1/2 flex flex-col border-r border-gray-200">
          <div class="flex-1 overflow-y-auto">
            <el-form
              :model="form"
              label-width="100px"
              ref="formRef"
              class="p-5"
            >
              <el-row :gutter="20">
                <el-col :span="14"
                  ><el-form-item label="输出文件" prop="output">
                    <el-button
                      type="primary"
                      plain
                      icon="Edit"
                      size="small"
                      @click="
                        handleEditOutputClick({ type: 'output', index: 0 })
                      "
                    ></el-button> </el-form-item
                ></el-col>

                <el-col :span="10">
                  <el-form-item label="目标平台">
                    <div class="flex w-full gap-2">
                      <el-select
                        v-model="form.goos"
                        placeholder="选择操作系统"
                        size="small"
                      >
                        <el-option label="Windows" :value="0" />
                        <el-option label="Linux" :value="1" />
                        <el-option label="macOS" :value="2" />
                      </el-select>
                      <el-select
                        v-model="form.goarch"
                        placeholder="选择架构"
                        size="small"
                      >
                        <el-option label="amd64" :value="0" />
                        <el-option label="arm64" :value="1" />
                      </el-select>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="编译参数">
                <el-checkbox-group v-model="form.flags">
                  <el-checkbox value="-v">显示详细输出(-v)</el-checkbox>
                  <el-checkbox value="-trimpath"
                    >清除路径信息(-trimpath)</el-checkbox
                  >
                </el-checkbox-group>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 连接器标志 -->
                  <el-form-item label="连接器标志">
                    <el-input
                      v-model="form.ldflags"
                      placeholder="例如：-w -s"
                      size="small"
                    />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="构建标签">
                    <el-input
                      v-model="form.tags"
                      placeholder="多个逗号分隔（例如：jsoniter,debug）"
                      size="small"
                    />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="注入变量">
                <InjectVars
                  v-model:injectVars="form.env_vars"
                  @edit="handleDblClick"
                />
              </el-form-item>
              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 使用封装的 编译前脚本 组件 -->
                  <CompileScripts
                    v-model:scripts="form.before_scripts"
                    type="before"
                    label="编译前脚本"
                    @edit="handleDblClick"
                  />
                </el-col>
                <el-col :span="12">
                  <!-- 使用封装的 编译后脚本 组件 -->
                  <CompileScripts
                    v-model:scripts="form.after_scripts"
                    type="after"
                    label="编译后脚本"
                    @edit="handleDblClick"
                  />
                </el-col>
              </el-row>
              <OsEnvVars
                :envVars="form.os_env_vars"
                @update:envVars="form.os_env_vars = $event"
              />
            </el-form>
          </div>
          <div
            class="shrink-0 p-4 flex justify-end gap-2 bg-gray-50 border-t border-gray-200"
          >
            <el-button type="primary" @click="handleSubmit"
              >保存编译信息</el-button
            >
            <el-button type="warning" icon="Promotion" @click="handleCompile"
              >编译</el-button
            >
          </div>
        </div>
        <!-- 添加 ref 属性 -->
        <CompileConsole
          ref="compileConsoleRef"
          :projectId="compile.project_id"
          :versionId="compile.version_id === null ? 0 : compile.version_id"
          @ws-status-change="handleWsStatusChange"
        />
      </div>

      <ScriptDialog
        v-model:visible="scriptDialog.visible"
        :data="scriptDialog.data"
        @close="dialogClose"
      />
    </template>
  </base-page>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import ScriptDialog from "./dialog.vue";
import { useProjectStore } from "~/store/project";
import { storeToRefs } from "pinia";
import {
  apiSaveCompileConfig,
  apiGetByProjectId,
  apiCompile,
} from "~/api/project";
import { toast } from "~/composables/util";
import CompileConsole from "./CompileConsole.vue";
import OsEnvVars from "./OsEnvVars.vue";
import InjectVars from "./InjectVars.vue";
import CompileScripts from "./CompileScripts.vue";

const projectStore = useProjectStore();
const { versionList } = storeToRefs(projectStore);

const compile = reactive({
  project_id: 0,
  version_id: 0,
});

const title = ref("项目编译");

const scriptDialog = reactive({
  visible: false,
  data: {
    name: "",
    content: "",
  },
});

const scriptContent = ref(`# 脚本
# @param compile {object} 编译信息
# @param project {object} 项目信息
# @param version {object} 版本信息
# @return {string} 注入变量

#   表达式...

`);

const outputScript = ref(`# 获取输出文件名称
# @param compile {object} 编译信息
# @param project {object} 项目信息
# @param version {object} 版本信息
# @return {string} 文件名称

# 平台
platform = compile.Goos.String() == "windows" ? ".exe" : ""
# 输出
name = "bin/" + project.Name + "." + version.Version + platform
`);

const injectScript = ref(`# 注入变量
# @param compile {object} 编译信息
# @param project {object} 项目信息
# @param version {object} 版本信息
# @return {string} 注入变量

#   表达式...

`);

const formRef = ref(null);
const router = useRouter();
const project = ref(null);

const compileConsoleRef = ref(null); // 新增：获取子组件实例

const form = reactive({
  project_id: 0,
  output: outputScript.value,
  goos: 0,
  goarch: 0,
  flags: [],
  ldflags: "-w -s",
  tags: "",
  before_scripts: [], // 编译前脚本
  after_scripts: [], // 编译后脚本
  os_env_vars: [], // 系统环境变量
  env_vars: [], // 注入变量
});

const handleDblClick = (tag) => {
  // console.log("tag", tag);
  scriptDialog.data = {
    name: tag.value.name,
    content: tag.value.content ? tag.value.content : scriptContent.value,
    type: tag.type,
  };
  scriptDialog.visible = true;
};

const handleEditOutputClick = (value) => {
  let content = "";
  let title = "";

  if (value.type === "output") {
    content = form.output === "" ? outputScript.value : form.output;
    title = "输出文件";
  }

  if (value.type === "inject_env") {
    content =
      form.env_vars[value.index].value === ""
        ? injectScript.value
        : form.env_vars[value.index].value;

    title = `注入变量 ${form.env_vars[value.index].key}`;
  }

  console.log("content", content);

  scriptDialog.data = {
    name: title,
    content: content,
    type: "shell",
    dataType: value.type,
  };
  scriptDialog.visible = true;
};

const handleBackClick = () => {
  // 返回上一页
  router.back();
};

const getConfig = async (id) => {
  try {
    const res = await apiGetByProjectId(id);
    form.project_id = res.project_id;

    form.goos = res.goos;
    form.goarch = res.goarch;
    form.tags = res.tags;

    form.output = res.output === "" ? outputScript.value : res.output;
    form.before_scripts = res.before_scripts ?? [];
    form.after_scripts = res.after_scripts ?? [];
    form.os_env_vars = res.os_env_vars ?? []; // 添加系统环境变量处理
    form.env_vars = res.env_vars ?? [];
    form.flags = res.flags ?? [];
    form.ldflags = res.ldflags ?? "-w -s";
  } catch (error) {
    console.log("error", error);
  }
};

onMounted(() => {
  // 获取路由参数
  const { id, version_id } = router.currentRoute.value.query;
  project.value = projectStore.getProjectById(id);
  title.value = `项目编译 - [${project.value.name}]`;

  compile.project_id = parseInt(id);
  let vid = parseInt(version_id);
  compile.version_id = vid === 0 ? null : vid;
  getConfig(id);
});

onUnmounted(() => {});

const handleWsStatusChange = (status) => {
  console.log("WebSocket status changed:", status);
};

/**
 * 提交
 */
const handleSubmit = async () => {
  // connWS();
  form.project_id = parseInt(compile.project_id);
  console.log("form", form);
  try {
    await apiSaveCompileConfig(form);
    toast("保存成功");
  } catch (error) {
    console.log("error", error);
  }
};

/**
 * 编译
 */
const handleCompile = async () => {
  if (compile.version_id === 0 || !compile.version_id) {
    toast("请选择版本", "warning");
    return;
  }

  try {
    // 新增：编译后调用子组件方法重新连接 websocket
    if (!compileConsoleRef.value) return;

    compileConsoleRef.value.connectWebSocket();

    await apiCompile(compile.project_id, compile.version_id);
  } catch (error) {
    console.log("error", error);
  }
};

/**
 * 关闭弹窗
 */
const dialogClose = (value) => {
  console.log("value", value, scriptDialog.data, "form", form);
  switch (scriptDialog.data.type) {
    case "output": {
      form.output = value;
      break;
    }
    case "before": {
      form.before_scripts.forEach((item) => {
        if (item.name === scriptDialog.data.name) {
          item.content = value;
        }
      });
      break;
    }
    case "after": {
      form.after_scripts.forEach((item) => {
        if (item.name === scriptDialog.data.name) {
          item.content = value;
        }
      });
      break;
    }
    case "inject_env": {
      form.env_vars.forEach((item) => {
        if (item.key === scriptDialog.data.name) {
          item.value = value;
        }
      });
      break;
    }
  }
};
</script>