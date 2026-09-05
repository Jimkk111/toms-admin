<template>
  <div class="upload-item">
    <n-upload
      :action="uploadAction"
      :accept="type"
      :show-file-list="false"
      @before-upload="beforeUpload"
      @finish="onFinish"
      @error="handleError"
    >
      <div class="upload-box">
        <img
          v-if="imageUrl"
          :src="imageUrl"
          class="avatar"
        />
        <div
          v-else
          class="uploader-icon"
        >
          <img
            src="@/assets/icons/icon_upload@2x.png"
            alt=""
          />
          <span>上传图片</span>
        </div>

        <div
          v-if="imageUrl"
          class="upload-actions"
          @click.stop
        >
          <span
            class="upload-span"
            @click.stop="removeImg"
          >
            删除图片
          </span>
          <span class="upload-span">重新上传</span>
        </div>
      </div>
    </n-upload>
    <p class="upload-tips">
      <slot />
    </p>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { UploadFileInfo } from 'naive-ui'
import { message } from '@/utils/feedback'

const props = withDefaults(
  defineProps<{
    type?: string
    size?: number
    propImageUrl?: string
  }>(),
  { type: '.jpg,.jpeg,.png', size: 2, propImageUrl: '' },
)

const emit = defineEmits<{ imageChange: [url: string] }>()

const uploadAction = `${import.meta.env.VITE_BASE_API}/common/upload`

const imageUrl = ref('')

watch(
  () => props.propImageUrl,
  (val) => {
    imageUrl.value = val
  },
)

const beforeUpload = async ({ file }: { file: Required<UploadFileInfo>; fileList: Required<UploadFileInfo>[] }) => {
  const raw = file.file
  if (!raw) return false
  if (raw.size / 1024 / 1024 >= props.size) {
    message.error(`上传文件大小不能超过${props.size}M!`)
    return false
  }
  return true
}

const onFinish = ({ file }: { file: UploadFileInfo; event?: unknown }) => {
  // 后端返回 { code, msg, data: 图片地址 }；naive 类型未声明 response，这里断言
  const response = (file as unknown as { response?: { code?: number; data?: string } }).response
  if (response?.data) {
    imageUrl.value = String(response.data)
    emit('imageChange', imageUrl.value)
  } else {
    message.error('图片上传失败')
  }
}

const handleError = () => {
  message.error('图片上传失败')
}

const removeImg = () => {
  imageUrl.value = ''
  emit('imageChange', '')
}
</script>

<style lang="scss" scoped>
.upload-item {
  display: flex;
  align-items: center;

  .n-upload {
    width: 178px;
  }
}

.upload-box {
  position: relative;
  width: 178px;
  height: 178px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  background: #fcfcfc;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  overflow: hidden;

  .avatar {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .uploader-icon {
    display: flex;
    flex-direction: column;
    align-items: center;
    font-size: 12px;
    color: #333;

    img {
      width: 32px;
      height: 32px;
      margin-bottom: 8px;
    }
  }

  .upload-actions {
    position: absolute;
    inset: 0;
    display: none;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    background: rgba(0, 0, 0, 0.4);
    color: #fff;
    font-size: 14px;
    line-height: 28px;
  }

  &:hover .upload-actions {
    display: flex;
  }
}

.upload-tips {
  font-size: 12px;
  color: #666666;
  display: inline-block;
  line-height: 17px;
  margin-left: 36px;
}
</style>
