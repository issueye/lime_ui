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
      <div class="flex" style="height: calc(100% - 40px);">
        <div class="p-5 w-3/5 h-full" style="border-right: 1px solid #d9d9d9;">
          <el-form :model="form" label-width="100px" ref="formRef">
            <el-form-item label="编译前脚本">
              <div class="w-full flex gap-2 items-center">
                <el-tag closable v-for="(item, index) in form.scripts" :key="index" @close="handleTagClose(item)"
                  effect="plain" @dblclick="handleDblClick(item)">{{ item.name }}</el-tag>
                <el-input v-if="inputVisible" @keyup.enter="addScript" v-model="inputValue" class="w-32"></el-input>
                <el-button v-else type="primary" plain @click="inputVisible = true; inputValue = ''" icon="Plus"
                  size="small"></el-button>
              </div>
            </el-form-item>

            <el-form-item label="输出文件" prop="output">
              <!-- <el-input v-model="form.output" type="textarea" placeholder="可执行文件名（不含扩展）" :rows="5" /> -->
              <Codemirror v-model:value="form.output" ref="cmRef" :options="cmOptions" border height="200"
                style="line-height: 1.5;"></Codemirror>
            </el-form-item>

            <el-form-item label="目标平台">
              <div class="flex w-full gap-2">
                <el-select v-model="form.goos" placeholder="选择操作系统">
                  <el-option label="Windows" :value="0" />
                  <el-option label="Linux" :value="1" />
                  <el-option label="macOS" :value="2" />
                </el-select>
                <el-select v-model="form.goarch" placeholder="选择架构">
                  <el-option label="amd64" :value="0" />
                  <el-option label="arm64" :value="1" />
                </el-select>
              </div>
            </el-form-item>

            <el-form-item label="编译参数">
              <el-checkbox-group v-model="form.flags">
                <el-checkbox value="-v">显示详细输出(-v)</el-checkbox>
                <el-checkbox value="-trimpath">清除路径信息(-trimpath)</el-checkbox>
                <!-- <el-checkbox value="-ldflags '-w -s'">添加链接器标志(-w -s)</el-checkbox> -->
              </el-checkbox-group>
            </el-form-item>

            <!-- 连接器标志 -->
            <el-form-item label="连接器标志">
              <el-input v-model="form.ldflags" placeholder="例如：-w -s" />
            </el-form-item>

            <el-form-item label="注入变量">
              <div class="w-full">
                <div class="flex flex-col gap-2 w-full">
                  <div v-for="(item, index) in form.env_vars" :key="index" class="w-full flex justify-between gap-2">
                    <div class="w-4/5 gap-2 flex">
                      <el-input v-model="item.key" placeholder="变量名" class="w-2/5" />
                      <el-input v-model="item.value" placeholder="变量值" class="w-3/5" />
                    </div>
                    <el-button type="danger" @click="removeEnvVar(index)" icon="remove"></el-button>
                  </div>
                </div>
                <el-button type="primary" plain @click="addEnvVar" :class="form.env_vars.length > 0 ? 'mt-2' : ''"
                  icon="Plus" size="small"></el-button>
              </div>
            </el-form-item>

            <el-form-item label="构建标签">
              <el-input v-model="form.tags" placeholder="多个标签用逗号分隔（例如：jsoniter,debug）" />
            </el-form-item>

            <el-form-item>
              <el-button type="primary" @click="handleSubmit">保存编译信息</el-button>
              <el-button type="warning" icon="Promotion" @click="handleCompile">编译</el-button>
            </el-form-item>
          </el-form>
        </div>
        <div class="p-5 w-2/5 h-full">
          <div id="terminal" ref="terminal" class="h-full"></div>
        </div>
      </div>

      <ScriptDialog v-model:visible="scriptDialog.visible" :data="scriptDialog.data" />
    </template>
  </base-page>
</template>

<script setup>
import { ref, reactive, toRefs, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router';
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { AttachAddon } from 'xterm-addon-attach'
import "xterm/css/xterm.css";
import ScriptDialog from './dialog.vue';
import { useProjectStore } from '~/store/project';
import { storeToRefs } from 'pinia';
import { apiSaveCompileConfig, apiGetByProjectId, apiCompile } from '~/api/project';
import { toast } from "~/composables/util";
import "codemirror/mode/javascript/javascript.js";
import Codemirror from "codemirror-editor-vue3";

const projectStore = useProjectStore();
const { versionList } = storeToRefs(projectStore);

const compile = reactive({
  project_id: 0,
  version_id: 0,
})

const cmRef = ref();
const cmOptions = {
  mode: "text/javascript",
};

const inputVisible = ref(false)
const inputValue = ref('')

const title = ref('项目编译')

const scriptDialog = reactive({
  visible: false,
  data: {
    name: '',
    content: '',
  }
})

const scriptContent = ref(`
/**
  * 编译前运行时脚本
 * @param {string} project 项目名称
 * @param {string} version 版本号
 */
function runtimeCompileBefore(project, version) {

  console.log('project', project)
  console.log('version', version)

  // 返回一个一维对象
  return {
    data: {
      test: '123',
      test2: '456'
    }
  }
} 
`)

const outputScript = ref(`/**
 * 获取输出文件名称
 * @param compile {object} 编译信息
 * @param project {object} 项目信息
 * @param version {object} 版本信息
 * @return {string} 文件名称
 */
function getOutfileName(compile, project, version) {
	let name = project.Name + "." + version.Version
    // 判断编译平台
    if (compile.Goos.toString() == "windows") { name += '.exe' }
    return name;
}
`)

const formRef = ref(null)
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
  ldflags: '-w -s',
  tags: '',
  scripts: [],
  env_vars: [] // 初始化为空数组
})

const removeEnvVar = (index) => {
  form.env_vars.splice(index, 1)
}

const addEnvVar = () => {
  form.env_vars.push({ key: '', value: '' })
}

const addScript = () => {
  if (!inputValue.value) return;
  form.scripts.push({
    name: inputValue.value,
    content: scriptContent.value,
  })
  inputVisible.value = false
}

const handleTagClose = (tag) => {
  form.scripts.splice(form.scripts.indexOf(tag), 1)
}

const handleDblClick = (tag) => {
  console.log('dblclick', tag);
  scriptDialog.data = tag;

  console.log('scriptDialog', scriptDialog);
  scriptDialog.visible = true;
}

const handleBackClick = () => {
  // 返回上一页
  router.back()
}

const getConfig = async (id) => {
  try {
    const res = await apiGetByProjectId(id);
    form.project_id = res.project_id;

    form.goos = res.goos;
    form.goarch = res.goarch;
    form.tags = res.tags;

    form.output = res.output === "" ? outputScript.value : res.output;
    form.scripts = res.scripts ?? [];
    form.env_vars = res.env_vars ?? [];
    form.flags = res.flags ?? [];
    form.ldflags = res.ldflags ?? '-w -s';
  } catch (error) {
    console.log('error', error);
  }

}

onMounted(() => {
  // 获取路由参数
  const { id, version_id } = router.currentRoute.value.query;
  project.value = projectStore.getProjectById(id);
  title.value = `项目编译 - [${project.value.name}]`

  compile.project_id = id;
  compile.version_id = version_id == 0 ? null : version_id;
  getConfig(id);

  // 初始化终端
  initTerm();

  setTimeout(() => {
    cmRef.value?.refresh();
  }, 1000);
})

onUnmounted(() => {
  cmRef.value?.destroy();
})

const initTerm = () => {
  term.value = new Terminal({
    rendererType: "canvas", //渲染类型
    convertEol: true, //启用时，光标将设置为下一行的开头
    // scrollback: 50, //终端中的回滚量
    disableStdin: true, //是否应禁用输入
    windowsMode: true, // 根据窗口换行
    cursorStyle: "underline", //光标样式
    cursorBlink: true, //光标闪烁
    theme: {
      foreground: "#ECECEC", //字体
      background: "#000000", //背景色
      cursor: "help", //设置光标
      lineHeight: 20,
    },
  });

  term.value.open(terminal.value);
  term.value.loadAddon(fitAddon);
  // 不能初始化的时候fit,需要等terminal准备就绪,可以设置延时操作
  setTimeout(() => {
    fitAddon.fit();
  }, 5)

  term.value.writeln('Welcome to xterm');
}

const connWS = () => {
  let url = `ws://${location.host}/api/v1/ws`;
  ws.value = new WebSocket(url);    // 带 token 发起连接
  // 3.websocket集成的插件,这里要注意,网上写了很多websocket相关代码.xterm4版本没必要.
  const attachAddon = new AttachAddon(ws.value);
  term.value.loadAddon(attachAddon);
}

/**
 * 提交
 */
const handleSubmit = async () => {
  // connWS();
  form.project_id = parseInt(compile.project_id);
  console.log('form', form);
  try {
    await apiSaveCompileConfig(form);
    toast('保存成功');
  } catch (error) {
    console.log('error', error);
  }
}

/**
 * 编译
 */
const handleCompile = async () => {
  if (compile.version_id === 0 || !compile.version_id) {
    toast('请选择版本', 'warning');
    return;
  }

  try {
    connWS();

    await apiCompile(compile.project_id, compile.version_id);
  } catch (error) {
    console.log('error', error);
  }
}

</script>