<template>
  <div class="create-room">
    <div class="room-header">
      <router-link to="/" class="back-btn">← 返回</router-link>
      <div class="room-title">创建房间</div>
      <div class="room-subtitle">配置AI玩家</div>
      <div class="player-count-selector">
        <span class="count-label">人数：</span>
        <div class="count-options">
          <button
            v-for="n in [6, 9, 12]"
            :key="n"
            :class="['count-btn', { active: playerCount === n }]"
            @click="setPlayerCount(n)"
          >{{ n }}人</button>
        </div>
      </div>
    </div>

    <div class="players-grid">
      <div
        v-for="(player, index) in players"
        :key="index"
        class="player-card"
      >
        <div class="player-avatar">
          <span class="player-icon">{{ getPlayerIcon(index) }}</span>
          <span class="player-number">{{ index + 1 }}</span>
        </div>
        <div class="player-config">
          <div class="config-row">
            <label class="config-label">难度</label>
            <select v-model="player.difficulty" class="config-select">
              <option v-for="d in difficulties" :key="d" :value="d">{{ d }}</option>
            </select>
          </div>
          <div class="config-row">
            <label class="config-label">策略</label>
            <select v-model="player.strategy" class="config-select">
              <option v-for="s in strategies" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>
        </div>
      </div>
    </div>

    <div class="room-actions">
      <button class="random-btn" @click="randomizeConfig">🎲 快速配置</button>
      <button class="create-btn" @click="createRoom" :disabled="creating">
        <span v-if="creating">⏳ 创建中...</span>
        <span v-else>🎮 创建房间</span>
      </button>
    </div>

    <div v-if="createdRoomId" class="room-result">
      <div class="result-box">
        <div class="result-title">房间创建成功！</div>
        <div class="result-id">
          房间号：<span class="room-id-text">{{ createdRoomId }}</span>
        </div>
        <button class="enter-btn" @click="enterRoom">进入房间</button>
      </div>
    </div>

    <div v-if="errorMsg" class="error-msg">{{ errorMsg }}</div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { roomApi } from '../services/api'

const router = useRouter()

const difficulties = ['入门', '简单', '中等', '困难', '地狱', '不可能']
const strategies = ['理性逻辑', '温柔', '激进', '保守', '沉默旁观', '煽动情绪', '欺诈', '跟风墙头']

const avatarIcons = ['🐺', '🧙', '🔮', '🎭', '👻', '🦊', '🐻', '🦉', '🐍', '🦅', '🐗', '🦌']

const playerCount = ref(12)

const players = ref(
  Array.from({ length: 12 }, () => ({
    is_human: false,
    difficulty: '中等',
    strategy: '理性逻辑'
  }))
)

const creating = ref(false)
const createdRoomId = ref('')
const errorMsg = ref('')

const setPlayerCount = (count) => {
  if (playerCount.value === count) return
  playerCount.value = count

  const current = players.value
  if (count > current.length) {
    const newPlayers = Array.from({ length: count - current.length }, () => ({
      is_human: false,
      difficulty: '中等',
      strategy: '理性逻辑'
    }))
    players.value = [...current, ...newPlayers]
  } else {
    players.value = current.slice(0, count)
  }
}

const getPlayerIcon = (index) => {
  return avatarIcons[index] || '🤖'
}

const randomizeConfig = () => {
  players.value = players.value.map(() => ({
    is_human: false,
    difficulty: difficulties[Math.floor(Math.random() * difficulties.length)],
    strategy: strategies[Math.floor(Math.random() * strategies.length)]
  }))
}

const createRoom = async () => {
  creating.value = true
  errorMsg.value = ''
  createdRoomId.value = ''

  try {
    const response = await roomApi.createRoom(players.value)
    if (response.data && response.data.room_id) {
      createdRoomId.value = response.data.room_id
      router.push({
        path: '/game-room',
        query: {
          room: response.data.room_id,
          players: JSON.stringify(players.value)
        }
      })
    }
  } catch (error) {
    errorMsg.value = error.message || '创建房间失败，请稍后重试'
  } finally {
    creating.value = false
  }
}

const enterRoom = () => {
  router.push({
    path: '/game-room',
    query: {
      room: createdRoomId.value,
      players: JSON.stringify(players.value)
    }
  })
}
</script>

<style scoped>
.create-room {
  min-height: 100vh;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 100%);
  font-family: 'Press Start 2P', monospace, sans-serif;
  padding: 1.5rem 1rem;
  padding-bottom: 80px;
}

.room-header {
  text-align: center;
  margin-bottom: 1.5rem;
}

.back-btn {
  display: inline-block;
  color: #c9c9ff;
  font-size: 0.7rem;
  text-decoration: none;
  margin-bottom: 0.8rem;
  transition: color 0.3s ease;
}

.back-btn:hover {
  color: #ffd700;
}

.room-title {
  color: #ffd700;
  font-size: 1.2rem;
  font-weight: 900;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.room-subtitle {
  color: #888;
  font-size: 0.7rem;
  font-weight: 800;
  margin-top: 0.5rem;
}

.player-count-selector {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;
}

.count-label {
  color: #c9c9ff;
  font-size: 0.65rem;
  font-weight: 800;
}

.count-options {
  display: flex;
  gap: 0.4rem;
}

.count-btn {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #4a3f8a;
  border-radius: 6px;
  color: #888;
  padding: 0.4rem 0.8rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.55rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.count-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
}

.count-btn.active {
  color: #1a1a2e;
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  border-color: #b8860b;
  box-shadow: 0 2px 0 #b8860b;
}

.players-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
}

@media (min-width: 768px) {
  .players-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (min-width: 1024px) {
  .players-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.player-card {
  background: rgba(0, 0, 0, 0.4);
  border: 2px solid #4a3f8a;
  border-radius: 8px;
  padding: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.player-card:hover {
  border-color: #ffd700;
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.1);
}

.player-avatar {
  display: flex;
  align-items: center;
  gap: 0.3rem;
}

.player-icon {
  font-size: 1.5rem;
}

.player-number {
  color: #c9c9ff;
  font-size: 0.7rem;
  font-weight: 900;
}

.player-config {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.config-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.3rem;
}

.config-label {
  color: #aaa;
  font-size: 0.55rem;
  font-weight: 800;
  flex-shrink: 0;
}

.config-select {
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid #4a3f8a;
  border-radius: 4px;
  color: #ffd700;
  padding: 0.3rem 0.4rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.5rem;
  cursor: pointer;
  flex: 1;
  max-width: 120px;
}

.config-select:focus {
  outline: none;
  border-color: #ffd700;
}

.room-actions {
  text-align: center;
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.random-btn {
  background: linear-gradient(180deg, #9a76e6 0%, #8a66d6 45%, #7a56c6 46%, #6a46b6 100%);
  color: #fff;
  border: 3px solid #5a3a9a;
  border-radius: 8px;
  padding: 1rem 2rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.75rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 0 #5a3a9a, 0 8px 0 #3a2a6a, inset 0 2px 0 rgba(255, 255, 255, 0.2);
  text-shadow: 1px 1px 0 rgba(0, 0, 0, 0.4);
  transition: all 0.15s ease;
}

.random-btn:hover {
  background: linear-gradient(180deg, #aa86f6 0%, #9a76e6 45%, #8a66d6 46%, #7a56c6 100%);
  transform: translateY(-2px);
  box-shadow: 0 2px 0 #5a3a9a, 0 6px 0 #3a2a6a, inset 0 2px 0 rgba(255, 255, 255, 0.2);
}

.random-btn:active {
  transform: translateY(4px);
  box-shadow: 0 0 0 #5a3a9a, 0 4px 0 #3a2a6a, inset 0 2px 0 rgba(0, 0, 0, 0.1);
}

.create-btn {
  background: linear-gradient(180deg, #f8d438 0%, #eec820 45%, #dca818 46%, #c89612 100%);
  color: #1f1f1f;
  border: 3px solid #9a7510;
  border-radius: 8px;
  padding: 1rem 3rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.9rem;
  font-weight: 900;
  cursor: pointer;
  box-shadow: 0 4px 0 #9a7510, 0 8px 0 #6a500a, inset 0 2px 0 rgba(255, 255, 255, 0.3);
  text-shadow: 1px 1px 0 rgba(255, 255, 255, 0.4);
  transition: all 0.15s ease;
}

.create-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #fce360 0%, #f6d438 45%, #ecc720 46%, #d8a618 100%);
  transform: translateY(-2px);
  box-shadow: 0 2px 0 #9a7510, 0 6px 0 #6a500a, inset 0 2px 0 rgba(255, 255, 255, 0.4);
}

.create-btn:active:not(:disabled) {
  transform: translateY(4px);
  box-shadow: 0 0 0 #9a7510, 0 4px 0 #6a500a, inset 0 2px 0 rgba(0, 0, 0, 0.1);
}

.create-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.room-result {
  margin-top: 1.5rem;
  display: flex;
  justify-content: center;
}

.result-box {
  background: rgba(0, 200, 0, 0.1);
  border: 2px solid #00cc66;
  border-radius: 8px;
  padding: 1.2rem 2rem;
  text-align: center;
}

.result-title {
  color: #00cc66;
  font-size: 0.8rem;
  font-weight: 900;
  margin-bottom: 0.8rem;
}

.result-id {
  color: #c9c9ff;
  font-size: 0.7rem;
  margin-bottom: 1rem;
}

.room-id-text {
  color: #ffd700;
  font-size: 1.2rem;
}

.enter-btn {
  background: linear-gradient(180deg, #9a76e6 0%, #8a66d6 45%, #7a56c6 46%, #6a46b6 100%);
  color: #fff;
  border: 2px solid #5a3a9a;
  border-radius: 6px;
  padding: 0.7rem 2rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
  font-size: 0.75rem;
  font-weight: 900;
  cursor: pointer;
  transition: all 0.3s ease;
}

.enter-btn:hover {
  background: linear-gradient(180deg, #aa86f6 0%, #9a76e6 45%, #8a66d6 46%, #7a56c6 100%);
}

.error-msg {
  margin-top: 1rem;
  text-align: center;
  color: #ff4444;
  font-size: 0.7rem;
  font-weight: 800;
  background: rgba(255, 68, 68, 0.1);
  border: 1px solid #ff4444;
  border-radius: 6px;
  padding: 0.8rem;
}
</style>
