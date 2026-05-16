<template>
  <div class="home-container">
    <section class="hero">
      <div class="hero-bg">
        <img :src="heroBg" alt="AI狼人杀背景" />
      </div>
      <div class="hero-content">
        <div class="buttons">
          <router-link to="/game" class="btn btn-primary">
            <span class="btn-icon">⚔️</span>
            <div class="btn-text-wrapper">
              <span class="btn-text">快速开始</span>
              <span class="btn-sub">匹配AI玩家</span>
            </div>
          </router-link>
          <router-link to="/game" class="btn btn-secondary">
            <span class="btn-icon">🔍</span>
            <div class="btn-text-wrapper">
              <span class="btn-text">创建房间</span>
              <span class="btn-sub">自定义游戏</span>
            </div>
          </router-link>
        </div>
      </div>
    </section>

    <section class="features">
      <div class="section-title-wrapper">
        <span class="section-icon">◆</span>
        <span class="section-title">游戏特色</span>
        <span class="section-icon">◆</span>
      </div>
      <div class="features-grid">
        <div class="feature-card card-ai">
          <div class="feature-icon">🤖</div>
          <div class="feature-title">智能AI</div>
          <div class="feature-desc">多种难度AI，带来真实的狼人杀体验</div>
        </div>
        <div class="feature-card card-role">
          <div class="feature-icon">🎭</div>
          <div class="feature-title">多种角色</div>
          <div class="feature-desc">丰富的角色设定，体验不同的策略组合</div>
        </div>
        <div class="feature-card card-voice">
          <div class="feature-icon">🎙️</div>
          <div class="feature-title">实时语音</div>
          <div class="feature-desc">实时语音交流，让游戏更加身临其境</div>
        </div>
        <div class="feature-card card-stats">
          <div class="feature-icon">📊</div>
          <div class="feature-title">数据统计</div>
          <div class="feature-desc">详细的数据统计，记录你的高光时刻</div>
        </div>
      </div>
    </section>

    <section class="news-pass">
      <div class="news-section">
        <div class="news-header">
          <span class="news-icon">📢</span>
          <span class="news-title">最新公告</span>
          <span class="news-more">更多 →</span>
        </div>
        <div class="news-list">
          <div class="news-item">
            <span class="news-tag tag-new">新</span>
            <span class="news-content">全新角色「噩梦之影」上线！上线！</span>
            <span class="news-date">05-20</span>
          </div>
          <div class="news-item">
            <span class="news-tag tag-event">活</span>
            <span class="news-content">周末双倍经验活动开启！</span>
            <span class="news-date">05-18</span>
          </div>
          <div class="news-item">
            <span class="news-tag tag-update">更</span>
            <span class="news-content">版本更新公告 (v1.2.0)</span>
            <span class="news-date">05-15</span>
          </div>
        </div>
      </div>
      <div class="pass-section">
        <div class="pass-header">
          <span class="pass-icon">📜</span>
          <span class="pass-title">赛季通行证</span>
        </div>
        <div class="pass-desc">完成任务，领取丰厚奖励！</div>
        <button class="btn-pass">立即查看</button>
        <div class="pass-decoration">
          <span class="pass-icon-large">🎁</span>
        </div>
      </div>
    </section>

    <section class="quick-join">
      <div class="quick-header">
        <span class="quick-icon">🔥</span>
        <span class="quick-title">快速加入</span>
        <span class="quick-refresh">🔄 换一批</span>
      </div>
      <div class="rooms-grid">
        <div class="room-item" v-for="room in rooms" :key="room.id">
          <div class="room-info">
            <div class="room-name">{{ room.name }}</div>
            <div class="room-players">{{ room.players }}/{{ room.maxPlayers }}</div>
          </div>
          <div class="room-tags">
            <span :class="['room-tag', room.type]">{{ room.typeText }}</span>
            <span :class="['room-tag', room.level]">{{ room.levelText }}</span>
          </div>
          <button class="join-btn">加入</button>
        </div>
      </div>
    </section>

    <nav class="bottom-nav">
      <router-link to="/" class="nav-item active">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">首页</span>
      </router-link>
      <router-link to="/game" class="nav-item">
        <span class="nav-icon">🏠</span>
        <span class="nav-text">房间</span>
      </router-link>
      <span class="nav-item">
        <span class="nav-icon">💬</span>
        <span class="nav-text">消息</span>
      </span>
      <span class="nav-item">
        <span class="nav-icon">👤</span>
        <span class="nav-text">我的</span>
      </span>
    </nav>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const heroBg = ref('/src/assets/index-wolfgame.jpeg')

const rooms = ref([
  { id: 1, name: '12人标准场', players: 9, maxPlayers: 12, type: 'standard', typeText: '标准场', level: 'normal', levelText: '平民局' },
  { id: 2, name: '9人进阶场', players: 6, maxPlayers: 9, type: 'advanced', typeText: '进阶场', level: 'expert', levelText: '高手场' },
  { id: 3, name: '6人娱乐场', players: 3, maxPlayers: 6, type: 'entertainment', typeText: '娱乐场', level: 'casual', levelText: '娱乐场' },
  { id: 4, name: '12人标准场', players: 8, maxPlayers: 12, type: 'standard', typeText: '标准场', level: 'normal', levelText: '平民局' }
])
</script>

<style scoped>
.home-container {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 100%);
  font-family: 'Press Start 2P', monospace, sans-serif;
}

.hero {
  position: relative;
  width: 100%;
  height: calc(55vh);
  min-height: 400px;
  overflow: hidden;
  margin-top: -1px;
}

.hero-bg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}

.hero-bg img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.hero-content {
  position: relative;
  z-index: 1;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 0 1rem;
  padding-top: 80px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.4) 0%, rgba(15, 12, 41, 0.7) 100%);
}

.hero-title {
  margin-bottom: 1rem;
}

.title {
  font-size: 1.8rem;
  font-weight: 900;
  margin: 0;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 0.15rem;
}

.title-ai {
  color: #ffd700;
  text-shadow: 2px 2px 0 #b8860b, 4px 4px 0 rgba(0, 0, 0, 0.3);
  font-size: 1.3rem;
}

.title-main {
  color: #fff;
  text-shadow: 2px 2px 0 #8b5cf6, 4px 4px 0 rgba(0, 0, 0, 0.3);
  font-size: 2rem;
  letter-spacing: -0.05em;
}

.subtitle {
  font-size: 0.5rem;
  color: #c0c0c0;
  margin: 0.3rem 0 0;
  letter-spacing: 0.1em;
}

.campfire-area {
  margin-top: 0.8rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.campfire {
  position: relative;
}

.fire {
  font-size: 1.8rem;
  animation: fireFlicker 0.4s ease-in-out infinite alternate;
}

@keyframes fireFlicker {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.1); opacity: 1; }
}

.characters-row {
  display: flex;
  gap: 0.6rem;
}

.char {
  font-size: 1.1rem;
  animation: charBreathe 2s ease-in-out infinite;
}

.char:nth-child(1) { animation-delay: 0s; }
.char:nth-child(2) { animation-delay: 0.3s; }
.char:nth-child(3) { animation-delay: 0.6s; }
.char:nth-child(4) { animation-delay: 0.9s; }
.char:nth-child(5) { animation-delay: 1.2s; }
.char:nth-child(6) { animation-delay: 1.5s; }

@keyframes charBreathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-3px); }
}

.buttons {
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
  width: 100%;
  max-width: 267px;
  margin: 4rem auto 0;
}

@media (min-width: 768px) {
  .buttons {
    flex-direction: column;
    gap: 1rem;
    max-width: 333px;
  }
}

.btn {
  padding: 0.8rem 1.8rem;
  border: none;
  border-radius: 5px;
  font-family: inherit;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  gap: 1rem;
  transition: all 0.1s ease;
  position: relative;
  overflow: hidden;
  text-decoration: none;
  width: 100%;
  font-weight: 900;
  letter-spacing: 0.03em;
  image-rendering: pixelated;
  line-height: 1.3;
}

.btn-text-wrapper {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 0.15rem;
}

.btn-primary {
  background: linear-gradient(180deg, #f8d438 0%, #eec820 45%, #dca818 46%, #c89612 100%);
  color: #1f1f1f;
  border: 3px solid #9a7510;
  box-shadow: 0 3px 0 #9a7510, 0 6px 0 #6a500a, inset 0 2px 0 rgba(255, 255, 255, 0.3);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.4);
}

.btn-primary:hover {
  background: linear-gradient(180deg, #fce360 0%, #f6d438 45%, #ecc720 46%, #d8a618 100%);
  border-color: #b88a14;
  box-shadow: 0 3px 0 #b88a14, 0 6px 0 #8a6610, inset 0 2px 0 rgba(255, 255, 255, 0.4);
  transform: translateY(-1px);
}

.btn-primary:active {
  transform: translateY(3px);
  box-shadow: 0 0 0 #9a7510, 0 3px 0 #6a500a, inset 0 2px 0 rgba(0, 0, 0, 0.1);
}

.btn-secondary {
  background: linear-gradient(180deg, #9a76e6 0%, #8a66d6 45%, #7a56c6 46%, #6a46b6 100%);
  color: #fff;
  border: 3px solid #5a3a9a;
  box-shadow: 0 3px 0 #5a3a9a, 0 6px 0 #3a2a6a, inset 0 2px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
}

.btn-secondary:hover {
  background: linear-gradient(180deg, #aa86f6 0%, #9a76e6 45%, #8a66d6 46%, #7a56c6 100%);
  border-color: #7a5aba;
  box-shadow: 0 3px 0 #7a5aba, 0 6px 0 #5a3a9a, inset 0 2px 0 rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.btn-secondary:active {
  transform: translateY(3px);
  box-shadow: 0 0 0 #5a3a9a, 0 3px 0 #3a2a6a, inset 0 2px 0 rgba(0, 0, 0, 0.1);
}

.btn-icon {
  font-size: 1.6rem;
}

.btn-text {
  font-weight: 900;
  font-size: 1.2rem;
}

.btn-sub {
  font-size: 0.85rem;
  font-weight: 800;
  opacity: 0.9;
}

.campfire-area {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.campfire {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.fire-logs {
  width: 80px;
  height: 20px;
  background: linear-gradient(90deg, #4a3728 0%, #6b4423 50%, #4a3728 100%);
  border-radius: 4px;
  position: relative;
}

.fire-logs::before,
.fire-logs::after {
  content: '';
  position: absolute;
  width: 30px;
  height: 12px;
  background: #5d4037;
  border-radius: 3px;
}

.fire-logs::before {
  top: -6px;
  left: 10px;
  transform: rotate(-30deg);
}

.fire-logs::after {
  top: -6px;
  right: 10px;
  transform: rotate(30deg);
}

.fire {
  font-size: 3rem;
  animation: fireFlicker 0.4s ease-in-out infinite alternate;
  margin-top: -15px;
}

@keyframes fireFlicker {
  0% { transform: scale(1); opacity: 0.9; }
  100% { transform: scale(1.1); opacity: 1; }
}

.characters-row {
  display: flex;
  gap: 1.2rem;
  margin-top: 0.5rem;
}

.char {
  font-size: 1.8rem;
  animation: charBreathe 2s ease-in-out infinite;
}

.char:nth-child(1) { animation-delay: 0s; }
.char:nth-child(2) { animation-delay: 0.3s; }
.char:nth-child(3) { animation-delay: 0.6s; }
.char:nth-child(4) { animation-delay: 0.9s; }
.char:nth-child(5) { animation-delay: 1.2s; }
.char:nth-child(6) { animation-delay: 1.5s; }

@keyframes charBreathe {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-5px); }
}

.features {
  padding: 1rem 1rem;
  background: rgba(0, 0, 0, 0.3);
}

.section-title-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.section-icon {
  color: #ffd700;
  font-size: 0.8rem;
}

.section-title {
  color: #ffd700;
  font-size: 0.9rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  letter-spacing: 0.1em;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.5rem;
}

@media (min-width: 768px) {
  .features-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }
}

.feature-card {
  padding: 0.8rem 0.5rem;
  border-radius: 6px;
  text-align: center;
  border: 2px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.feature-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 3px;
}

.card-ai::before {
  background: linear-gradient(90deg, #00bfff, #1e90ff);
}

.card-role::before {
  background: linear-gradient(90deg, #ff69b4, #ba55d3);
}

.card-voice::before {
  background: linear-gradient(90deg, #32cd32, #00ced1);
}

.card-stats::before {
  background: linear-gradient(90deg, #ffd700, #ffa500);
}

.feature-card:hover {
  transform: translateY(-5px);
  border-color: rgba(255, 215, 0, 0.5);
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
}

.card-ai {
  background: linear-gradient(135deg, rgba(0, 191, 255, 0.15) 0%, rgba(0, 100, 139, 0.2) 100%);
}

.card-role {
  background: linear-gradient(135deg, rgba(255, 105, 180, 0.15) 0%, rgba(139, 0, 139, 0.2) 100%);
}

.card-voice {
  background: linear-gradient(135deg, rgba(0, 255, 127, 0.15) 0%, rgba(0, 100, 0, 0.2) 100%);
}

.card-stats {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(218, 165, 32, 0.2) 100%);
}

.feature-icon {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.feature-title {
  color: #fff;
  font-size: 0.95rem;
  font-weight: 900;
  margin-bottom: 0.4rem;
}

.feature-desc {
  color: #c9c9ff;
  font-size: 0.75rem;
  font-weight: 800;
  line-height: 1.6;
  text-align: justify;
  text-align-last: center;
}

.news-pass {
  padding: 1rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

@media (min-width: 768px) {
  .news-pass {
    flex-direction: row;
    gap: 2rem;
  }
  
  .news-section {
    flex: 2;
  }
  
  .pass-section {
    flex: 1;
  }
}

.news-section {
  background: rgba(0, 0, 0, 0.4);
  border-radius: 6px;
  padding: 0.8rem;
  border: 2px solid #4a3f8a;
}

.news-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.6rem;
}

.news-icon {
  font-size: 0.95rem;
}

.news-title {
  color: #ffd700;
  font-size: 0.95rem;
  font-weight: 900;
}

.news-more {
  color: #c9c9ff;
  font-size: 0.75rem;
  font-weight: 800;
  cursor: pointer;
}

.news-list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.news-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.3rem;
  border-radius: 3px;
  transition: background 0.2s ease;
}

.news-item:hover {
  background: rgba(255, 255, 255, 0.05);
}

.news-tag {
  width: 30px;
  height: 30px;
  border-radius: 3px;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.65rem;
  font-weight: 900;
  color: #fff;
  flex-shrink: 0;
}

.tag-new {
  background: linear-gradient(180deg, #ff4444, #cc0000);
}

.tag-event {
  background: linear-gradient(180deg, #44ff44, #00cc00);
  color: #000;
}

.tag-update {
  background: linear-gradient(180deg, #4444ff, #0000cc);
}

.news-content {
  flex: 1;
  color: #fff;
  font-size: 0.8rem;
  font-weight: 800;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.news-date {
  color: #aaa;
  font-size: 0.8rem;
  font-weight: 800;
  flex-shrink: 0;
}

.pass-section {
  background: linear-gradient(135deg, rgba(255, 215, 0, 0.15) 0%, rgba(180, 140, 0, 0.25) 100%);
  border-radius: 6px;
  padding: 0.8rem;
  border: 2px solid #daa520;
  position: relative;
  overflow: hidden;
}

.pass-header {
  margin-bottom: 0.3rem;
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.pass-icon {
  font-size: 0.95rem;
}

.pass-title {
  color: #ffd700;
  font-size: 0.95rem;
  font-weight: 900;
}

.pass-desc {
  color: #fff;
  font-size: 0.75rem;
  font-weight: 800;
  margin-bottom: 0.6rem;
}

.btn-pass {
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 4px;
  padding: 0.55rem 1.5rem;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 900;
}

.btn-pass:hover {
  background: linear-gradient(180deg, #fffacd 0%, #ffd700 100%);
}

.pass-decoration {
  position: absolute;
  top: 15%;
  right: 10%;
}

.pass-icon-large {
  font-size: 2rem;
  opacity: 0.3;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.footer {
  background: rgba(0, 0, 0, 0.5);
  padding: 2rem 1rem;
  border-top: 2px solid #4a3f8a;
}

.footer-content {
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

.footer-logo {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  margin-bottom: 1rem;
}

.footer-logo .logo-icon {
  font-size: 1.5rem;
}

.footer-logo .logo-text {
  font-size: 0.8rem;
}

.footer-logo .logo-sub {
  font-size: 0.5rem;
  color: #888;
}

.footer-links {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.footer-links span {
  color: #888;
  font-size: 0.5rem;
  cursor: pointer;
  transition: color 0.3s ease;
}

.footer-links span:hover {
  color: #ffd700;
}

.footer-copyright {
  color: #666;
  font-size: 0.45rem;
}

.quick-join {
  padding: 0.8rem 1rem;
  background: rgba(0, 0, 0, 0.3);
  padding-bottom: 70px;
}

.quick-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 1rem;
}

.quick-icon {
  font-size: 1rem;
}

.quick-title {
  color: #ffd700;
  font-size: 1rem;
  font-weight: 900;
  flex: 1;
  margin-left: 0.5rem;
}

.quick-refresh {
  color: #c9c9ff;
  font-size: 0.8rem;
  cursor: pointer;
  font-weight: 800;
}

.rooms-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

@media (min-width: 768px) {
  .rooms-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.8rem;
  }
}

.room-item {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
  padding: 0.8rem;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.room-info {
  margin-bottom: 0.6rem;
}

.room-name {
  color: #fff;
  font-size: 0.9rem;
  font-weight: 900;
  margin-bottom: 0.3rem;
}

.room-players {
  color: #aaa;
  font-size: 0.75rem;
  font-weight: 800;
}

.room-tags {
  display: flex;
  gap: 0.4rem;
  margin-bottom: 0.6rem;
}

.room-tag {
  font-size: 0.65rem;
  padding: 0.25rem 0.6rem;
  border-radius: 2px;
  font-weight: 900;
}

.room-tag.standard {
  background: rgba(255, 215, 0, 0.2);
  color: #ffd700;
}

.room-tag.advanced {
  background: rgba(140, 80, 255, 0.2);
  color: #9f5fff;
}

.room-tag.entertainment {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.room-tag.normal {
  background: rgba(100, 200, 100, 0.2);
  color: #64c864;
}

.room-tag.expert {
  background: rgba(255, 100, 100, 0.2);
  color: #ff6464;
}

.room-tag.casual {
  background: rgba(100, 180, 255, 0.2);
  color: #64b4ff;
}

.join-btn {
  width: 100%;
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 3px;
  padding: 0.6rem;
  font-family: inherit;
  font-size: 0.85rem;
  font-weight: 900;
  cursor: pointer;
}

.bottom-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(180deg, rgba(30, 30, 50, 0.98) 0%, rgba(20, 20, 40, 0.99) 100%);
  border-top: 2px solid #4a3f8a;
  display: flex;
  justify-content: space-around;
  padding: 0.4rem 0;
  padding-bottom: calc(0.4rem + env(safe-area-inset-bottom));
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.15rem;
  padding: 0.2rem 0.8rem;
  cursor: pointer;
  text-decoration: none;
  color: #888;
}

.nav-item.active {
  color: #ffd700;
}

.nav-icon {
  font-size: 1.4rem;
}

.nav-text {
  font-size: 0.65rem;
  font-weight: 800;
}
</style>