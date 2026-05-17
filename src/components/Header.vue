<template>
  <header class="header">
    <div class="header-content">
      <router-link to="/" class="logo">
        <span class="logo-icon">🐺</span>
        <span class="logo-text">AI狼人杀</span>
      </router-link>
      <nav class="nav">
        <ul class="nav-list">
          <li>
            <router-link to="/" class="nav-item" active-class="active" exact>首页</router-link>
          </li>
          <li>
            <router-link to="/game" class="nav-item" active-class="active">游戏大厅</router-link>
          </li>
          <li>
            <span class="nav-item">排行榜</span>
          </li>
          <li>
            <span class="nav-item">教程</span>
          </li>
          <li>
            <span class="nav-item">关于我们</span>
          </li>
        </ul>
      </nav>
      <div class="user-info">
        <span class="user-avatar">👤</span>
        <span class="user-name">玩家1234</span>
        <span class="user-level">Lv.12</span>
      </div>
      <button class="mobile-menu-btn" @click="toggleMobileMenu">
        <span></span>
        <span></span>
        <span></span>
      </button>
    </div>
    <div :class="['mobile-menu', { active: mobileMenuOpen }]">
      <ul class="mobile-nav-list">
        <li>
          <router-link to="/" class="mobile-nav-item" active-class="active" exact @click="mobileMenuOpen = false">首页</router-link>
        </li>
        <li>
          <router-link to="/game" class="mobile-nav-item" active-class="active" @click="mobileMenuOpen = false">游戏大厅</router-link>
        </li>
        <li>
          <span class="mobile-nav-item">排行榜</span>
        </li>
        <li>
          <span class="mobile-nav-item">教程</span>
        </li>
        <li>
          <span class="mobile-nav-item">关于我们</span>
        </li>
      </ul>
    </div>
  </header>
</template>

<script setup>
import { ref } from 'vue'

const mobileMenuOpen = ref(false)

const toggleMobileMenu = () => {
  mobileMenuOpen.value = !mobileMenuOpen.value
}
</script>

<style scoped>
.header {
  position: relative;
  top: 0;
  left: 0;
  right: 0;
  background: linear-gradient(90deg, #1a1a2e 0%, #16213e 50%, #1a1a2e 100%);
  border-bottom: 3px solid #4a3f8a;
  padding: 0.75rem 1rem;
  min-height: 70px;
  z-index: 100;
  
  /* 滑入动画 */
  opacity: 0;
  transform: translateY(-20px);
  animation: slideDown 0.6s ease forwards;
  animation-delay: 0s;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
  text-decoration: none;
}

.logo-icon {
  font-size: 1.8rem;
}

.logo-text {
  color: #ffd700;
  font-size: 1.1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-weight: bold;
}

.nav {
  flex: 1;
  display: flex;
  justify-content: center;
}

.nav-list {
  display: flex;
  gap: 0;
  list-style: none;
  padding: 0;
  margin: 0;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 10px;
  padding: 0.3rem;
  border: 2px solid #3d3570;
}

.nav-item {
  color: #c9c9ff;
  font-size: 0.75rem;
  cursor: pointer;
  padding: 0.6rem 1.75rem;
  border-radius: 8px;
  position: relative;
  transition: all 0.3s ease;
  font-family: 'Press Start 2P', monospace, sans-serif;
  margin: 0 2px;
  text-decoration: none;
  display: inline-block;
}

.nav-item:hover {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
}

.nav-item.active {
  color: #1a1a2e;
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  box-shadow: 0 4px 0 #b8860b, inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

.nav-item.active::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 12px solid transparent;
  border-right: 12px solid transparent;
  border-top: 10px solid #daa520;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #c9c9ff;
  font-size: 0.65rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  flex-shrink: 0;
}

.user-avatar {
  font-size: 1.2rem;
}

.user-level {
  color: #ffd700;
}

.mobile-menu-btn {
  display: none;
  flex-direction: column;
  gap: 5px;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.5rem;
}

.mobile-menu-btn span {
  width: 24px;
  height: 3px;
  background: #ffd700;
  border-radius: 2px;
  transition: all 0.3s ease;
}

.mobile-menu-btn:hover span {
  background: #fff;
}

.mobile-menu {
  display: none;
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, #1a1a2e 0%, #16213e 100%);
  border-bottom: 2px solid #4a3f8a;
  padding: 1rem;
}

.mobile-menu.active {
  display: block;
}

.mobile-nav-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mobile-nav-item {
  color: #c9c9ff;
  font-size: 0.7rem;
  padding: 0.8rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Press Start 2P', monospace, sans-serif;
  text-decoration: none;
  display: block;
}

.mobile-nav-item:hover {
  color: #ffd700;
  background: rgba(255, 215, 0, 0.15);
}

.mobile-nav-item.active {
  color: #1a1a2e;
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
}

@media (max-width: 900px) {
  .nav-item {
    padding: 0.5rem 1rem;
    font-size: 0.65rem;
  }
  
  .logo-text {
    font-size: 0.9rem;
  }
  
  .user-info {
    font-size: 0.55rem;
  }
}

@media (max-width: 768px) {
  .nav {
    display: none;
  }
  
  .user-info {
    display: none;
  }
  
  .mobile-menu-btn {
    display: flex;
  }
  
  .header-content {
    justify-content: space-between;
  }
  
  .logo-text {
    font-size: 0.8rem;
  }
  
  .header {
    min-height: 60px;
  }
}
</style>