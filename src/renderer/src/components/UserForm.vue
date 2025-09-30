<!-- src/components/StartMeetingForm.vue -->
<template>
  <div class="user-form">
    <div class="form-group">
      <label>姓名：</label>
      <input 
        v-model="formData.name" 
        class="form-input" 
        required 
        placeholder="请输入姓名"
      />
    </div>
    <div class="form-group">
      <label>邮箱：</label>
      <input 
        v-model="formData.email" 
        type="email" 
        class="form-input" 
        required 
        placeholder="请输入邮箱"
      />
    </div>
    <div class="form-group">
      <label>年龄：</label>
      <input 
        v-model.number="formData.age" 
        type="number" 
        class="form-input" 
        placeholder="请输入年龄"
      />
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, defineExpose } from 'vue'

const formData = ref({
  name: '',
  email: '',
  age: 0
})

// 暴露获取表单数据的方法
defineExpose({
  getFormData: () => ({
    name: formData.value.name,
    email: formData.value.email,
    age: formData.value.age
  })
})
</script>

<style scoped>
.user-form {
  /* padding: 16px; */
  /* background-color: red; */
  width: 400px; /* 确保表单填满对话框内容区域 */
  /* background-color: green; */
  /* height: 150px;
  display: flex;
  flex-direction:column;
  justify-content:center;
  align-items:center; */
}

.form-group {
  margin-bottom: 10px;
  display: flex;
  justify-content:center;
  align-items:center;
}
/* 移除最后一个表单项的底部边距 */
.form-group:last-child {
  margin-bottom: 0;
}
.form-group label {
  font-weight: 500;
  color: #333;
}

.form-input {
  width: 80%; /* 改为100%填充可用空间 */
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  -webkit-app-region: no-drag;
  transition: border-color 0.2s;
  box-sizing: border-box;
}

.form-input:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.25);
}

.form-input:required:invalid {
  border-color: #ff4757;
}

.form-input:required:valid {
  border-color: #2ed573;
}
</style>