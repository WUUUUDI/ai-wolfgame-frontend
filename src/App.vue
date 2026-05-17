<script setup>
import { ref, provide } from 'vue'
import Header from './components/Header.vue'
import LoginModal from './components/LoginModal.vue'

const showLoginModal = ref(false)
const loginMode = ref('login')
const reloadKey = ref(0)

const openLoginModal = (mode = 'login') => {
  loginMode.value = mode
  showLoginModal.value = true
}

const closeLoginModal = () => {
  showLoginModal.value = false
}

const handleLoginSuccess = () => {
  showLoginModal.value = false
  reloadKey.value++
}

provide('reloadKey', reloadKey)
</script>

<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
    
    <LoginModal
      :visible="showLoginModal"
      :initial-mode="loginMode"
      @close="closeLoginModal"
      @success="handleLoginSuccess"
    />
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>