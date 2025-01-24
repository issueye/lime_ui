<template>
    <el-dialog title="Go编译配置" v-model="visible" width="900px" @closed="handleClose">
        <el-form :model="form" label-width="100px" ref="formRef">
            <el-form-item label="输出文件" prop="output" required>
                <el-input v-model="form.output" placeholder="可执行文件名（不含扩展）" />
            </el-form-item>

            <el-form-item label="目标平台">
                <div class="flex w-full gap-2">
                    <el-select v-model="form.goos" placeholder="选择操作系统">
                        <el-option label="Linux" value="linux" />
                        <el-option label="Windows" value="windows" />
                        <el-option label="macOS" value="darwin" />
                    </el-select>
                    <el-select v-model="form.goarch" placeholder="选择架构">
                        <el-option label="amd64" value="amd64" />
                        <el-option label="arm64" value="arm64" />
                    </el-select>
                </div>
            </el-form-item>

            <el-form-item label="编译参数">
                <el-checkbox-group v-model="form.flags">
                    <el-checkbox value="-v">显示详细输出</el-checkbox>
                    <el-checkbox value="-race">启用竞态检测</el-checkbox>
                    <el-checkbox value="-trimpath">清除路径信息</el-checkbox>
                </el-checkbox-group>
            </el-form-item>

            <el-form-item label="版本信息">
                <el-input v-model="form.ldflags" placeholder="-ldflags '-w -s'" />
            </el-form-item>

            <el-form-item label="注入变量">
                <div class="w-full">
                    <div class="flex flex-col gap-2 w-full">
                        <div v-for="(item, index) in form.envVars" :key="index" class="w-full flex justify-between gap-2">
                            <div class="w-4/5 gap-2 flex">
                                <el-input v-model="item.key" placeholder="变量名" class="w-1/5" />
                                <el-input v-model="item.value" placeholder="变量值" class="w-4/5" />
                            </div>
                            <el-button type="danger" @click="removeEnvVar(index)">移除</el-button>
                        </div>
                    </div>
                    <el-button type="primary" plain @click="addEnvVar"
                        :class="form.envVars.length > 0 ? 'mt-2' : ''">添加变量</el-button>
                </div>
            </el-form-item>

            <el-form-item label="构建标签">
                <el-input v-model="form.tags" placeholder="多个标签用逗号分隔（例如：jsoniter,debug）" />
            </el-form-item>
        </el-form>

        <template #footer>
            <div class="dialog-footer">
                <el-button @click="visible = false">取消</el-button>
                <el-button type="primary" :loading="submitting" @click="handleSubmit">
                    {{ submitting ? '编译中...' : '开始编译' }}
                </el-button>
            </div>
        </template>
    </el-dialog>
</template>

<script setup>
import { ref, reactive, toRefs } from 'vue'
import { ElMessage } from 'element-plus'
import { compileVersion } from '~/api/project/version'

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

const { visible } = toRefs(props);

const emit = defineEmits(['success', 'update:visible', 'close'])

const submitting = ref(false)
const formRef = ref(null)

const form = reactive({
    output: '',
    goos: 'linux',
    goarch: 'amd64',
    flags: [],
    ldflags: '-w -s',
    tags: '',
    envVars: [] // 初始化为空数组
})

const open = () => {
    visible.value = true
}


/**
 * 关闭弹窗
 */
const handleClose = () => {
    formRef.value?.resetFields()
    emits("update:visible", false);
    emits("close");
};

const addEnvVar = () => {
    form.envVars.push({ key: '', value: '' })
}

const removeEnvVar = (index) => {
    form.envVars.splice(index, 1)
}

const handleSubmit = async () => {
    try {
        submitting.value = true

        // 转换有效环境变量
        const envVars = form.envVars
            .filter(item => item.key && item.value)
            .reduce((acc, { key, value }) => {
                acc[key] = value
                return acc
            }, {})

        const params = {
            output: form.output,
            env: {
                GOOS: form.goos,
                GOARCH: form.goarch,
                ...envVars
            },
            flags: [...form.flags],
            ldflags: form.ldflags,
            tags: form.tags.split(',').filter(t => t.trim())
        }

        const { data } = await compileVersion(params)

        ElMessage.success(`编译成功：${data.output}`)
        emit('success', data)
        visible.value = false
    } catch (error) {
        ElMessage.error(error.message || '编译失败')
    } finally {
        submitting.value = false
    }
}

defineExpose({ open })
</script>

<style scoped>
.flex {
    display: flex;
}

.gap-2 {
    gap: 8px;
}
</style>