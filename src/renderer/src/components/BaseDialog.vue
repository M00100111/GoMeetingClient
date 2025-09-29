<!-- src/components/BaseDialog.vue -->
<template>
  <Teleport to="body">
    <div
      v-if="visible"
      class="base-dialog-overlay"
      @click="handleOverlayClick"
      @keydown.esc="onEsc"
      tabindex="-1"
      ref="overlayRef"
    >
      <div class="base-dialog-container">
        <div 
          class="base-dialog" 
          ref="dialogRef"
        >
          <!-- 标题 -->
          <div class="base-dialog-header">
            <h3 class="base-dialog-title">{{ title }}</h3>
            <button
              class="base-dialog-close-btn"
              @click="closeDialog"
              aria-label="关闭"
            >
              ×
            </button>
          </div>

          <!-- 内容区 - 通过slot传递 -->
          <div class="base-dialog-content" ref="contentRef">
            <slot name="default"></slot>
          </div>

          <!-- 操作按钮区 -->
          <div class="base-dialog-footer">
            <slot
              name="footer"
              :onConfirm="handleConfirm"
              :onCancel="handleCancel"
            >
              <!-- 默认按钮 -->
              <button
                type="button"
                class="base-dialog-btn base-dialog-btn-cancel"
                @click="handleCancel"
              >
                {{ cancelText }}
              </button>
              <button
                type="button"
                class="base-dialog-btn base-dialog-btn-confirm"
                :disabled="confirmLoading"
                @click="handleConfirm"
              >
                <span v-if="confirmLoading" class="loading"></span>
                {{ confirmText }}
              </button>
            </slot>
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script lang="ts" setup>
import { defineProps, defineEmits, ref, onMounted, watch, onUnmounted, nextTick } from 'vue'

// 定义props
interface Props {
  visible: boolean
  title: string
  confirmLoading?: boolean
  confirmText?: string
  cancelText?: string
  closeOnClickModal?: boolean
  width?: string
  height?: string
}

const props = withDefaults(defineProps<Props>(), {
  title: '提示',
  confirmLoading: false,
  confirmText: '确定',
  cancelText: '取消',
  closeOnClickModal: true,
  width: undefined,
  height: 'auto'
})

// 定义事件
const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'confirm'): void
  (e: 'cancel'): void
}>()

const overlayRef = ref<HTMLElement | null>(null)
const dialogRef = ref<HTMLElement | null>(null)
const contentRef = ref<HTMLElement | null>(null)

// 监听可见性变化，当对话框显示时调整尺寸
watch(() => props.visible, (newVal) => {
  if (newVal) {
    nextTick(() => {
      adjustDialogSize()
    })
  }
})

// 调整对话框尺寸以适应内容
const adjustDialogSize = () => {
  if (!contentRef.value || !dialogRef.value) return
  
  // 获取内容区域的实际尺寸
  const contentRect = contentRef.value.getBoundingClientRect()
  
  // 计算对话框的总高度（内容高度 + 头部高度 + 底部高度）
  const headerHeight = dialogRef.value.querySelector('.base-dialog-header')?.getBoundingClientRect().height || 0
  const footerHeight = dialogRef.value.querySelector('.base-dialog-footer')?.getBoundingClientRect().height || 0
  
  const totalHeight = contentRect.height + headerHeight + footerHeight
  
  // 设置对话框高度
  dialogRef.value.style.height = `${totalHeight}px`
  
  // 设置对话框宽度
  const contentWidth = contentRect.width
  dialogRef.value.style.width = `${contentWidth}px`
}

// 监听窗口大小变化
const handleResize = () => {
  if (props.visible) {
    adjustDialogSize()
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  
  // 确保 DOM 完全渲染后再调整尺寸
  if (props.visible) {
    nextTick(() => {
      adjustDialogSize()
    })
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})

const closeDialog = () => {
  emit('update:visible', false)
}

const handleOverlayClick = (e: MouseEvent) => {
  if (!props.closeOnClickModal) return
  if (e.target === overlayRef.value) {
    closeDialog()
    emit('cancel')
  }
}

const onEsc = () => {
  closeDialog()
  emit('cancel')
}

const handleCancel = () => {
  closeDialog()
  emit('cancel')
}

const handleConfirm = () => {
  emit('confirm')
}

onMounted(() => {
  if (props.visible && overlayRef.value) {
    overlayRef.value.focus()
  }
})
</script>

<style scoped>
.base-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.base-dialog-container {
  background-color: white;
  position: relative;
  width: auto;
  margin: 0 auto;
}

.base-dialog {
  /* background-color: red; */
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  overflow: hidden;
  position: relative;
  margin: 0 auto;
  box-sizing: border-box;
  transition: height 0.2s;
  display: flex;
  flex-direction: column;
}

.base-dialog-header {
  padding: 5px;
  border-bottom: 1px solid #eee;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-shrink: 0;
}

.base-dialog-title {
  /* background-color: blue; */
  margin: 0;
  margin-left: 10px;
  font-size: 1.0rem;
}

.base-dialog-close-btn {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  color: #999;
  transition: color 0.2s;
  -webkit-app-region: no-drag;
}

.base-dialog-close-btn:hover {
  color: #333;
}

.base-dialog-content {
  padding: 15px;
  word-break: break-word;
  box-sizing: border-box;
  flex: 1;
  overflow: auto;
  display: flex;
  justify-content:center;
  align-items: center;
}

.base-dialog-footer {
  padding: 5px;
  border-top: 1px solid #eee;
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  flex-shrink: 0;
}

.base-dialog-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s;
  -webkit-app-region: no-drag;
}

.base-dialog-btn-cancel {
  background: #f0f0f0;
  color: #333;
}

.base-dialog-btn-confirm {
  background: #007bff;
  color: white;
}

.base-dialog-btn-confirm:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.loading {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #fff;
  border-top: 2px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>