<template>
  <div class="game-page">
    <div class="game-topbar">
      <button class="back-btn" @click="leaveGame">← 离开</button>
      <div class="phase-indicator" :class="phaseClass">
        <span class="phase-icon">{{ phaseIcon }}</span>
        <span class="phase-text">{{ gameState.phase || '等待中' }}</span>
      </div>
      <div class="round-info">
        <span class="alive-count">存活 {{ aliveCount }}</span>
      </div>
    </div>

    <div class="game-body">
      <div class="players-col players-col-left">
        <div
          v-for="p in leftPlayers"
          :key="p.id"
          :class="['player-avatar', {
            dead: !p.is_alive,
            speaking: speakingId === p.id,
            highlighted: highlightedId === p.id
          }]"
          @click="togglePlayerDetail(p.id)"
        >
          <span class="avatar-emoji">{{ getPlayerEmoji(p) }}</span>
          <span class="avatar-name">{{ p.name }}</span>
          <span v-if="!p.is_alive" class="avatar-dead">❌</span>
          <span v-if="speakingId === p.id" class="avatar-speaking">🗣️</span>
        </div>
      </div>

      <div class="center-area" ref="centerRef">
        <div class="center-panel">
          <div v-if="gameState.gameOver" class="game-over-banner">
            <span class="gob-icon">🏆</span>
            <span class="gob-text">{{ winnerText }} 获胜！</span>
          </div>

          <div class="phase-banner" v-if="gameState.phase && !gameState.gameOver">
            <span class="phase-big-icon">{{ phaseIcon }}</span>
            <span class="phase-big-text">{{ phaseLabel }}</span>
          </div>

          <div class="night-progress" v-if="gameState.phase === '夜晚' && nightRoleQueue.length">
            <div class="night-roles">
              <span
                v-for="(role, idx) in nightRoleQueue"
                :key="role"
                :class="['night-chip', { done: idx < nightRoleIdx, active: idx === nightRoleIdx }]"
              >
                {{ nightRoleIcon(idx) }} {{ role }}
              </span>
            </div>
          </div>

          <div v-if="showVotePanel" class="vote-panel">
              <div class="vote-panel-title">🗳️ 投票中</div>
              <div class="vote-list">
                <div
                  v-for="(item, idx) in voteRanking"
                  :key="item.id"
                  :class="['vote-row', { top: idx === 0 }]"
                >
                  <span class="vote-rank">#{{ idx + 1 }}</span>
                  <span class="vote-emoji">{{ item.player ? getPlayerEmoji(item.player) : '❓' }}</span>
                  <span class="vote-name">{{ item.player ? item.player.name : item.id }}</span>
                  <span class="vote-bar-wrap">
                    <span class="vote-bar" :style="{ width: voteBarWidth(item.count) }"></span>
                  </span>
                  <span class="vote-count">{{ item.count }}票</span>
                </div>
              </div>
              <div v-if="!voteRanking.length" class="vote-empty">暂无投票记录</div>
            </div>

          <div class="center-log" ref="logRef">
            <div v-if="events.length === 0" class="log-empty">
              <span class="log-empty-icon">🐺</span>
              <span class="log-empty-text">等待游戏开始...</span>
            </div>
            <TransitionGroup name="log-item" tag="div" class="log-list">
              <div
                v-for="evt in events"
                :key="evt.id"
                :class="['log-entry', `log-${evt.level}`]"
              >
                <div class="log-time">{{ evt.time }}</div>
                <div class="log-body">
                  <span class="log-icon">{{ evt.icon }}</span>
                  <span class="log-content">{{ evt.content }}</span>
                </div>
              </div>
            </TransitionGroup>
          </div>
        </div>
      </div>

      <Teleport to="body">
        <Transition name="modal">
          <div v-if="detailPlayer" class="detail-overlay" @click.self="detailPlayer = null">
            <div class="detail-modal">
              <button class="detail-close" @click="detailPlayer = null">✕</button>
              <div class="detail-header">
                <span class="detail-emoji">{{ getPlayerEmoji(detailPlayer) }}</span>
                <span class="detail-name">{{ detailPlayer.name }}</span>
                <span v-if="!detailPlayer.is_alive" class="detail-dead-tag">❌ 已死亡</span>
              </div>
              <div class="detail-grid">
                <div class="detail-item">
                  <span class="detail-label">角色</span>
                  <span class="detail-value role">{{ detailPlayer.role || '?' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">难度</span>
                  <span class="detail-value diff">{{ detailPlayer.difficulty || '-' }}</span>
                </div>
                <div class="detail-item">
                  <span class="detail-label">策略</span>
                  <span class="detail-value strategy">{{ detailPlayer.strategy || '-' }}</span>
                </div>
              </div>
              <div v-if="detailPlayer.memories && detailPlayer.memories.length" class="detail-memories">
                <div class="detail-memories-title">🧠 记忆</div>
                <div
                  v-for="(mem, i) in detailPlayer.memories"
                  :key="i"
                  class="memory-entry"
                >{{ mem }}</div>
              </div>
              <div v-else class="detail-no-memories">暂无记忆</div>
            </div>
          </div>
        </Transition>
      </Teleport>

      <div class="players-col players-col-right">
        <div
          v-for="p in rightPlayers"
          :key="p.id"
          :class="['player-avatar', {
            dead: !p.is_alive,
            speaking: speakingId === p.id,
            highlighted: highlightedId === p.id
          }]"
          @click="togglePlayerDetail(p.id)"
        >
          <span class="avatar-emoji">{{ getPlayerEmoji(p) }}</span>
          <span class="avatar-name">{{ p.name }}</span>
          <span v-if="!p.is_alive" class="avatar-dead">❌</span>
          <span v-if="speakingId === p.id" class="avatar-speaking">🗣️</span>
        </div>
      </div>
    </div>

    <div class="game-bottom">
      <div class="ws-status">
        <span class="ws-dot" :class="{ connected: wsConnected }"></span>
        <span>{{ wsConnected ? '已连接' : '连接中...' }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()

const roomId = ref('')
const wsConnected = ref(false)
const events = ref([])
const logRef = ref(null)
const centerRef = ref(null)
const detailPlayer = ref(null)
const speakingId = ref(null)
const highlightedId = ref(null)
const gameStarted = ref(false)

let ws = null
let eventIdCounter = 0
const MAX_LOG = 200
const speechStreams = {}

const gameState = reactive({
  phase: '',
  nightRoleOrder: [],
  nightActions: {},
  currentNightRoleIdx: 0,
  killedTonight: [],
  votedOut: '',
  waitToSpeakQueue: [],
  waitToVoteQueue: [],
  votes: {},
  witchAntidote: true,
  witchPoison: true,
  gameOver: false,
  winner: null
})

const players = ref([])

const leftPlayers = computed(() => {
  const all = players.value
  const half = Math.ceil(all.length / 2)
  return all.slice(0, half)
})

const rightPlayers = computed(() => {
  const all = players.value
  const half = Math.ceil(all.length / 2)
  return all.slice(half)
})

const aliveCount = computed(() => players.value.filter(p => p.is_alive).length)

const phaseClass = computed(() => {
  const p = gameState.phase
  if (p === '夜晚') return 'phase-night'
  if (p === '白天') return 'phase-day'
  if (p === '游戏结束') return 'phase-over'
  return ''
})

const phaseIcon = computed(() => {
  if (gameState.phase === '夜晚') return '🌙'
  if (gameState.phase === '白天') return '☀️'
  if (gameState.gameOver) return '🏁'
  return '⏳'
})

const phaseLabel = computed(() => {
  if (gameState.phase === '夜晚') return '夜晚阶段 - 请闭眼'
  if (gameState.phase === '白天') return '白天阶段 - 自由讨论'
  if (gameState.gameOver) return '游戏结束'
  if (gameStarted.value) return '等待事件...'
  return '准备连接...'
})

const winnerText = computed(() => {
  const w = gameState.winner
  if (w === 'werewolf' || w === '狼人') return '🐺 狼人阵营'
  if (w === 'villager' || w === '村民' || w === '好人') return '👥 村民阵营'
  return w || ''
})

const voteRanking = computed(() => {
  const votes = gameState.votes || {}
  const tally = {}
  Object.entries(votes).forEach(([voterId, targetId]) => {
    if (targetId && targetId !== null) {
      tally[targetId] = (tally[targetId] || 0) + 1
    }
  })
  return Object.entries(tally)
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => ({ id, count, player: findPlayer(id) }))
})

const showVotePanel = computed(() => {
  return Object.keys(gameState.votes).length > 0 && !gameState.gameOver
})

const voteBarWidth = (count) => {
  const max = Math.max(...voteRanking.value.map(v => v.count), 1)
  return `${Math.round((count / max) * 100)}%`
}

const nightRoleQueue = computed(() => gameState.nightRoleOrder || [])
const nightRoleIdx = computed(() => gameState.currentNightRoleIdx || 0)

const nightRoleIcons = { '狼人': '🐺', '女巫': '🧪', '预言家': '🔮', '守卫': '🛡️' }

const nightRoleIcon = (idx) => {
  const role = gameState.nightRoleOrder[idx]
  return nightRoleIcons[role] || '❓'
}

const playerEmojis = ['🐺', '🧙', '🔮', '🎭', '👻', '🦊', '🐻', '🦉', '🐍', '🦅', '🐗', '🦌']

const getPlayerEmoji = (p) => {
  const seat = typeof p.seat === 'number' ? p.seat : parseInt(p.id) - 1
  return playerEmojis[seat % playerEmojis.length] || '🤖'
}

const addEvent = (icon, content, level = 'info') => {
  const now = new Date()
  const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
  events.value.push({
    id: ++eventIdCounter,
    time,
    icon,
    content,
    level
  })
  if (events.value.length > MAX_LOG) {
    events.value.splice(0, events.value.length - MAX_LOG)
  }
  nextTick(() => {
    if (logRef.value) {
      logRef.value.scrollTop = logRef.value.scrollHeight
    }
  })
}

const findPlayer = (id) => players.value.find(p => String(p.id) === String(id))

const togglePlayerDetail = (id) => {
  const p = findPlayer(id)
  detailPlayer.value = p ? { ...p } : null
}

const syncPhase = (data) => {
  if (data.phase && data.phase !== gameState.phase) {
    const prev = gameState.phase
    gameState.phase = data.phase
    if (data.phase === '夜晚') {
      gameState.votes = {}
      addEvent('🌙', '进入夜晚阶段', 'phase')
    } else if (data.phase === '白天') {
      addEvent('☀️', '天亮了！进入白天阶段', 'phase')
    }
  }
}

const connectWebSocket = () => {
  const token = localStorage.getItem('access_token')
  if (!token || !roomId.value) return

  const wsUrl = `ws://localhost:8000/ws/wolf_game/${roomId.value}?token=${token}`
  ws = new WebSocket(wsUrl)

  ws.onopen = () => {
    wsConnected.value = true
    addEvent('🛜', '已连接到游戏服务器', 'info')
    ws.send(JSON.stringify({ cmd: 'start' }))
    addEvent('📤', '已发送开始指令，等待游戏事件...', 'info')
    gameStarted.value = true
  }

  ws.onclose = () => {
    wsConnected.value = false
    addEvent('🔌', '连接已断开', 'warn')
  }

  ws.onerror = () => {
    wsConnected.value = false
    addEvent('⚠️', '连接错误', 'error')
  }

  ws.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data)
      if (data.type === 'stream') {
        handleStream(data)
      } else {
        handleMessage(data)
      }
    } catch {
      addEvent('⚠️', `无法解析: ${event.data.slice(0, 80)}`, 'warn')
    }
  }
}

const handleMessage = (data) => {
  if (data.type !== 'game_event') return

  syncPhase(data)

  const { event: evt, data: payload } = data

  switch (evt) {
    case 'init_game': return handleInitGame(payload)
    case 'judge_broadcast': return handleJudgeBroadcast(payload)
    case 'process_night_role': return handleNightRole(payload)
    case 'night_resolve': return handleNightResolve(payload)
    case 'start_speech': return handleStartSpeech(payload)
    case 'process_speech': return handleProcessSpeech(payload)
    case 'cast_vote': return handleCastVote(payload)
    case 'vote_resolve': return handleVoteResolve(payload)
    case 'update_memories': return handleUpdateMemories(payload)
    case 'check_winner': return handleCheckWinner(payload)
    case 'game_over': return handleGameOver(payload)
  }
}

const handleInitGame = (data) => {
  gameState.gameOver = false
  gameState.winner = null
  gameState.votes = {}
  gameState.phase = data.phase || ''
  Object.keys(speechStreams).forEach(k => delete speechStreams[k])
  players.value = mergePlayers(data.players || [])
  gameState.nightRoleOrder = data.night_role_order || []
  gameState.nightActions = data.night_actions || {}
  gameState.currentNightRoleIdx = data.current_night_role_idx || 0
  gameState.killedTonight = Array.from(data.killed_tonight || [])
  gameState.votedOut = data.voted_out || ''
  gameState.waitToSpeakQueue = data.wait_to_speak_queue || []
  gameState.waitToVoteQueue = data.wait_to_vote_queue || []
  gameState.votes = data.votes || {}
  gameState.witchAntidote = data.witch_has_antidote !== false
  gameState.witchPoison = data.witch_has_poison !== false
  gameState.gameOver = data.game_over || false
  gameState.winner = data.winner || null

  addEvent('🎮', '游戏初始化完成！', 'system')
  addEvent('📋', `共 ${players.value.length} 名玩家，角色已就位`, 'info')

  const roles = data.available_roles || []
  if (roles.length) {
    addEvent('🎭', `本局角色: ${roles.join('、')}`, 'info')
  }
}

const handleJudgeBroadcast = (data) => {
  const speeches = data.speeches || []
  speeches.forEach(s => {
    addEvent('📢', `${s.content}`, 'broadcast')
  })
}

const handleNightRole = (data) => {
  gameState.nightActions = data.night_actions || {}
  gameState.currentNightRoleIdx = data.current_night_role_idx || 0

  const nightActions = data.night_actions || {}
  const roleOrder = gameState.nightRoleOrder

  if (!roleOrder.length) {
    const keys = Object.keys(nightActions)
    if (keys.length) {
      gameState.nightRoleOrder = keys
    }
  }

  const order = gameState.nightRoleOrder
  const currentIdx = gameState.currentNightRoleIdx

  if (currentIdx > 0 && currentIdx <= order.length) {
    const prevRole = order[currentIdx - 1]
    const roleAction = nightActions[prevRole]

    if (prevRole === '狼人' && roleAction) {
      const kills = Object.entries(roleAction)
      if (kills.length) {
        const targetId = kills[0][1]
        const target = findPlayer(targetId)
        addEvent('🐺', `狼人决定击杀 ${target ? target.name : targetId}`, 'kill')
        highlightedId.value = String(targetId)
        setTimeout(() => { highlightedId.value = null }, 3000)
      }
    } else if (prevRole === '女巫' && roleAction) {
      const witchAction = Object.values(roleAction)[0]
      if (witchAction) {
        if (witchAction.use_antidote) {
          addEvent('🧪', '女巫使用了解药', 'save')
        }
        if (witchAction.use_poison && witchAction.target_id) {
          const target = findPlayer(witchAction.target_id)
          addEvent('☠️', `女巫毒杀了 ${target ? target.name : witchAction.target_id}`, 'kill')
          highlightedId.value = String(witchAction.target_id)
          setTimeout(() => { highlightedId.value = null }, 3000)
        }
      }
      gameState.witchAntidote = !(witchAction && witchAction.use_antidote)
      gameState.witchPoison = !(witchAction && witchAction.use_poison)
    } else if (prevRole === '预言家' && roleAction) {
      const seerAction = Object.values(roleAction)[0]
      if (seerAction) {
        const target = findPlayer(seerAction)
        addEvent('🔮', `预言家查验了 ${target ? target.name : seerAction}，身份: ${target ? target.role : '?'}`, 'info')
        highlightedId.value = String(seerAction)
        setTimeout(() => { highlightedId.value = null }, 2500)
      }
    } else if (prevRole === '守卫' && roleAction) {
      const guardAction = Object.values(roleAction)[0]
      if (guardAction) {
        const target = findPlayer(guardAction)
        addEvent('🛡️', `守卫守护了 ${target ? target.name : guardAction}`, 'info')
        highlightedId.value = String(guardAction)
        setTimeout(() => { highlightedId.value = null }, 2500)
      }
    }
  }

  if (currentIdx < order.length) {
    const nextRole = order[currentIdx]
    addEvent('⏳', `${nextRole} 正在行动...`, 'info')
  }
}

const handleNightResolve = (data) => {
  gameState.nightActions = data.night_actions || {}
  gameState.currentNightRoleIdx = data.current_night_role_idx || 0

  const killedTonight = Array.from(data.killed_tonight || [])
  gameState.killedTonight = killedTonight

  const newPlayers = data.players || []
  if (newPlayers.length) {
    players.value = mergePlayers(newPlayers)
  } else if (killedTonight.length) {
    const killedSet = new Set(killedTonight.map(String))
    players.value = players.value.map(p => {
      if (killedSet.has(String(p.id))) return { ...p, is_alive: false }
      return p
    })
  }

  if (data.wait_to_speak_queue) {
    gameState.waitToSpeakQueue = data.wait_to_speak_queue
  }

  if (killedTonight.length === 0) {
    addEvent('🕊️', '昨晚是平安夜，无人死亡', 'save')
  } else {
    killedTonight.forEach(id => {
      const p = findPlayer(id)
      addEvent('💀', `${p ? p.name : id} 昨晚被杀害了`, 'kill')
    })
  }
}

const handleStartSpeech = (data) => {
  if (data.wait_to_speak_queue) {
    gameState.waitToSpeakQueue = data.wait_to_speak_queue
  }

  const speeches = data.speeches || []
  speeches.forEach(s => {
    const pid = String(s.player_id)
    const p = findPlayer(pid)
    if (p && !p.is_alive) return
    const name = p ? p.name : `玩家${pid}`
    const emoji = p ? getPlayerEmoji(p) : '🗣️'
    speakingId.value = pid

    const eventId = ++eventIdCounter
    const now = new Date()
    const time = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}:${String(now.getSeconds()).padStart(2, '0')}`
    events.value.push({
      id: eventId,
      time,
      icon: emoji,
      content: `${name}: ""`,
      level: 'speech'
    })
    if (events.value.length > MAX_LOG) {
      events.value.splice(0, events.value.length - MAX_LOG)
    }
    speechStreams[pid] = eventId
    nextTick(() => { if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight })
  })
}

const handleStream = (data) => {
  if (data.event === 'speech_token') {
    handleSpeechToken(data.data)
  }
}

const handleSpeechToken = (data) => {
  const pid = String(data.player_id)
  const token = data.token || ''
  const eventId = speechStreams[pid]
  if (!eventId) return

  const idx = events.value.findIndex(e => e.id === eventId)
  if (idx === -1) return

  const evt = events.value[idx]
  const colonIdx = evt.content.indexOf(':')
  const namePart = colonIdx !== -1 ? evt.content.slice(0, colonIdx + 2) : ''
  const currentContent = evt.content.slice(evt.content.indexOf('"') + 1, evt.content.lastIndexOf('"'))
  const newContent = currentContent + token
  events.value[idx] = { ...evt, content: `${namePart}"${newContent}"` }
  nextTick(() => { if (logRef.value) logRef.value.scrollTop = logRef.value.scrollHeight })
}

const handleProcessSpeech = (data) => {
  if (data.wait_to_speak_queue) {
    gameState.waitToSpeakQueue = data.wait_to_speak_queue
  }

  const speeches = data.speeches || []
  speeches.forEach(s => {
    const pid = String(s.player_id)
    const p = findPlayer(pid)
    if (p && !p.is_alive) return
    const name = p ? p.name : `玩家${pid}`
    const emoji = p ? getPlayerEmoji(p) : '🗣️'
    const content = s.content || ''
    speakingId.value = pid
    addEvent(emoji, `${name}: "${content}"`, 'speech')
    setTimeout(() => { speakingId.value = null }, 3000)
  })
}

const handleCastVote = (data) => {
  gameState.votes = data.votes || {}
  if (data.wait_to_vote_queue) {
    gameState.waitToVoteQueue = data.wait_to_vote_queue || []
  }

  const votes = data.votes || {}
  const entries = Object.entries(votes)
  entries.forEach(([voterId, targetId]) => {
    const voter = findPlayer(voterId)
    const target = targetId ? findPlayer(targetId) : null
    if (targetId) {
      addEvent('🗳️', `${voter ? voter.name : voterId} → ${target ? target.name : targetId}`, 'vote')
      highlightedId.value = String(targetId)
      setTimeout(() => { highlightedId.value = null }, 1000)
    } else {
      addEvent('🗳️', `${voter ? voter.name : voterId} 弃权`, 'vote')
    }
  })
}

const handleVoteResolve = (data) => {
  const votedOut = data.voted_out || ''
  gameState.votedOut = String(votedOut)
  gameState.votes = {}
  gameState.waitToVoteQueue = data.wait_to_vote_queue || []
  gameState.nightActions = data.night_actions || {}
  gameState.currentNightRoleIdx = data.current_night_role_idx || 0

  const newPlayers = data.players || []
  if (newPlayers.length) {
    players.value = mergePlayers(newPlayers)
  }

  if (votedOut) {
    const p = findPlayer(votedOut)
    addEvent('💀', `${p ? p.name : votedOut} 被投票放逐！`, 'kill')
    highlightedId.value = String(votedOut)
    setTimeout(() => { highlightedId.value = null }, 4000)
  }
}

const handleUpdateMemories = (data) => {
  if (data.global_memory) {
    gameState.globalMemory = data.global_memory
  }
  const aiMemory = data.ai_player_memory || {}
  Object.entries(aiMemory).forEach(([pid, memories]) => {
    const p = findPlayer(pid)
    if (p) {
      p.memories = memories
    }
  })
}

const mergePlayers = (newPlayers) => {
  const oldMap = {}
  players.value.forEach(p => { oldMap[p.id] = p })
  return newPlayers.map(p => {
    const pid = String(p.id)
    const old = oldMap[pid]
    if (old) {
      return { ...old, ...p, id: pid, memories: old.memories }
    }
    return { ...p, id: pid }
  })
}

const handleCheckWinner = (data) => {
  if (data.game_over === true || data.game_over === 'True') {
    handleGameOver(data)
  }
}

const handleGameOver = (data) => {
  gameState.gameOver = true
  gameState.winner = data.winner
  gameState.phase = '游戏结束'
  gameState.votes = {}
  Object.keys(speechStreams).forEach(k => delete speechStreams[k])

  if (data.players) {
    players.value = mergePlayers(data.players)
  }

  const w = data.winner
  const label = w === 'werewolf' || w === '狼人' ? '🐺 狼人阵营'
    : w === 'villager' || w === '村民' || w === '好人' ? '👥 村民阵营'
    : (w || '未知')
  addEvent('🏁', `游戏结束！${label} 获胜！`, 'system')
}

onMounted(() => {
  roomId.value = route.query.room || ''
  if (!roomId.value) {
    router.push('/')
    return
  }

  gameState.gameOver = false
  gameState.winner = null
  gameState.votes = {}
  gameState.phase = ''
  events.value = []
  Object.keys(speechStreams).forEach(k => delete speechStreams[k])

  if (route.query.players) {
    try {
      const raw = JSON.parse(route.query.players)
      players.value = raw.map((p, i) => ({
        id: String(p.id || i + 1),
        name: p.name || `玩家${i + 1}`,
        role: p.role || '?',
        is_alive: p.is_alive !== false,
        is_human: p.is_human || false,
        seat: p.seat !== undefined ? p.seat : i,
        difficulty: p.difficulty || '',
        strategy: p.strategy || ''
      }))
    } catch {
      players.value = []
    }
  }

  connectWebSocket()
})

onUnmounted(() => {
  if (ws) {
    ws.close()
    ws = null
  }
})

const leaveGame = () => {
  if (ws) {
    ws.close()
    ws = null
  }
  router.push('/')
}
</script>

<style scoped>
.game-page {
  height: 100vh;
  height: 100dvh;
  background: linear-gradient(180deg, #0f0c29 0%, #1a1a3e 100%);
  font-family: 'Press Start 2P', monospace, sans-serif;
  display: flex;
  flex-direction: column;
  color: #fff;
  overflow: hidden;
}

/* ===== TOPBAR ===== */
.game-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0.6rem;
  background: rgba(0, 0, 0, 0.55);
  border-bottom: 2px solid #4a3f8a;
  flex-shrink: 0;
  gap: 0.3rem;
}

.back-btn {
  background: none;
  border: 1px solid #4a3f8a;
  color: #c9c9ff;
  font-family: inherit;
  font-size: 0.4rem;
  padding: 0.25rem 0.45rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.back-btn:hover {
  border-color: #ffd700;
  color: #ffd700;
}

.phase-indicator {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  border-radius: 6px;
  font-size: 0.5rem;
  font-weight: 900;
}

.phase-night { background: rgba(30, 30, 80, 0.8); color: #aab8ff; border: 1px solid #4a5fff; }
.phase-day { background: rgba(80, 60, 20, 0.8); color: #ffd700; border: 1px solid #ffa500; }
.phase-over { background: rgba(80, 20, 20, 0.8); color: #ff8888; border: 1px solid #ff4444; }

.round-info { text-align: right; }

.alive-count {
  color: #00cc66;
  font-size: 0.48rem;
  font-weight: 900;
  background: rgba(0, 200, 100, 0.08);
  padding: 0.2rem 0.4rem;
  border-radius: 4px;
}

/* ===== BODY: 3-COLUMN ===== */
.game-body {
  flex: 1;
  display: flex;
  overflow: hidden;
  min-height: 0;
}

/* ===== PLAYER COLUMNS ===== */
.players-col {
  width: 64px;
  flex-shrink: 0;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 6px 4px;
  background: rgba(0, 0, 0, 0.25);
}

.players-col-left {
  border-right: 1px solid #2a2a4a;
}

.players-col-right {
  border-left: 1px solid #2a2a4a;
}

.players-col::-webkit-scrollbar { width: 2px; }
.players-col::-webkit-scrollbar-thumb { background: #3a3570; border-radius: 2px; }

.player-avatar {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 3px;
  padding: 8px 4px;
  border-radius: 6px;
  border: 2px solid #3a3570;
  background: rgba(0, 0, 0, 0.35);
  cursor: pointer;
  position: relative;
  transition: all 0.25s ease;
  min-height: 56px;
  justify-content: center;
}

.player-avatar:hover {
  border-color: #7a6faa;
  background: rgba(50, 40, 80, 0.5);
}

.player-avatar.speaking {
  border-color: #c0a0ff;
  box-shadow: 0 0 14px rgba(180, 130, 255, 0.55);
  animation: speakGlow 0.8s ease-in-out infinite;
  background: rgba(60, 40, 100, 0.55);
  z-index: 5;
  transform: scale(1.08);
}

.player-avatar.highlighted {
  border-color: #ff5555;
  box-shadow: 0 0 10px rgba(255, 50, 50, 0.5);
  animation: dangerGlow 0.6s ease-in-out infinite;
  z-index: 5;
}

@keyframes speakGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(180, 130, 255, 0.3); }
  50% { box-shadow: 0 0 14px rgba(180, 130, 255, 0.6); }
}

@keyframes dangerGlow {
  0%, 100% { box-shadow: 0 0 6px rgba(255, 50, 50, 0.3); }
  50% { box-shadow: 0 0 16px rgba(255, 50, 50, 0.7); }
}

.avatar-emoji {
  font-size: 1.5rem;
  line-height: 1;
}

.avatar-name {
  font-size: 0.35rem;
  color: #c9c9ff;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 58px;
}

/* dead override — must be LAST in the player-avatar cascade */
.player-avatar.dead {
  opacity: 1 !important;
  border-color: rgba(255, 20, 20, 0.7) !important;
  background: rgba(40, 10, 10, 0.85) !important;
  transform: none !important;
  animation: none !important;
  box-shadow: none !important;
}

.player-avatar.dead::after {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  border: 2px solid rgba(255, 50, 50, 0.9);
  background: linear-gradient(
    135deg,
    transparent 30%,
    rgba(255, 0, 0, 0.35) 30%,
    rgba(255, 0, 0, 0.35) 35%,
    transparent 35%,
    transparent 65%,
    rgba(255, 0, 0, 0.35) 65%,
    rgba(255, 0, 0, 0.35) 70%,
    transparent 70%
  );
  box-shadow: inset 0 0 30px rgba(255, 0, 0, 0.5);
  animation: deadBorder 1.5s ease-in-out infinite;
  pointer-events: none;
  z-index: 1;
}

@keyframes deadBorder {
  0%, 100% { border-color: rgba(255, 50, 50, 0.6); box-shadow: inset 0 0 16px rgba(255, 0, 0, 0.3); background: linear-gradient(135deg, transparent 30%, rgba(255,0,0,0.25) 30%, rgba(255,0,0,0.25) 35%, transparent 35%, transparent 65%, rgba(255,0,0,0.25) 65%, rgba(255,0,0,0.25) 70%, transparent 70%); }
  50% { border-color: rgba(255, 50, 50, 1); box-shadow: inset 0 0 40px rgba(255, 0, 0, 0.7); background: linear-gradient(135deg, transparent 30%, rgba(255,0,0,0.45) 30%, rgba(255,0,0,0.45) 35%, transparent 35%, transparent 65%, rgba(255,0,0,0.45) 65%, rgba(255,0,0,0.45) 70%, transparent 70%); }
}

.player-avatar.dead .avatar-emoji {
  filter: grayscale(1) brightness(0.5) !important;
}

.player-avatar.dead .avatar-name {
  color: #ff4444 !important;
  text-decoration: line-through;
}

.avatar-dead {
  position: absolute;
  top: -4px;
  right: -4px;
  font-size: 0.9rem;
  z-index: 2;
  filter: drop-shadow(0 0 4px rgba(255, 0, 0, 0.8));
  animation: deadCross 1s ease-in-out infinite;
}

@keyframes deadCross {
  0%, 100% { opacity: 0.75; transform: scale(0.95); }
  50% { opacity: 1; transform: scale(1.15); }
}

.avatar-speaking {
  position: absolute;
  top: -2px;
  left: -2px;
  font-size: 0.5rem;
  animation: bounceBadge 0.5s ease-in-out infinite alternate;
}

@keyframes bounceBadge {
  from { transform: scale(1); }
  to { transform: scale(1.2); }
}

/* detail overlay modal */
.detail-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(2px);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 16px;
}

.detail-modal {
  background: #1a1a2e;
  border: 2px solid #4a3f8a;
  border-radius: 10px;
  padding: 16px;
  max-width: 360px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  position: relative;
  box-shadow: 0 12px 36px rgba(0, 0, 0, 0.6);
}

.detail-close {
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: 1px solid #555;
  color: #888;
  font-size: 0.6rem;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.detail-close:hover {
  border-color: #ff5555;
  color: #ff5555;
}

.detail-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
}

.detail-emoji {
  font-size: 1.6rem;
}

.detail-name {
  font-size: 0.55rem;
  color: #fff;
  font-weight: 900;
  flex: 1;
}

.detail-dead-tag {
  font-size: 0.35rem;
  color: #ff4444;
  background: rgba(255, 0, 0, 0.1);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 800;
}

.detail-grid {
  display: flex;
  flex-direction: column;
  gap: 6px;
  margin-bottom: 12px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
}

.detail-label {
  font-size: 0.3rem;
  color: #666;
}

.detail-value {
  font-size: 0.3rem;
  font-weight: 800;
  padding: 1px 4px;
  border-radius: 2px;
}

.detail-value.role { color: #ffd700; }
.detail-value.diff { background: rgba(255, 165, 0, 0.15); color: #ffa500; }
.detail-value.strategy { background: rgba(140, 80, 255, 0.15); color: #9f5fff; }

.detail-memories {
  border-top: 1px solid #2a2a4a;
  padding-top: 10px;
}

.detail-memories-title {
  font-size: 0.35rem;
  color: #aab8ff;
  font-weight: 800;
  margin-bottom: 6px;
}

.memory-entry {
  font-size: 0.32rem;
  color: #b0b0d0;
  padding: 3px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  margin-bottom: 3px;
  line-height: 1.5;
  word-break: break-all;
}

.detail-no-memories {
  border-top: 1px solid #2a2a4a;
  padding-top: 10px;
  font-size: 0.3rem;
  color: #444;
  text-align: center;
}

.modal-enter-active { transition: all 0.25s ease; }
.modal-leave-active { transition: all 0.2s ease; }
.modal-enter-from,
.modal-leave-to { opacity: 0; }
.modal-enter-from .detail-modal,
.modal-leave-to .detail-modal { transform: scale(0.92); }

/* ===== CENTER ===== */
.center-area {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  min-width: 0;
}

.center-panel {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  padding: 8px 6px;
  gap: 6px;
}

.game-over-banner {
  text-align: center;
  padding: 12px 8px;
  background: linear-gradient(135deg, rgba(255, 200, 0, 0.1), rgba(255, 150, 0, 0.05));
  border: 2px solid #ffd700;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex-shrink: 0;
}

.gob-icon { font-size: 1.6rem; }

.gob-text {
  font-size: 0.55rem;
  color: #ffd700;
  font-weight: 900;
}

.phase-banner {
  text-align: center;
  padding: 8px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid #2a2a4a;
  flex-shrink: 0;
}

.phase-big-icon { font-size: 1.3rem; }

.phase-big-text {
  display: block;
  font-size: 0.42rem;
  color: #c9c9ff;
  font-weight: 800;
  margin-top: 3px;
}

.night-progress {
  flex-shrink: 0;
  padding: 6px 4px;
  background: rgba(20, 20, 60, 0.6);
  border-radius: 6px;
  border: 1px solid #3a3a6a;
}

.night-roles {
  display: flex;
  justify-content: center;
  gap: 4px;
  flex-wrap: wrap;
}

.night-chip {
  font-size: 0.3rem;
  padding: 3px 6px;
  border-radius: 4px;
  border: 1px solid #3a3570;
  color: #555;
  transition: all 0.35s ease;
}

.night-chip.done {
  border-color: #00cc66;
  color: #00cc66;
  background: rgba(0, 200, 100, 0.08);
}

.night-chip.active {
  border-color: #ffd700;
  color: #ffd700;
  background: rgba(255, 215, 0, 0.1);
  animation: chipPulse 0.9s ease-in-out infinite;
}

@keyframes chipPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* ===== VOTE PANEL ===== */
.vote-panel {
  flex-shrink: 0;
  padding: 8px 8px;
  background: rgba(30, 20, 10, 0.6);
  border-radius: 8px;
  border: 2px solid #ffa500;
  box-shadow: 0 0 16px rgba(255, 165, 0, 0.15);
}

.vote-panel-title {
  text-align: center;
  font-size: 0.48rem;
  color: #ffd700;
  font-weight: 900;
  margin-bottom: 8px;
}

.vote-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.vote-row {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  transition: background 0.3s ease;
}

.vote-row.top {
  background: rgba(255, 200, 0, 0.08);
  border: 1px solid rgba(255, 200, 0, 0.2);
}

.vote-rank {
  font-size: 0.3rem;
  color: #666;
  width: 18px;
  text-align: center;
  flex-shrink: 0;
}

.vote-row.top .vote-rank {
  color: #ffd700;
}

.vote-emoji {
  font-size: 0.7rem;
  flex-shrink: 0;
}

.vote-name {
  font-size: 0.32rem;
  color: #c9c9ff;
  width: 52px;
  flex-shrink: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.vote-bar-wrap {
  flex: 1;
  height: 10px;
  background: rgba(255, 255, 255, 0.04);
  border-radius: 5px;
  overflow: hidden;
}

.vote-bar {
  display: block;
  height: 100%;
  background: linear-gradient(90deg, #ffa500, #ffd700);
  border-radius: 5px;
  transition: width 0.5s ease;
  min-width: 4px;
}

.vote-row.top .vote-bar {
  background: linear-gradient(90deg, #ff6b00, #ffd700);
}

.vote-count {
  font-size: 0.32rem;
  color: #ffa500;
  font-weight: 900;
  flex-shrink: 0;
  width: 24px;
  text-align: right;
}

.vote-row.top .vote-count {
  color: #ffd700;
}

.vote-empty {
  text-align: center;
  font-size: 0.32rem;
  color: #555;
  padding: 6px 0;
}

/* ===== CENTER LOG ===== */
.center-log {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
  padding: 4px 5px;
  border: 1px solid #1a1a3a;
}

.center-log::-webkit-scrollbar { width: 3px; }
.center-log::-webkit-scrollbar-thumb { background: #4a3f8a; border-radius: 3px; }

.log-empty {
  text-align: center;
  padding: 20px 0;
}

.log-empty-icon { font-size: 1.8rem; }

.log-empty-text {
  display: block;
  color: #555;
  font-size: 0.38rem;
  margin-top: 6px;
}

.log-list {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.log-entry {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.34rem;
  padding: 5px 6px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.02);
  line-height: 1.55;
  word-break: break-all;
}

.log-time {
  color: #3a3a5a;
  font-size: 0.22rem;
  white-space: nowrap;
}

.log-body {
  display: flex;
  align-items: flex-start;
  gap: 4px;
}

.log-icon {
  font-size: 0.5rem;
  flex-shrink: 0;
}

.log-content {
  flex: 1;
  color: #b0b0d0;
}

.log-system { background: rgba(255, 215, 0, 0.06); }
.log-system .log-content { color: #ffd700; font-weight: 800; }

.log-phase { background: rgba(100, 150, 255, 0.06); }
.log-phase .log-content { color: #aab8ff; font-weight: 800; }

.log-broadcast { background: rgba(255, 255, 255, 0.04); }
.log-broadcast .log-content { color: #fff; font-weight: 800; }

.log-kill { background: rgba(255, 50, 50, 0.08); }
.log-kill .log-content { color: #ff6666; }

.log-save { background: rgba(0, 200, 100, 0.06); }
.log-save .log-content { color: #00cc66; }

.log-speech { background: rgba(180, 130, 255, 0.06); }
.log-speech .log-content { color: #c9a0ff; }

.log-vote { background: rgba(255, 200, 0, 0.06); }
.log-vote .log-content { color: #ffc800; }

.log-warn { background: rgba(255, 165, 0, 0.08); }
.log-warn .log-content { color: #ffa500; }

.log-error { background: rgba(255, 50, 50, 0.08); }
.log-error .log-content { color: #ff4444; }

.log-item-enter-active { transition: all 0.35s ease; }
.log-item-enter-from { opacity: 0; transform: translateX(-8px); }

/* ===== BOTTOM ===== */
.game-bottom {
  padding: 4px 8px;
  padding-bottom: max(4px, env(safe-area-inset-bottom));
  background: rgba(0, 0, 0, 0.45);
  border-top: 2px solid #4a3f8a;
  flex-shrink: 0;
}

.ws-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  font-size: 0.32rem;
  color: #555;
}

.ws-dot {
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #ffa500;
  transition: background 0.3s ease;
}

.ws-dot.connected {
  background: #00cc66;
  animation: dotPulse 1.5s ease-in-out infinite;
}

@keyframes dotPulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}

/* ===== RESPONSIVE ===== */
@media (min-width: 480px) {
  .players-col { width: 70px; }
  .avatar-emoji { font-size: 1.6rem; }
  .avatar-name { font-size: 0.38rem; }
  .player-avatar { min-height: 62px; }
  .log-entry { font-size: 0.38rem; }
}

@media (min-width: 768px) {
  .players-col { width: 78px; }
  .player-avatar { min-height: 68px; padding: 10px 5px; }
  .avatar-emoji { font-size: 1.8rem; }
  .avatar-name { font-size: 0.4rem; }
  .center-panel { padding: 10px 12px; }
  .log-entry { font-size: 0.42rem; }
  .phase-big-text { font-size: 0.5rem; }
}
</style>
