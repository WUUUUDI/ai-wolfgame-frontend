<template>
  <div class="game-room">
    <div class="room-topbar">
      <router-link to="/" class="back-btn">← 返回</router-link>
      <div class="room-info">
        <span class="room-label">房间号</span>
        <span class="room-id">{{ roomId }}</span>
      </div>
      <div class="room-status">
        <span class="status-dot"></span>
        <span class="status-text">等待开始</span>
      </div>
    </div>

    <div class="room-body">
      <div class="table-header">
        <div class="table-icon-wrap">
          <span class="table-icon">🔮</span>
        </div>
        <span class="table-text">AI狼人杀</span>
        <span class="player-count">已就位：{{ players.length }} 人</span>
      </div>

      <div class="players-grid" v-if="players.length">
        <div
          v-for="(player, index) in players"
          :key="index"
          class="player-card"
        >
          <div class="card-main">
            <span class="card-icon">{{ getPlayerIcon(index) }}</span>
            <span class="card-number">{{ index + 1 }}号</span>
          </div>
          <div class="card-hover-detail">
            <span class="detail-row">
              <span class="detail-label">难度</span>
              <span class="detail-value difficulty">{{ player.difficulty }}</span>
            </span>
            <span class="detail-row">
              <span class="detail-label">策略</span>
              <span class="detail-value strategy">{{ player.strategy }}</span>
            </span>
          </div>
        </div>
      </div>

      <div v-else class="empty-state">
        <span class="empty-icon">🐺</span>
        <span class="empty-text">暂无玩家数据</span>
      </div>
    </div>

    <div class="room-bottom">
      <div class="cmd-section">
        <div class="cmd-input-row">
          <input
            v-model="cmdInput"
            type="text"
            class="cmd-input"
            placeholder="输入指令，如: start"
            @keyup.enter="sendCommand"
          />
          <button
            class="cmd-btn"
            @click="sendCommand"
            :disabled="!cmdInput.trim()"
          >
            发送
          </button>
        </div>
        <div class="cmd-presets">
          <button
            class="preset-btn"
            :class="{ active: cmdInput === 'start' }"
            @click="setCmd('start')"
          >
            ▶ start
          </button>
        </div>
      </div>

      <div class="action-row">
        <button class="action-btn leave-btn" @click="leaveRoom">🚪 离开房间</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const roomId = ref('')
const players = ref([])
const cmdInput = ref('')
const wsConnected = ref(false)

const avatarIcons = ['🐺', '🧙', '🔮', '🎭', '👻', '🦊', '🐻', '🦉', '🐍', '🦅', '🐗', '🦌']

const getPlayerIcon = (index) => {
  return avatarIcons[index] || '🤖'
}

const sendCommand = () => {
  const cmd = cmdInput.value.trim()
  if (!cmd) return

  if (cmd === 'start') {
    router.push({
      path: '/game',
      query: { room: roomId.value, players: JSON.stringify(players.value) }
    })
    return
  }

  cmdInput.value = ''
}

const setCmd = (value) => {
  cmdInput.value = value
}

onMounted(() => {
  const query = route.query
  roomId.value = query.room || ''

  if (query.players) {
    try {
      players.value = JSON.parse(query.players)
    } catch {
      players.value = []
    }
  }
})

const leaveRoom = () => {
  router.push('/')
}
</script>

<style scoped>
.game-room {
  min-height: 100vh;
  min-height: 100dvh;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 100%);
  font-family: 'Press Start 2P', monospace, sans-serif;
  display: flex;
  flex-direction: column;
}

.room-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.5);
  border-bottom: 2px solid #4a3f8a;
  flex-shrink: 0;
}

.back-btn {
  color: #c9c9ff;
  font-size: 0.6rem;
  text-decoration: none;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #ffd700;
}

.room-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
}

.room-label {
  color: #888;
  font-size: 0.5rem;
}

.room-id {
  color: #ffd700;
  font-size: 0.8rem;
  font-weight: 900;
}

.room-status {
  display: flex;
  align-items: center;
  gap: 0.35rem;
}

.status-dot {
  width: 7px;
  height: 7px;
  background: #ffa500;
  border-radius: 50%;
  transition: background 0.3s ease;
}

.status-dot.connected {
  background: #00cc66;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

.status-text {
  color: #888;
  font-size: 0.5rem;
}

/* --- room body --- */
.room-body {
  flex: 1;
  overflow-y: auto;
  padding: 1rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
}

.table-header {
  text-align: center;
}

.table-icon-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  background: radial-gradient(ellipse, #2a1a4e 0%, #1a1030 60%, #0f0c29 100%);
  border-radius: 50%;
  border: 2px solid #4a3f8a;
  box-shadow: 0 0 25px rgba(74, 63, 138, 0.3);
}

.table-icon {
  font-size: 1.5rem;
}

.table-text {
  display: block;
  color: #ffd700;
  font-size: 0.55rem;
  font-weight: 900;
  margin-top: 0.4rem;
}

.player-count {
  display: block;
  color: #c9c9ff;
  font-size: 0.45rem;
  font-weight: 800;
  margin-top: 0.3rem;
}

/* --- players grid --- */
.players-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.5rem;
}

.player-card {
  background: rgba(0, 0, 0, 0.45);
  border: 2px solid #4a3f8a;
  border-radius: 8px;
  padding: 0.5rem 0.3rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.3rem;
  position: relative;
  transition: all 0.3s ease;
  overflow: hidden;
}

.player-card:hover {
  border-color: #ffd700;
  box-shadow: 0 0 12px rgba(255, 215, 0, 0.15);
  transform: translateY(-2px);
}

.card-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  transition: opacity 0.2s ease;
}

.player-card:hover .card-main {
  opacity: 0;
}

.card-icon {
  font-size: 1.4rem;
}

.card-number {
  color: #ffd700;
  font-size: 0.5rem;
  font-weight: 900;
}

.card-hover-detail {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.3rem;
  opacity: 0;
  transition: opacity 0.2s ease;
  padding: 0.3rem;
}

.player-card:hover .card-hover-detail {
  opacity: 1;
}

.detail-row {
  display: flex;
  gap: 0.3rem;
  align-items: center;
}

.detail-label {
  color: #888;
  font-size: 0.4rem;
}

.detail-value {
  font-size: 0.42rem;
  font-weight: 800;
  padding: 0.1rem 0.3rem;
  border-radius: 2px;
}

.detail-value.difficulty {
  background: rgba(255, 165, 0, 0.2);
  color: #ffa500;
}

.detail-value.strategy {
  background: rgba(140, 80, 255, 0.2);
  color: #9f5fff;
}

/* --- empty state --- */
.empty-state {
  text-align: center;
  padding: 2rem 0;
}

.empty-icon {
  font-size: 2.5rem;
}

.empty-text {
  display: block;
  color: #888;
  font-size: 0.5rem;
  margin-top: 0.5rem;
}

/* --- room bottom --- */
.room-bottom {
  padding: 0.75rem 1rem;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.5);
  border-top: 2px solid #4a3f8a;
  flex-shrink: 0;
}

/* --- command section --- */
.cmd-section {
  margin-bottom: 0.6rem;
}

.cmd-input-row {
  display: flex;
  gap: 0.4rem;
}

.cmd-input {
  flex: 1;
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #4a3f8a;
  border-radius: 6px;
  padding: 0.5rem 0.6rem;
  color: #fff;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.45rem;
  outline: none;
  transition: border-color 0.3s ease;
}

.cmd-input:focus {
  border-color: #ffd700;
}

.cmd-input::placeholder {
  color: #555;
}

.cmd-btn {
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  color: #1a1a2e;
  border: none;
  border-radius: 6px;
  padding: 0.5rem 0.8rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.45rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.15s ease;
  white-space: nowrap;
}

.cmd-btn:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
}

.cmd-btn:active:not(:disabled) {
  transform: translateY(0);
}

.cmd-btn:disabled {
  background: #555;
  color: #888;
  cursor: not-allowed;
}

.cmd-presets {
  display: flex;
  gap: 0.3rem;
  margin-top: 0.4rem;
}

.preset-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 1px solid #4a3f8a;
  border-radius: 4px;
  color: #c9c9ff;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.38rem;
  padding: 0.3rem 0.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.preset-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
}

.preset-btn.active {
  background: rgba(255, 215, 0, 0.15);
  border-color: #ffd700;
  color: #ffd700;
}

/* --- action row --- */
.action-row {
  display: flex;
  justify-content: center;
}

.leave-btn {
  background: linear-gradient(180deg, #6c757d 0%, #495057 100%);
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 0.55rem 1.2rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.5rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.15s ease;
}

.leave-btn:hover {
  background: linear-gradient(180deg, #868e96 0%, #6c757d 100%);
  transform: translateY(-1px);
}

.leave-btn:active {
  transform: translateY(0);
}

/* --- responsive --- */
@media (min-width: 480px) {
  .players-grid {
    grid-template-columns: repeat(4, 1fr);
    gap: 0.6rem;
  }
}

@media (min-width: 768px) {
  .players-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.7rem;
  }

  .room-body {
    padding: 1.5rem 2rem;
  }

  .card-icon {
    font-size: 1.6rem;
  }
}

@media (min-width: 1024px) {
  .players-grid {
    grid-template-columns: repeat(6, 1fr);
    gap: 0.8rem;
    max-width: 800px;
    margin: 0 auto;
  }

  .room-body {
    padding: 2rem;
  }
}
</style>
