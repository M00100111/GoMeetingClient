<template>
  <div class="joinmeetingform">
    <div class="form-group">
      <label class="form-label">会议ID：</label>
      <input 
        v-model="formData.meetingId" 
        class="form-input" 
        required 
        placeholder="请输入会议id"
      />
        <!-- <select 
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
        </select> -->
    </div>
    <div class="form-group">
      <label class="form-label">入会密码：</label>
      <input 
        v-model="formData.password" 
        class="form-input" 
        placeholder="请输入5位会议密码,如需要"
      />
    </div>

        <!-- 添加设备状态选择 -->
    <div class="form-group">
      <label class="form-label">麦克风：</label>
      <div class="radio-group">
        <div class="radio-item">
          <div 
            class="radio-button radio-button-left"
            :class="{ 'radio-button-active': formData.micStatus === 1 }"
            @click="formData.micStatus = 1"
          >
            开启
          </div>
        </div>
        <div class="radio-item">
          <div 
            class="radio-button radio-button-right"
            :class="{ 'radio-button-active': formData.micStatus === 0 }"
            @click="formData.micStatus = 0"
          >
            关闭
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">摄像头：</label>
      <div class="radio-group">
        <div class="radio-item">
          <div 
            class="radio-button radio-button-left"
            :class="{ 'radio-button-active': formData.cameraStatus === 1 }"
            @click="formData.cameraStatus = 1"
          >
            开启
          </div>
        </div>
        <div class="radio-item">
          <div 
            class="radio-button radio-button-right"
            :class="{ 'radio-button-active': formData.cameraStatus === 0 }"
            @click="formData.cameraStatus = 0"
          >
            关闭
          </div>
        </div>
      </div>
    </div>
    
    <div class="form-group">
      <label class="form-label">屏幕共享：</label>
      <div class="radio-group">
        <div class="radio-item">
          <div 
            class="radio-button radio-button-left"
            :class="{ 'radio-button-active': formData.screenStatus === 1 }"
            @click="formData.screenStatus = 1"
          >
            开启
          </div>
        </div>
        <div class="radio-item">
          <div 
            class="radio-button radio-button-right"
            :class="{ 'radio-button-active': formData.screenStatus === 0 }"
            @click="formData.screenStatus = 0"
          >
            关闭
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup lang="ts" name="JoinMeetingForm">
import { ref, defineExpose, onMounted } from 'vue'
import { useUserInfoStore } from "@/store"
const userInfoStore = useUserInfoStore()
const formData = ref({
  meetingId: '',
  password: '',
  micStatus: 0,
  cameraStatus: 0,
  screenStatus: 0
})
// 暴露获取表单数据的方法
defineExpose({
  getFormData: () => ({
    meetingId: Number(formData.value.meetingId) || 0,
    password: formData.value.password,
    micStatus: formData.value.micStatus,
    cameraStatus: formData.value.cameraStatus,
    screenStatus: formData.value.screenStatus
  })
})
// const meetingIDList = ref<number[]>([])
onMounted(() => {
  // const userId = Number(userInfoStore.userId)
  // formData.value.meetingId = userId
  formData.value.micStatus = userInfoStore.userInfo.micStatus ? 1 : 0
  formData.value.cameraStatus = userInfoStore.userInfo.cameraStatus ? 1 : 0
  formData.value.screenStatus = userInfoStore.userInfo.screenStatus ? 1 : 0

  // 将userId添加到meetingIDList中
  // meetingIDList.value.push(userId)
  // 设置默认选中第一个元素
  // if (meetingIDList.value.length > 0) {
  //   formData.value.meetingId = meetingIDList.value[0]
  // }
})
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
  display: flex;
  justify-content: center;
  align-items: center;
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