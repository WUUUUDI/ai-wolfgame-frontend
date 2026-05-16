<template>
  <div class="game-container">
    <div class="game-header">
      <h1>🎮 游戏大厅</h1>
      <p>选择一个房间开始游戏</p>
    </div>
    
    <div class="rooms-grid">
      <div class="room-card" v-for="room in rooms" :key="room.id">
        <div class="room-header">
          <span class="room-number">房间 {{ room.id }}</span>
          <span :class="['room-status', room.status]">{{ room.status === 'playing' ? '进行中' : '等待中' }}</span>
        </div>
        <div class="room-info">
          <div class="player-count">
            <span>👥</span>
            <span>{{ room.players }}/{{ room.maxPlayers }} 玩家</span>
          </div>
          <div class="room-mode">{{ room.mode }}</div>
        </div>
        <button :disabled="room.status === 'playing'" class="join-btn">
          {{ room.status === 'playing' ? '已满' : '加入' }}
        </button>
      </div>
    </div>
    
    <div class="quick-start">
      <button class="quick-start-btn">⚡ 快速匹配</button>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const rooms = ref([
  { id: 1, players: 4, maxPlayers: 6, mode: '标准局', status: 'waiting' },
  { id: 2, players: 6, maxPlayers: 6, mode: '标准局', status: 'playing' },
  { id: 3, players: 3, maxPlayers: 8, mode: '进阶局', status: 'waiting' },
  { id: 4, players: 5, maxPlayers: 8, mode: '进阶局', status: 'waiting' },
  { id: 5, players: 8, maxPlayers: 8, mode: '高手局', status: 'playing' },
  { id: 6, players: 2, maxPlayers: 6, mode: '新手局', status: 'waiting' }
])
</script>

<style scoped>
.game-container {
  min-height: calc(100vh - 70px);
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 100%);
  padding: 2rem 1rem;
  font-family: 'Press Start 2P', monospace, sans-serif;
}

.game-header {
  text-align: center;
  margin-bottom: 2rem;
}

.game-header h1 {
  color: #ffd700;
  font-size: 1.4rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.game-header p {
  color: #c9c9ff;
  font-size: 0.75rem;
  font-weight: 600;
}

.rooms-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1rem;
  max-width: 800px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .rooms-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

.room-card {
  background: linear-gradient(135deg, rgba(74, 63, 138, 0.3) 0%, rgba(26, 26, 62, 0.5) 100%);
  border-radius: 12px;
  padding: 1.5rem;
  border: 2px solid #4a3f8a;
  transition: all 0.3s ease;
}

.room-card:hover {
  transform: translateY(-3px);
  border-color: #ffd700;
  box-shadow: 0 10px 30px rgba(255, 215, 0, 0.1);
}

.room-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.room-number {
  color: #fff;
  font-size: 0.95rem;
  font-weight: bold;
}

.room-status {
  font-size: 0.65rem;
  font-weight: bold;
  padding: 0.4rem 1rem;
  border-radius: 20px;
}

.room-status.waiting {
  background: linear-gradient(180deg, #4CAF50 0%, #388E3C 100%);
  color: #fff;
}

.room-status.playing {
  background: linear-gradient(180deg, #f44336 0%, #d32f2f 100%);
  color: #fff;
}

.room-info {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.player-count {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  color: #c9c9ff;
  font-size: 0.75rem;
  font-weight: 600;
}

.room-mode {
  color: #ffd700;
  font-size: 0.75rem;
  font-weight: bold;
}

.join-btn {
  width: 100%;
  padding: 0.9rem;
  border: none;
  border-radius: 8px;
  font-family: inherit;
  font-size: 0.85rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(180deg, #ffd700 0%, #daa520 100%);
  color: #1a1a2e;
  font-weight: bold;
  box-shadow: 0 4px 0 #b8860b;
}

.join-btn:hover:not(:disabled) {
  background: linear-gradient(180deg, #fffacd 0%, #ffd700 100%);
  transform: translateY(2px);
  box-shadow: 0 2px 0 #b8860b;
}

.join-btn:disabled {
  background: #444;
  color: #888;
  cursor: not-allowed;
  box-shadow: none;
}

.quick-start {
  text-align: center;
  margin-top: 2rem;
}

.quick-start-btn {
  padding: 1.1rem 3.5rem;
  border: none;
  border-radius: 10px;
  font-family: inherit;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  background: linear-gradient(180deg, #9b59b6 0%, #8e44ad 100%);
  color: #fff;
  font-weight: bold;
  box-shadow: 0 5px 0 #6c3483;
}

.quick-start-btn:hover {
  background: linear-gradient(180deg, #a569bd 0%, #9b59b6 100%);
  transform: translateY(3px);
  box-shadow: 0 2px 0 #6c3483;
}
</style>