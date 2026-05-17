<template>
  <div v-if="visible" class="modal-overlay" @click.self="closeModal">
    <div class="modal-container">
      <div class="modal-header">
        <div class="modal-title">{{ isLogin ? '登录' : '注册' }}</div>
        <button class="close-btn" @click="closeModal">✕</button>
      </div>
      <div class="modal-body">
        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label class="form-label">用户名</label>
            <input
              v-model="form.username"
              type="text"
              class="form-input"
              :placeholder="isLogin ? '请输入用户名' : '请输入用户名（5-12位）'"
              :class="{ error: errors.username }"
            />
            <span v-if="errors.username" class="error-message">{{ errors.username }}</span>
          </div>
          <div v-if="!isLogin" class="form-group">
            <label class="form-label">邮箱</label>
            <input
              v-model="form.email"
              type="email"
              class="form-input"
              placeholder="请输入邮箱"
              :class="{ error: errors.email }"
            />
            <span v-if="errors.email" class="error-message">{{ errors.email }}</span>
          </div>
          <div class="form-group">
            <label class="form-label">密码</label>
            <input
              v-model="form.password"
              type="password"
              class="form-input"
              placeholder="请输入密码（6-12位）"
              :class="{ error: errors.password }"
            />
            <span v-if="errors.password" class="error-message">{{ errors.password }}</span>
          </div>
          <div v-if="!isLogin" class="form-group">
            <label class="form-label">确认密码</label>
            <input
              v-model="form.confirmPassword"
              type="password"
              class="form-input"
              placeholder="请再次输入密码"
              :class="{ error: errors.confirmPassword }"
            />
            <span v-if="errors.confirmPassword" class="error-message">{{ errors.confirmPassword }}</span>
          </div>
          <button type="submit" class="submit-btn" :disabled="loading">
            <span v-if="loading" class="loading">⏳</span>
            {{ loading ? (isLogin ? '登录中...' : '注册中...') : (isLogin ? '登录' : '注册') }}
          </button>
        </form>
        <div class="switch-link">
          <span>{{ isLogin ? '还没有账号？' : '已有账号？' }}</span>
          <button class="switch-btn" @click="switchMode">{{ isLogin ? '立即注册' : '立即登录' }}</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, watch } from 'vue'
import { authApi } from '../services/api'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  initialMode: {
    type: String,
    default: 'login'
  }
})

const emit = defineEmits(['close', 'success'])

const isLogin = ref(props.initialMode === 'login')
const loading = ref(false)
const form = reactive({
  username: '',
  email: '',
  password: '',
  confirmPassword: ''
})
const errors = reactive({})

watch(() => props.initialMode, (newVal) => {
  isLogin.value = newVal === 'login'
  resetForm()
})

const closeModal = () => {
  emit('close')
  resetForm()
}

const resetForm = () => {
  form.username = ''
  form.email = ''
  form.password = ''
  form.confirmPassword = ''
  Object.keys(errors).forEach(key => delete errors[key])
}

const switchMode = () => {
  isLogin.value = !isLogin.value
  resetForm()
}

const validateForm = () => {
  Object.keys(errors).forEach(key => delete errors[key])
  
  if (!form.username) {
    errors.username = '请输入用户名'
  } else if (!isLogin.value && (form.username.length < 5 || form.username.length > 12)) {
    errors.username = '用户名长度需在5-12位之间'
  }
  
  if (!isLogin.value) {
    if (!form.email) {
      errors.email = '请输入邮箱'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      errors.email = '请输入有效的邮箱地址'
    }
  }
  
  if (!form.password) {
    errors.password = '请输入密码'
  } else if (form.password.length < 6 || form.password.length > 12) {
    errors.password = '密码长度需在6-12位之间'
  }
  
  if (!isLogin.value && form.password !== form.confirmPassword) {
    errors.confirmPassword = '两次输入的密码不一致'
  }
  
  return Object.keys(errors).length === 0
}

const handleSubmit = async () => {
  if (!validateForm()) return
  
  loading.value = true
  
  try {
    let response
    if (isLogin.value) {
      response = await authApi.login(form.username, form.password)
    } else {
      response = await authApi.register(form.username, form.password, form.email)
    }
    
    if (response.data && response.data.access_token) {
      localStorage.setItem('access_token', response.data.access_token)
      if (response.data.refresh_token) {
        localStorage.setItem('refresh_token', response.data.refresh_token)
      }
      emit('success', response)
      closeModal()
    }
  } catch (error) {
    if (error.message) {
      errors.username = error.message
    } else {
      errors.username = '网络错误，请稍后重试'
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 1rem;
}

.modal-container {
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-radius: 12px;
  width: 100%;
  max-width: 400px;
  border: 3px solid #4a3f8a;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.2rem 1.5rem;
  border-bottom: 2px solid #4a3f8a;
}

.modal-title {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 900;
  font-family: 'Press Start 2P', monospace, sans-serif;
}

.close-btn {
  background: none;
  border: none;
  color: #888;
  font-size: 1.2rem;
  cursor: pointer;
  padding: 0.5rem;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: #fff;
}

.modal-body {
  padding: 1.5rem;
}

.form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  color: #c9c9ff;
  font-size: 0.8rem;
  font-weight: 800;
  font-family: 'Press Start 2P', monospace, sans-serif;
}

.form-input {
  background: rgba(0, 0, 0, 0.3);
  border: 2px solid #4a3f8a;
  border-radius: 6px;
  padding: 0.8rem;
  color: #fff;
  font-size: 0.9rem;
  font-family: inherit;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #ffd700;
}

.form-input.error {
  border-color: #ff4444;
}

.form-input::placeholder {
  color: #666;
}

.error-message {
  color: #ff4444;
  font-size: 0.7rem;
}

.submit-btn {
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 6px;
  padding: 0.9rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.9rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.submit-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #fffacd 0%, #ffd700 100%);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.switch-link {
  margin-top: 1rem;
  text-align: center;
  color: #888;
  font-size: 0.75rem;
}

.switch-btn {
  background: none;
  border: none;
  color: #ffd700;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.75rem;
  text-decoration: underline;
  margin-left: 0.3rem;
}

.switch-btn:hover {
  color: #fffacd;
}
</style>