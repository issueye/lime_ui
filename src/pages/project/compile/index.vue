<template>
  <base-page :title="title" desc="项目编译" padding="0px">
    <template #actions>
      <div>
        <el-select v-model="compile.version_id" placeholder="请选择版本" class="w-[300px] mr-2">
          <el-option v-for="item in versionList" :key="item.id" :label="item.version" :value="item.id"></el-option>
        </el-select>
        <el-button type="primary" @click="handleBackClick">返回</el-button>
      </div>
    </template>
    <template #content>
      <div class="flex h-full">
        <div class="w-1/2 flex flex-col border-r border-gray-200">
          <div class="flex-1 overflow-y-auto">
            <el-form :model="form" label-width="100px" ref="formRef" class="p-5">
              <el-form-item label="系统环境变量">
                <div class="w-full border border-solid border-gray-200 p-2">
                  <div class="h-[100px] flex flex-col gap-2 w-full overflow-y-scroll">
                    <div v-for="(item, index) in form.os_env_vars" :key="index"
                      class="w-full flex justify-between gap-2 items-center">
                      <div class="w-4/5 gap-2 flex items-center">
                        <el-input v-model="item.key" placeholder="变量名" class="w-4/5" size="small" />
                        <el-input v-model="item.value" placeholder="变量值" class="w-4/5" size="small" />
                      </div>
                      <el-button type="danger" @click="removeOsEnvVar(index)" icon="Delete" size="small"></el-button>
                    </div>
                  </div>
                  <el-button type="primary" plain @click="addOsEnvVar" :class="form.os_env_vars.length > 0 ? 'mt-2' : ''"
                    icon="Plus" size="small"></el-button>
                </div>
              </el-form-item>
              <el-divider size="small" class="mx-1"></el-divider>
              <el-row :gutter="20">
                <el-col :span="12">
                  <el-form-item label="编译前脚本">
                    <div class="w-full flex gap-2 items-center">
                      <el-tag size="small" closable v-for="(item, index) in form.before_scripts" :key="index" @close="
                        handleTagClose({
                          value: item,
                          type: 'before',
                          index: index,
                        })
                        " effect="plain" @dblclick="
                          handleDblClick({
                            value: item,
                            type: 'before',
                            index: index,
                          })
                          ">{{ item.name }}</el-tag>
                      <el-input size="small" v-if="beforeVisible" @keyup.enter="addScript('before')" v-model="beforeInputValue"
                        class="w-32"></el-input>
                      <el-button v-else type="primary" plain @click="
                        beforeVisible = true;
                      beforeInputValue = '';
                      " icon="Plus" size="small"></el-button>
                    </div>
                  </el-form-item>
                </el-col>
                
                <el-col :span="12">
                  <el-form-item label="编译后脚本">
                    <div class="w-full flex gap-2 items-center">
                      <el-tag size="small" closable v-for="(item, index) in form.after_scripts" :key="index" @close="
                        handleTagClose({
                          value: item,
                          type: 'after',
                          index: index,
                        })
                        " effect="plain" @dblclick="
                          handleDblClick({
                            value: item,
                            type: 'after',
                            index: index,
                          })
                          ">{{ item.name }}</el-tag>
                      <el-input size="small" v-if="afterVisible" @keyup.enter="addScript('after')" v-model="afterInputValue"
                        class="w-32"></el-input>
                      <el-button v-else type="primary" plain @click="
                        afterVisible = true;
                      afterInputValue = '';
                      " icon="Plus" size="small"></el-button>
                    </div>
                  </el-form-item>
                </el-col>
              </el-row>
              <el-divider size="small"></el-divider>
              <el-row :gutter="20">
                <el-col :span="6"><el-form-item label="输出文件" prop="output">
                    <el-button type="primary" plain icon="Edit" size="small"
                      @click="handleEditOutputClick({ type: 'output', index: 0 })"></el-button>
                  </el-form-item></el-col>

                <el-col :span="18">
                  <el-form-item label="目标平台">
                    <div class="flex w-full gap-2">
                      <el-select v-model="form.goos" placeholder="选择操作系统" size="small">
                        <el-option label="Windows" :value="0" />
                        <el-option label="Linux" :value="1" />
                        <el-option label="macOS" :value="2" />
                      </el-select>
                      <el-select v-model="form.goarch" placeholder="选择架构" size="small">
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
                  <el-checkbox value="-trimpath">清除路径信息(-trimpath)</el-checkbox>
                </el-checkbox-group>
              </el-form-item>

              <el-row :gutter="20">
                <el-col :span="12">
                  <!-- 连接器标志 -->
                  <el-form-item label="连接器标志">
                    <el-input v-model="form.ldflags" placeholder="例如：-w -s" size="small" />
                  </el-form-item>
                </el-col>
                <el-col :span="12">
                  <el-form-item label="构建标签">
                    <el-input v-model="form.tags" placeholder="多个逗号分隔（例如：jsoniter,debug）" size="small" />
                  </el-form-item>
                </el-col>
              </el-row>

              <el-form-item label="注入变量">
                <div class="w-full border border-solid border-gray-200 p-2">
                  <div class="h-[100px] flex flex-col gap-2 w-full overflow-y-scroll">
                    <div v-for="(item, index) in form.env_vars" :key="index"
                      class="w-full flex justify-between gap-2 items-center">
                      <div class="w-4/5 gap-2 flex items-center">
                        <el-input v-model="item.key" placeholder="变量名" class="w-4/5" size="small" />
                        <el-button type="primary" plain icon="Edit" size="small" @click="
                          handleDblClick({
                            type: 'inject_env',
                            value: {
                              name: item.key,
                              content: item.value,
                            },
                            index: index,
                          })
                          "></el-button>
                      </div>
                      <el-button type="danger" @click="removeEnvVar(index)" icon="remove" size="small"></el-button>
                    </div>
                  </div>
                  <el-button type="primary" plain @click="addEnvVar" :class="form.env_vars.length > 0 ? 'mt-2' : ''"
                    icon="Plus" size="small"></el-button>
                </div>
              </el-form-item>
            </el-form>
          </div>
          <div class="shrink-0 p-4 flex justify-end gap-2 bg-gray-50 border-t border-gray-200">
            <el-button type="primary" @click="handleSubmit">保存编译信息</el-button>
            <el-button type="warning" icon="Promotion" @click="handleCompile">编译</el-button>
          </div>
        </div>
        <div class="w-1/2 flex flex-col h-full bg-black">
          <div class="shrink-0 p-2 text-xs text-gray-400 border-b border-gray-700">
            编译控制台
          </div>
          <div id="terminal" ref="terminal" class="flex-1 p-2"></div>
        </div>
      </div>

      <ScriptDialog v-model:visible="scriptDialog.visible" :data="scriptDialog.data" @close="dialogClose" />
    </template>
  </base-page>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, onUnmounted } from "vue";
import { useRouter } from "vue-router";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import "xterm/css/xterm.css";
import ScriptDialog from "./dialog.vue";
import { useProjectStore } from "~/store/project";
import { storeToRefs } from "pinia";
import {
  apiSaveCompileConfig,
  apiGetByProjectId,
  apiCompile,
} from "~/api/project";
import { toast } from "~/composables/util";

const projectStore = useProjectStore();
const { versionList } = storeToRefs(projectStore);

const compile = reactive({
  project_id: 0,
  version_id: 0,
});

const beforeVisible = ref(false);
const afterVisible = ref(false);
const afterInputValue = ref("");
const beforeInputValue = ref("");

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
const terminal = ref(null);
let term = ref(null);
const ws = ref(null);
const project = ref(null);

const fitAddon = new FitAddon();

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

const removeEnvVar = (index) => {
  form.env_vars.splice(index, 1);
};

const addEnvVar = () => {
  form.env_vars.push({ key: "", value: "" });
};

const removeOsEnvVar = (index) => {
  form.os_env_vars.splice(index, 1);
};

const addOsEnvVar = () => {
  form.os_env_vars.push({ key: "", value: "" });
};

const addScript = (type) => {
  console.log("type", type, afterInputValue, afterVisible);
  if (type == "before") {
    saveScript(form.before_scripts, beforeInputValue, beforeVisible);
  }

  if (type == "after") {
    saveScript(form.after_scripts, afterInputValue, afterVisible);
  }
};

/**
 *
 * @param value {string} 编译前脚本内容
 */
const saveScript = (data, val, visible) => {
  if (!val.value) return;

  // 如果有相同名称的，就不允许添加
  if (data.some((item) => item.name === val.value)) {
    toast("脚本名称已存在", "error");
    return;
  }

  data.push({
    name: val.value,
    content: scriptContent.value,
  });

  visible.value = false;
};

const handleTagClose = (data) => {
  switch (data.type) {
    case "before":
      form.before_scripts.splice(data.index, 1);
      break;
    case "after":
      form.after_scripts.splice(data.index, 1);
  }
};

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

// 添加 resize 处理函数
const handleResize = () => {
  if (term.value && fitAddon) {
    fitAddon.fit();
  }
};

onMounted(() => {
  // 获取路由参数
  const { id, version_id } = router.currentRoute.value.query;
  project.value = projectStore.getProjectById(id);
  title.value = `项目编译 - [${project.value.name}]`;

  compile.project_id = id;
  compile.version_id = version_id == 0 ? null : parseInt(version_id);
  getConfig(id);

  // 初始化终端
  initTerm();

  // 添加 resize 事件监听
  window.addEventListener('resize', handleResize);
});

onUnmounted(() => {
  // 移除 resize 事件监听
  window.removeEventListener('resize', handleResize);
});

const initTerm = () => {
  term.value = new Terminal({
    rendererType: "canvas",
    convertEol: true,
    scrollback: 1000, // 增加回滚量
    disableStdin: true,
    windowsMode: true,
    cursorStyle: "underline",
    cursorBlink: true,
    fontFamily: "'Cascadia Code', Menlo, 'DejaVu Sans Mono', Consolas, 'Courier New', monospace", // 更新字体
    fontSize: 13,
    lineHeight: 1.2,
    theme: {
      foreground: "#A9B7C6",      // 更柔和的文字颜色
      background: "#1E1E1E",      // VS Code 风格的背景色
      cursor: "#A9B7C6",
      selection: "#214283",       // 选中文本的背景色
      black: "#000000",
      red: "#FF6B68",
      green: "#A8C023",
      yellow: "#D6BF55",
      blue: "#5394EC",
      magenta: "#AE8ABE",
      cyan: "#299999",
      white: "#A9B7C6",
    },
  });

  term.value.open(terminal.value);
  term.value.loadAddon(fitAddon);
  fitAddon.fit();
  
  // 添加欢迎信息
  term.value.writeln("\x1b[34m=== 编译控制台 ===\x1b[0m");
  term.value.writeln("\x1b[90m等待编译任务...\x1b[0m");
};

const connWS = () => {
  let route_path = import.meta.env.VITE_B_URL + "/ws_compile";
  let url = `ws://${location.host}${route_path}?project_id=${compile.project_id}&id=${compile.version_id}`;
  console.log('url', url);
  try {
    if (typeof (WebSocket) === "undefined") {
      console.log("您的浏览器不支持WebSocket");
      return;
    }

    if (ws.value !== null) {
      ws.value.close();
    }
    console.log('term.value', term.value);

    term.value.clear();

    ws.value = new WebSocket(url);
    // 3.websocket集成的插件,这里要注意,网上写了很多websocket相关代码.xterm4版本没必要.
    // const attachAddon = new AttachAddon(ws.value);
    // term.value.loadAddon(attachAddon);
    ws.value.onmessage = (e) => {
      console.log('e', e);
      const date = new Date();
      term.value.writeln(date.toLocaleString() + ": " + e.data);
    }
  } catch (error) {
    console.log("error", error);
  }
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

  connWS();

  try {
    await apiCompile(compile.project_id, compile.version_id);
  } catch (error) {
    console.log("error", error);
  }
};

/**
 * 关闭弹窗
 */
const dialogClose = (value) => {
  console.log('value', value, scriptDialog.data, "form", form);
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