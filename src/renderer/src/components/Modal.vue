<template>
  <div class="Modal">
    <!-- 将一个组件内部的一部分模板“传送”到该组件的 DOM 结构外层的位置去 -->
    <Teleport to="body">
      <div class="modal" v-show="modal.show">
        <div class="Title" :class="colorClass">
          {{modal.title}}
        </div>
        <div class="contentContainer" >
          <div class="content" :class="colorClass">
            {{modal.content}}
          </div>
        </div>      
        <button class="button" :class="colorClass" v-if="modal.type == ModalType.notice" @click="confirm(ModalResult.undefined)">OK</button>
        <div class="Confirm" v-else>
          <button class="button confirm" :class="colorClass" @click="confirm(ModalResult.confirm)">Confirm</button>
          <button class="button" :class="colorClass" @click="confirm(ModalResult.cancel)">Cancel</button>
        </div>
      </div>
      <div class="hidebg" v-if="modal.show && modal.type != ModalType.notice"></div>
    </Teleport>    
  </div>
</template>

<script setup lang="ts" name="Modal">
import { watch, computed } from 'vue';
import { reactive } from 'vue';
import { storeToRefs } from 'pinia';
import { ModalResult, ModalType, useModalStore } from '@/store/modal';
const modalStore = useModalStore();
const { modal } = storeToRefs(modalStore);

const isNoticeOrConfirm = computed(() => modal.value.type == ModalType.confirm || modal.value.type == ModalType.notice);
const isWarning = computed(() => modal.value.type == ModalType.warning);
const colorClass = reactive({
  noticeOrConfirm: isNoticeOrConfirm,
  warningModal: isWarning,
})

// notice通知之间的时间间隔
let noticeTag:number

//通知类弹窗定时关闭
const closeNotice = watch(modal.value, (newValue) => {    
  if (newValue.show == true && newValue.type == ModalType.notice) {
    noticeTag = Date.now();
    setTimeout(() => {
      if (newValue.show == true && newValue.type == ModalType.notice && Date.now()-noticeTag >= modal.value.timeOut) {
          modal.value.show = false;          
        }
      }, modal.value.timeOut);      
    }  
})
// 手动关闭弹窗
function confirm(result: ModalResult) {
  modalStore.CloseModal(result);  
}
</script>

<style scoped>
  /* css here */
  .modal {
    z-index: 100;
    height: 180px;
    width: 450px;    
    background-color: #FFFFFF;
    box-shadow: rgba(99, 99, 99, 0.2) 0px 2px 8px 0px;
    border-radius:20px;
    position: absolute;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    text-align: center;  
  }
  .modal .Title {
    cursor: default;
    font-weight: bold;
    letter-spacing: 2px;
    font-family: "得意黑";
    font-size: 30px;
    margin-top: 20px;
    margin-right: 60%;
    margin-bottom: 10px;
  }
  @font-face {
    font-family: "得意黑";
    src: url('src/assets/SmileySans-Oblique.otf');
  }
  .modal .contentContainer {
    width: 80%;
    height: 34%;        
    margin: 0 auto; 
    text-align: center;    
    position: relative;
  }
  .modal .contentContainer .content{
    width: 100%;
    font-size: 20px;
    font-family:'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-weight: bold;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);     
    cursor: default;   
  }
  .button{
    width: 100px;
    height: 30px;    
    border: none;
    margin-top: 5px;
    font-weight: bold;
    background-color: transparent;
    cursor: pointer;
  }
  .noticeOrConfirm{
    color: #66376D;
  }
  .warningModal{
    color: #C34465;
  }
  .button:hover{
      text-decoration: underline;
      text-decoration-style:dashed;
  }
  .confirm{
    margin-right: 100px;
  }
  /* 设置隐藏背景样式 */
  .hidebg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 99;
  }
</style>