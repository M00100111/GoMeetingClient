<template>
  <div class="login-sign-page">
    <div class="page-container">
      <div class="login-in" :class="{ loginIn: !status, toSignUp: status }">
        <div class="login-form">
          <span class="deyihei login-title">Login</span><br>
          <form @submit.prevent="handleLogin">
            <input type="text" class="input" name="username" placeholder="Username" v-model="LoginForm.username" required><br>
            <input type="password" class="input" name="password" placeholder="Password" v-model="LoginForm.password" required><br>
            <span class="forget-password" @click="openForget">Forget Your Password?</span><br>
            <button type="submit" class="button login-button">Login In</button>
          </form>
        </div> 
        <div class="to-sign-up" >
          <span class="deyihei to-sign-up-title">Welcome Back!</span><br>
          <span class="to-sign-up-content">Don't have an account? Register to log in!</span><br>
          <button class="button to-sign-up-botton" @click="changeStatus">To Sign Up</button>               
        </div>
      </div>
      <div class="sign-up" :class="{ signUp: status, toLoginIn: !status }">
        <div class="to-login">
          <span class="deyihei to-sign-up-title">Welcome!</span><br>
          <span class="to-sign-up-content">Already have an account? Click here to log in!</span><br>
          <button class="button to-login-in-botton" @click="changeStatus">To Login In</button>
        </div>            
        <div class="sign-up-form">
          <span class="deyihei sign-up-title">Create Account</span><br>
          <form @submit.prevent="handleSignUp">
            <input type="text" class="input" name="email" placeholder="Email" v-model="SignUpform.email" required><br>
            <input type="text" class="input" name="username" placeholder="Username" v-model="SignUpform.username" required><br>
            <input type="password" class="input" name="password" placeholder="Password" v-model="SignUpform.password" required><br>
            <input type="password" class="input" name="password-again" placeholder="Confirm Your Password" v-model="SignUpform.confirmPassword" required><br>            
            <button type="submit" class="button sign-up-button">Sign Up</button>
          </form>
        </div> 
      </div>
      <div class="block" :class="{ blockToLogin: !status&&noF, blockToSignUp: status&&noF,blockFirst: !noF }"></div>   
    </div>       
  </div>
</template>

<script setup lang="ts" name="LoginAndRegister">
import { ref } from 'vue';
import { useRouter } from 'vue-router'
import api from "@/api/api"
import { useModalStore, useUserInfoStore } from "@/store"

const router = useRouter()
const modal = useModalStore()
const userInfoStore = useUserInfoStore()

const status = ref(false)
// 标识是否是出现动画
const noF = ref(false)

function changeStatus() {
  status.value == true ? status.value = false : status.value = true
  noF.value = true
}

//登录表单数据
const LoginForm = ref({
  username: '',
  password: '',
})

//登录验证
async function handleLogin() {
  //获取用户填写的数据
  const { username, password } = LoginForm.value
  // 二次验证用户是否未填写数据
  if (!username || !password) {
    modal.Notice("请输入账号和密码")
    return
  }
  //定义登录函数
  const doLogin = async () => {
    //调用登录接口
    const response = await api.login({username,password})
    //将用户基本信息保存到pinia
    userInfoStore.setUserInfo(response.data)
    //将token保存到pinia
    userInfoStore.setToken(response.data.token)
    //清空表单数据
    LoginForm.value = { username: '', password: '' }
    modal.Notice("Welcome back!")    
    router.replace({path:'/home'})
  }
  // 调用登录函数 
  doLogin()
  userInfoStore.setLoginStatus(true)
}

//注册表单数据
const SignUpform = ref({
  email:'',
  username: '',
  password: '',
  confirmPassword: '',
})

function handleSignUp() {
  //获取用户填写的数据
  const { username, password, confirmPassword } = SignUpform.value
  //二次验证
  if (!username || !password || !confirmPassword) {
    modal.Notice("请输入账号和密码")
    return
  }
  if (password != confirmPassword) {
    modal.Notice("俩次输入的密码不一致")
  }
  //定义注册函数
  const doRegister = async () => {
    await api.signUp(SignUpform.value)
    modal.Notice("注册成功")
    SignUpform.value = { email:'',username: '', password: '', confirmPassword: ''};
    LoginForm.value = {username: username, password: password}
    changeStatus()
  }
  //立即调用注册函数
  doRegister()
}

// TODO:忘记密码
function openForget() {
  modal.Notice("暂不支持找回密码")
}
</script>

<style scoped>
  /* css here */
  /* .login-sign-page {
    display: inline-block;
    width: 100vw;
    height: 100vh;
    min-width: 800px;
    min-height: 500px;
    background-image: linear-gradient(to top, #e6e9f0 0%, #eef1f5 100%);
    position: relative;  
  } */

  /* 在现有样式基础上添加可拖拽样式 */
  /* .login-sign-page::before {
    content: '';
    -webkit-app-region: drag;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 30px;
    z-index: 10;
    background: transparent;
  } */
  /* 确保按钮等交互元素不被拖拽影响 */
  .button, .input, .forget-password {
    -webkit-app-region: no-drag;
  }

  .page-container{    
    -webkit-app-region: drag; /* 整个容器可拖拽 */
    height: 500px;
    width: 800px;    
    margin:auto;
    position: absolute;
    z-index: 1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    border-radius:30px;
    background-color: #fff;
    box-shadow: rgba(0, 0, 0, 0.35) 0px 5px 15px;
    overflow: hidden;
  }

  .input {
    width: 60%;
    height: 30px;
    margin: 10px 0 10px 0;
    border:none;
    outline: none;
    background-color: transparent;
    border-bottom: 2px solid rgb(0, 86,145);
    text-align: center;
    color: rgb(0, 86,145);
  }
  input::-webkit-input-placeholder { 
  /* WebKit browsers，webkit内核浏览器 */
    color: rgb(0, 86,145); 
  } 
  .input:focus::-webkit-input-placeholder {    
    color: transparent;    
  }

  .button {
    margin-top: 20px;
    width: 30%;
    height: 40px;
    border-radius: 5px;
    font-size: 20px;
    font-weight: bold;  
    cursor: pointer;  
  }
  .deyihei {
    font-family: "得意黑";
    font-size: 40px;   
    font-weight: bold;
  }
  @font-face {
    font-family: "得意黑";
    src: url('src/assets/font/SmileySans-Oblique.ttf.woff2');
  }

  .login-in {    
    width: 800px;
    height: 500px; 
  }
  .login-in::after {
    content:'';
    display:block;
    clear: both;
  }  
  .login-form{
    /* float: left; */
    float: right;
    width: 50%;
    text-align: center;
    margin-top: 17%;
  }
  .to-sign-up{
    /* float: right; */
    float: left;
    width: 50%;
    text-align: center;
    margin-top: 22%;
  }
  .login-title {
    letter-spacing: 2px;
    color: rgb(0, 86,145);
    display: inline-block;
    margin-bottom: 10px;
    cursor: default;
  }
  .forget-password {
    color: rgb(0, 86,145);
    font-size: 15px;
    display: inline-block;
    margin-top: 5px;
    cursor: pointer;    
    user-select: none;
  }
  .forget-password:hover{
      text-decoration: underline;
      text-decoration-style:dashed;
  }
  .login-button {
    background-color: rgb(0, 86,145);
    color: #fff;
    border:none;
  }
  .to-sign-up-title {
    color: white;
    display: inline-block;
    margin-bottom: 10px;
    cursor: default;
  }
  .to-sign-up-content {
    color: white;
    cursor: default;
  }
  .to-sign-up-botton {
    color:white;
    background-color:transparent;
    border-width:2px;
    border-color: #fff;
    border-style: solid;
    width: 40%;
  }

  .block {
    width: 50%;
    height: 100%;
    border:none;
    /* background-image: linear-gradient(10deg,#67376D,#4B346E);          */
    background-image: linear-gradient(10deg,#005691,#004A7C);         
    position:absolute;
    top:0;
    left: -50%;
    /* right: 0; */
    z-index: -1;    
    border-top-left-radius: 20px; 
    border-bottom-left-radius: 20px; 
    border-top-right-radius:100px;    
    border-bottom-right-radius:100px;
  }
  .blockFirst {
    /* animation: FirstGoRight 0.5s;     */
    animation: FirstGoLeft 0.5s forwards;    
  }
  @keyframes FirstGoRight {
    0% {
      transform: translateX(100%);
    }
    100% {
      transform: translateX(0%);      
    }
  }
  @keyframes FirstGoLeft {
    0% {
      left: -50%;
    }
    100% {
      left: 0;        
    }
  }
  .blockToLogin {
    animation: ToLeft 0.5s;
    /* animation: ToRight 0.5s; */
    animation-fill-mode: forwards;    
  }
  .blockToSignUp {
    /* animation: ToLeft 0.5s; */
    animation: ToRight 0.5s;
    animation-fill-mode: forwards;    
  }
  @keyframes ToRight {
    0% {
      left: 0%;
      border-top-right-radius: 100px; 
      border-bottom-right-radius: 100px; 
      border-top-left-radius:20px;    
      border-bottom-left-radius:20px;
    }
    100% {
      left: 50%;
      border-top-left-radius: 100px; 
      border-bottom-left-radius: 100px; 
      border-top-right-radius:20px;    
      border-bottom-right-radius:20px;
    }
  }
  @keyframes ToLeft {
    0% {
      left: 50%;
      border-top-left-radius: 100px; 
      border-bottom-left-radius: 100px; 
      border-top-right-radius:20px;    
      border-bottom-right-radius:20px;
    }
    100% {
      left: 0;
      border-top-right-radius: 100px; 
      border-bottom-right-radius: 100px; 
      border-top-left-radius:20px;    
      border-bottom-left-radius:20px;
    }
  }

  .sign-up {
    width: 800px;
    height: 500px;
  }
  .sign-up::after {
    content:'';
    display:block;
    clear: both;
  }  
  .sign-up-form{
    float: left;
    width: 50%;
    text-align: center;
    margin-top: 10%;
  }
  .to-login{
    float: right;
    width: 50%;
    text-align: center;
    margin-top: 22%;
  }
  .sign-up-title {
    color: rgb(0, 86,145);
    display: inline-block;
    margin-bottom: 10px;
    cursor: default;
  }
  .sign-up-button {
    background-color: rgb(0, 86,145);
    color: #fff;
    border:none;
  }
  .to-sign-up-title {
    color: white;
    display: inline-block;
    margin-bottom: 10px;
  }
  .to-sign-up-content {
    color: white;
  }
  .to-login-in-botton {
    width: 40%;
    color:#fff;
    background-color: transparent;
    border-width:2px;
    border-color: #fff;
    border-style: solid;
  }
  
  /* 切换界面动画 */
  .loginIn {    
    animation: fadeIn 0.5s;
    animation-timing-function:linear;
  }
  .toSignUp{
    animation: fadeOut 0.3s 0.2s;
    animation-timing-function:linear;
    animation-fill-mode: forwards;
  }
  .signUp {    
    animation: fadeIn 0.5s 0.5s;    
    animation-timing-function:linear;
    animation-fill-mode: forwards;
  }
  .toLoginIn{
    animation: fadeOut 0.3s 0.5s;
    animation-timing-function:linear;
    animation-fill-mode: forwards;
  }
  /* 出现动画 */
  @keyframes fadeIn {
    from {
      opacity: 0;
      visibility: hidden;      
    }
    to {
      opacity: 1;
      visibility: visible;
      display: block;
    }
  }
  /* 消失动画 */
  @keyframes fadeOut {
  from {
    opacity: 1;
    visibility: visible;
  }
  to {
    opacity: 0;
    visibility: hidden;
    display: none;
  }
}
</style>
