// src/stores/formDialog.ts
import { defineStore } from 'pinia'

export interface FormDialogOptions {
  title: string
  width?: string
  onSubmit?: (data: any) => void
  onCancel?: () => void
}

export const useFormDialog = defineStore('formDialog', {
  state: () => ({
    visible: false,
    title: '',
    width: '500px',
    onSubmit: null as ((data: any) => void) | null,
    onCancel: null as (() => void) | null
  }),

  actions: {
    open(options: FormDialogOptions) {
      this.title = options.title
      this.width = options.width || '500px'
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
