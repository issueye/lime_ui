<!-- components/CompileConsole.vue -->
<template>
  <div class="w-1/2 flex flex-col h-full bg-black">
    <div class="flex items-center">
      <div
        class="flex items-center shrink-0 p-2 text-xs text-gray-400 border-b border-gray-700"
      >
        编译控制台
      </div>

      <!-- WebSocket状态指示器 -->
      <div class="flex items-center space-x-1 ml-2">
        <div
          class="w-2.5 h-2.5 rounded-full"
          :class="{
            'bg-green-500': wsStatus === 'connected',
            'bg-red-500': wsStatus === 'error',
            'bg-gray-400': wsStatus === 'disconnected',
          }"
        ></div>
        <span class="text-sm text-gray-400">
          {{
            wsStatus === "connected"
              ? "已连接"
              : wsStatus === "error"
              ? "连接错误"
              : "未连接"
          }}
        </span>
      </div>
    </div>

    <div id="terminal" ref="terminal" class="flex-1 p-2"></div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { Terminal } from "xterm";
import FitAddon from "xterm-addon-fit";
import "xterm/css/xterm.css";

const props = defineProps({
  projectId: {
    type: Number,
    required: true,
  },
  versionId: {
    type: Number,
    required: true,
  },
});

const emit = defineEmits(["ws-status-change"]);

const terminal = ref(null);
const term = ref(null);
const ws = ref(null);
const wsStatus = ref("disconnected");
const heartbeatTimer = ref(null);
const heartbeatInterval = 5000;

// WebSocket相关方法
const sendHeartbeat = () => {
  if (ws.value?.readyState === WebSocket.OPEN) {
    ws.value.send(JSON.stringify({ type: "heartbeat" }));
  }
};

const startHeartbeat = () => {
  heartbeatTimer.value = setInterval(sendHeartbeat, heartbeatInterval);
};

const stopHeartbeat = () => {
  if (heartbeatTimer.value) {
    clearInterval(heartbeatTimer.value);
    heartbeatTimer.value = null;
  }
};

// 添加 resize 处理函数
const handleResize = () => {
  if (term.value && FitAddon) {
    FitAddon.fit();
  }
};

const connectWebSocket = () => {
  // 如果项目编码 === 0 或者 版本编码 === 0 则不连接
  if (props.projectId === 0 || props.versionId === 0) return;

  const route_path = import.meta.env.VITE_B_URL + "/ws_compile";
  const url = `ws://${location.host}${route_path}?project_id=${props.projectId}&id=${props.versionId}`;
  console.log("url", url);

  if (ws.value) {
    stopHeartbeat();
    ws.value.close();
  }

  ws.value = new WebSocket(url);

  ws.value.onopen = () => {
    wsStatus.value = "connected";
    startHeartbeat();
    emit("ws-status-change", "connected");
  };

  ws.value.onclose = () => {
    wsStatus.value = "disconnected";
    stopHeartbeat();
    emit("ws-status-change", "disconnected");
  };

  ws.value.onerror = (error) => {
    wsStatus.value = "error";
    stopHeartbeat();
    emit("ws-status-change", "error");
  };

  ws.value.onmessage = (e) => {
    if (term.value) {
      // 解析数据 {"type":1,"content":"{\"type\":\"heartbeat\"}","time":"2025-02-08T21:56:27.9070463+08:00"}
      const data = JSON.parse(e.data);
      if (data.type === 1) {
        // 心跳包
        return;
      }

      let date = new Date();
      // 写入数据
      term.value.writeln(date.toLocaleTimeString() + " " + data.content);
    }
  };
};

// 终端初始化
const initTerminal = () => {
  term.value = new Terminal({
    rendererType: "canvas",
    convertEol: true,
    scrollback: 1000,
    disableStdin: true,
    windowsMode: true,
    cursorStyle: "underline",
    cursorBlink: true,
    fontFamily:
      "'Cascadia Code', Menlo, 'DejaVu Sans Mono', Consolas, 'Courier New', monospace",
    fontSize: 13,
    lineHeight: 1.2,
    theme: {
      foreground: "#A9B7C6",
      background: "#1E1E1E",
      cursor: "#A9B7C6",
      selection: "#214283",
      black: "#000000",
    },
  });

  if (terminal.value) {
    term.value.open(terminal.value);
  }
};

onMounted(() => {
  initTerminal();
  connectWebSocket();
  // 添加 resize 事件监听
  window.addEventListener("resize", handleResize);
});

onBeforeUnmount(() => {
  stopHeartbeat();
  if (ws.value) {
    ws.value.close();
  }
  if (term.value) {
    term.value.dispose();
  }

  // 移除 resize 事件监听
  window.removeEventListener("resize", handleResize);
});

// 暴露方法供父组件调用
defineExpose({
  clearTerminal: () => {
    if (term.value) {
      term.value.clear();
    }
  },
  connectWebSocket, // 新增：暴露connectWebSocket方法到父组件
});
</script>