<template>
  <div class="startmeetingform">
    <div class="form-group">
      <label class="form-label">会议ID：</label>
        <select 
          v-model="formData.meetingId" 
          class="form-input"
          required
        >
          <option 
            v-for="id in meetingIDList" 
            :key="id" 
            :value="id"
          >
            {{ id }}
          </option>
        </select>
    </div>
    <div class="form-group">
      <label class="form-label">会议名称：</label>
      <input 
        v-model="formData.meetingName" 
        class="form-input" 
        required 
        placeholder="请输入会议名称"
      />
    </div>
    <div class="form-group">
      <label class="form-label">加入方式：</label>
      <div class="radio-group">
        <div class="radio-item">
          <button 
            class="radio-button radio-button-left" 
            :class="{ 'radio-button-active': formData.joinType == 0 }"
            @click="formData.joinType = 0">
            开放加入
          </button>
        </div>
        <div class="radio-item">
          <button 
            class="radio-button radio-button-right"
            :class="{ 'radio-button-active': formData.joinType == 1 }"
            @click="formData.joinType = 1">
            需要密码
          </button>
        </div>
      </div>
    </div>
    <div class="form-group" v-if="formData.joinType == 1">
      <label class="form-label">入会密码：</label>
      <input 
        v-model="formData.password" 
        class="form-input" 
        required 
        placeholder="请输入5位会议密码"
      />
    </div>
  </div>
</template>

<script setup lang="ts" name="StartMeetingForm">
import { ref, defineExpose, onMounted, computed } from 'vue'
import { useUserInfoStore } from "@/store"
const userInfoStore = useUserInfoStore()
const formData = ref({
  meetingId: 0,
  meetingName: '',
  joinType: 0,
  password: '',
})
// 暴露获取表单数据的方法
defineExpose({
  getFormData: () => ({
    meetingId: formData.value.meetingId,
    meetingName: formData.value.meetingName,
    joinType: formData.value.joinType,
    password: formData.value.password
  })
})
const meetingIDList = ref<number[]>([])
onMounted(() => {
  const userId = Number(userInfoStore.userId)
  formData.value.meetingId = userId
  formData.value.meetingName = userInfoStore.username+'的会议'
  formData.value.joinType = 0 // 设置加入方式的初始值为"开放加入"
  // 将userId添加到meetingIDList中
  meetingIDList.value.push(userId)
  // 设置默认选中第一个元素
  // if (meetingIDList.value.length > 0) {
  //   formData.value.meetingId = meetingIDList.value[0]
  // }
})

// 计算属性：校验表单是否有效
// const isFormValid = computed(() => {
//   // 校验会议ID是否为12位数字
//   const meetingIdStr = formData.value.meetingId.toString();
//   if (meetingIdStr.length !== 12 || !/^\d+$/.test(meetingIdStr)) {
//     return false;
//   }
  
//   // 如果需要密码，校验密码是否为5位
//   if (formData.value.joinType === 1) {
//     return formData.value.password && /^\d{5}$/.test(formData.value.password);
//   }
  
//   return true;
// })
</script>

<style scoped>
.startmeetingform{
  /* background-color: red; */
  height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content:center;
}
.form-group {
  /* background-color: blue; */
  width: 100%;
  margin-bottom: 10px;
  display: flex;
  justify-content:center;
  align-items:center;
}
/* 移除最后一个表单项的底部边距 */
.form-group:last-child {
  margin-bottom: 0;
}
.form-label {
  width: 90px;
  text-align: right;
  /* background-color: red; */
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
.radio-group{
  /* background-color: green; */
  width: 80%; /* 改为100%填充可用空间 */
  /* padding: 10px 0px; */
  height: 40px;
  box-sizing: border-box; /* 添加这行 */
  display: flex;
  justify-content:space-between;
}
.radio-item{
  display: flex;
  /* background-color: blue; */
  height: 100%;
  width: 50%;
}
.radio-button{
  height: 100%;
  width: 100%;
  border: 1px solid #ddd;
  -webkit-app-region: no-drag;
  cursor: pointer;
}
.radio-button-active {
  background-color: #007bff;
  color: white;
  border-color: #007bff;
}
.radio-button-left{
  border-top-left-radius: 6px;
  border-bottom-left-radius: 6px;
}
.radio-button-right{
  border-top-right-radius: 6px;
  border-bottom-right-radius: 6px;
}
</style>