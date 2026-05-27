<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'

interface Props {
  content: string
}

const props = defineProps<Props>()

const useMpHtml = ref(false)

onMounted(() => {
  try {
    const mpHtmlComponent = require.resolve('mp-html')
    if (mpHtmlComponent) {
      useMpHtml.value = true
    }
  } catch {
    useMpHtml.value = false
  }
})
</script>

<template>
  <view class="rich-content">
    <mp-html
      v-if="useMpHtml"
      :content="content"
      :lazy-load="true"
      :selectable="true"
    />
    <rich-text
      v-else
      :nodes="content"
    />
  </view>
</template>

<style lang="scss" scoped>
.rich-content {
  font-size: 28rpx;
  color: #666;
  line-height: 1.8;
  word-break: break-all;
  overflow: hidden;
}
</style>
