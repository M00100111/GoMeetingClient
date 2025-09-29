// src/stores/confirmDialog.ts
import { defineStore } from 'pinia'

export interface ConfirmDialogOptions {
  title: string
  content?: string
  confirmText?: string
  cancelText?: string
  onConfirm?: () => void
  onCancel?: () => void
}

export const useConfirmDialog = defineStore('confirmDialog', {
  state: () => ({
    visible: false,
    title: '提示',
    content: '',
    confirmText: '确定',
    cancelText: '取消',
    onConfirm: null as (() => void) | null,
    onCancel: null as (() => void) | null
  }),

  actions: {
    open(options: ConfirmDialogOptions) {
      this.title = options.title
      this.content = options.content || ''
      this.confirmText = options.confirmText || '确定'
      this.cancelText = options.cancelText || '取消'
      this.onConfirm = options.onConfirm || null
      this.onCancel = options.onCancel || null
      this.visible = true
    },

    close() {
      this.visible = false
      this.onCancel?.()
    },

    handleConfirm() {
      this.onConfirm?.()
      this.close()
    },

    handleCancel() {
      this.onCancel?.()
      this.close()
    }
  }
})
