// src/stores/formDialog.ts
import { defineStore } from 'pinia'
import { Component, markRaw } from 'vue'

export interface FormDialogOptions {
  title: string
  width?: string
  component?: Component // 新增：要渲染的表单组件
  componentProps?: Record<string, any> // 新增：传递给组件的属性
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export const useFormDialog = defineStore('formDialog', {
  state: () => ({
    visible: false,
    title: '',
    width: '500px',
    component: null as Component | null, // 新增
    componentProps: {} as Record<string, any>, // 新增
    onSubmit: null as ((data: any) => void) | null,
    onCancel: null as (() => void) | null
  }),

  actions: {
    open(options: FormDialogOptions) {
      this.title = options.title
      this.width = options.width || '500px'
      // this.component = options.component || null // 设置组件
      // 使用 markRaw 包装组件
      this.component = options.component ? markRaw(options.component) : null
      this.componentProps = options.componentProps || {} // 设置组件属性
      this.onSubmit = options.onSubmit || null
      this.onCancel = options.onCancel || null
      this.visible = true
    },

    close() {
      this.visible = false
      this.onCancel?.()
    },

    handleSubmit(data: any) {
      this.onSubmit?.(data)
      this.close()
    }
  }
})
