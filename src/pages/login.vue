<template>
  <div class="min-h-screen bg-primary-500 flex items-center justify-end">
    <div class="w-[400px] mr-60" style="position: relative">
      <el-image :src="SLImage" class="flower-img w-[300px] h-[500px]" />
      <el-card class="w-[400px] h-[250px] p-8 bg-white shadow rounded-sm">
        <h2 class="font-bold text-3xl text-gray-800 text-center mb-6">
          欢迎回来
        </h2>
        <div
          class="flex items-center justify-center my-5 text-gray-300 space-x-2"
        >
          <span class="h-[1px] w-16 bg-gray-200"></span>
          <span>账号密码登录</span>
          <span class="h-[1px] w-16 bg-gray-200"></span>
        </div>
        <el-form
          ref="formRef"
          :rules="rules"
          :model="form"
          class="flex flex-col items-center"
        >
          <el-form-item prop="username" class="w-full">
            <el-input v-model="form.username" placeholder="请输入用户名">
              <template #prefix>
                <el-icon><user /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item prop="password" class="w-full">
            <el-input
              type="password"
              v-model="form.password"
              placeholder="请输入密码"
              show-password
            >
              <template #prefix>
                <el-icon><lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button
              class="w-full"
              type="primary"
              @click="onSubmit"
              :loading="loading"
              >登 录</el-button
            >
          </el-form-item>
        </el-form>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "~/store";
import { toast } from "~/composables/util";
import SLImage from "~/assets/sl.png";

const router = useRouter();
const userStore = useUserStore();

const form = reactive({
  username: "",
  password: "",
});

const rules = {
  username: [{ required: true, message: "用户名不能为空", trigger: "blur" }],
  password: [{ required: true, message: "密码不能为空", trigger: "blur" }],
};

const formRef = ref(null);
const loading = ref(false);

const onSubmit = () => {
  formRef.value.validate(async (valid) => {
    if (!valid) return false;
    loading.value = true;
    try {
      await userStore.loginUser(form);
      toast("登录成功");
      router.push("/home");
    } catch (err) {
      console.error(err);
    } finally {
      loading.value = false;
    }
  });
};

function onKeyUp(e) {
  if (e.key === "Enter") onSubmit();
}

onMounted(() => {
  document.addEventListener("keyup", onKeyUp);
});

onBeforeUnmount(() => {
  document.removeEventListener("keyup", onKeyUp);
});
</script>
<style scoped>
.flower-img {
  position: absolute;
  left: -195px;
  top: -120px;
}
</style>