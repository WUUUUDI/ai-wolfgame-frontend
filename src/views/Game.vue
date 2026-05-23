<template>
  <div class="game-screen">
    <section class="upper-stage">
      <header class="hud-top">
        <button type="button" class="icon-square icon-back" @click="leaveGame">←</button>
        <div class="hud-room">
          <div class="hud-mode">{{ tableTitle }}</div>
          <div class="hud-room-id">房间号: {{ roomId || '--' }}</div>
        </div>
        <div class="hud-phase" :class="phaseClass">
          <div class="hud-phase-round">{{ phaseRoundText }}</div>
          <div class="hud-phase-name">{{ phaseStageName }}</div>
        </div>
        <div class="hud-tools">
          <div class="icon-square">⚙</div>
          <div class="icon-square">⋯</div>
        </div>
      </header>

      <section class="battlefield">
        <aside class="seat-column">
          <button
            v-for="player in leftPlayers"
            :key="player.id"
            type="button"
            :class="['seat-card', 'seat-card-left', { dead: !player.is_alive, speaking: speakingId === player.id, highlighted: highlightedId === player.id }]"
            @click="togglePlayerDetail(player.id)"
          >
            <span class="seat-badge">{{ playerSeatNumber(player) }}</span>
            <span class="seat-avatar">
              <img :src="playerAvatarSrc(player)" :alt="displaySeatPlayerName(player)" class="seat-avatar-image" />
              <span class="seat-role" :class="roleColorClass(player)">{{ displayPlayerRole(player) }}</span>
            </span>
            <span class="seat-name">{{ displaySeatPlayerName(player) }}</span>
            <span v-if="speakingId === player.id" class="seat-speak-mark">🎙</span>
          </button>
        </aside>

        <main class="stage-area">
          <div class="stage-banner">{{ phaseNoticeText }}</div>

          <div v-if="showVotePanel" class="stage-vote-panel">
            <div class="stage-vote-title">投票列表</div>
            <div class="stage-vote-list">
              <div
                v-for="entry in voteRanking"
                :key="entry.id"
                :class="['stage-vote-item', { eliminated: String(gameState.votedOut) === String(entry.id) }]"
              >
                <span class="stage-vote-player">{{ entry.player ? displaySeatPlayerName(entry.player) : `玩家${entry.id}` }}</span>
                <span class="stage-vote-count">{{ entry.count }}票</span>
              </div>
            </div>
            <div v-if="gameState.votedOut" class="stage-vote-result">
              已出局：{{ displaySeatPlayerName(findPlayer(gameState.votedOut) || { id: gameState.votedOut }) }}
            </div>
          </div>

          <div class="night-flow" v-else-if="gameState.phase === '夜晚' && nightRoleQueue.length">
            <span
              v-for="(role, idx) in nightRoleQueue"
              :key="`${role}-${idx}`"
              :class="['night-flow-chip', { done: idx < nightRoleIdx, active: idx === nightRoleIdx }]"
            >
              {{ nightRoleIcon(idx) }} {{ role }}
            </span>
          </div>

          <div class="stage-visual"></div>
        </main>

        <aside class="seat-column">
          <button
            v-for="player in rightPlayers"
            :key="player.id"
            type="button"
            :class="['seat-card', 'seat-card-right', { dead: !player.is_alive, speaking: speakingId === player.id, highlighted: highlightedId === player.id }]"
            @click="togglePlayerDetail(player.id)"
          >
            <span class="seat-badge">{{ playerSeatNumber(player) }}</span>
            <span class="seat-avatar">
              <img :src="playerAvatarSrc(player)" :alt="displaySeatPlayerName(player)" class="seat-avatar-image" />
              <span class="seat-role" :class="roleColorClass(player)">{{ displayPlayerRole(player) }}</span>
            </span>
            <span class="seat-name">{{ displaySeatPlayerName(player) }}</span>
            <span v-if="speakingId === player.id" class="seat-speak-mark">🎙</span>
          </button>
        </aside>
      </section>
    </section>

    <section class="action-panel">
      <div class="action-portrait">
        <span class="action-portrait-icon">{{ currentActionIcon }}</span>
      </div>
      <div class="action-main">
        <div class="action-title">{{ currentActionTitle }}</div>
        <div class="action-subtitle">{{ currentActionSubtitle }}</div>
        <div class="action-progress">
          <span v-for="(active, idx) in actionDots" :key="idx" :class="['action-dot', { active }]"></span>
        </div>
      </div>
      <div class="action-side">
        <span class="action-side-icon">{{ currentActionSideIcon }}</span>
        <span class="action-side-text">{{ currentActionButtonText }}</span>
      </div>
    </section>

    <section class="message-panel">
      <div class="message-board" ref="logRef">
        <div v-if="events.length === 0" class="message-empty">
          <span class="message-empty-icon">🐺</span>
          <span class="message-empty-text">等待游戏开始...</span>
        </div>
        <TransitionGroup name="message-item" tag="div" class="message-list">
          <div v-for="evt in events" :key="evt.id" :class="['message-row', `message-${evt.level}`]">
            <span class="message-prefix">{{ eventLabel(evt) }}</span>
            <span class="message-content">{{ evt.content }}</span>
          </div>
        </TransitionGroup>
      </div>
      <button type="button" class="quick-speak-btn" @click="fillQuickMessage">快捷发言</button>
    </section>

    <footer class="chat-bar">
      <input
        v-model="chatDraft"
        type="text"
        class="chat-input"
        placeholder="输入你想说的话..."
        @keyup.enter="sendLocalMessage"
      />
      <button type="button" class="chat-send" @click="sendLocalMessage">发送</button>
      <button type="button" class="chat-extra" title="送礼">🎁</button>
      <button type="button" class="chat-extra" title="表情">😊</button>
    </footer>

    <Teleport to="body">
      <Transition name="modal">
        <div v-if="detailPlayer" class="detail-overlay" @click.self="detailPlayer = null">
          <div class="detail-modal">
            <button type="button" class="detail-close" @click="detailPlayer = null">✕</button>
            <div class="detail-header">
              <span class="detail-avatar">
                <img :src="playerAvatarSrc(detailPlayer)" :alt="displayPlayerName(detailPlayer)" class="detail-avatar-image" />
              </span>
              <div class="detail-title-wrap">
                <div class="detail-title">{{ displayPlayerName(detailPlayer) }}</div>
                <div class="detail-subtitle" :class="roleColorClass(detailPlayer)">{{ displayPlayerRole(detailPlayer) }}</div>
              </div>
              <span v-if="!detailPlayer.is_alive" class="detail-dead-tag">已死亡</span>
            </div>
            <div class="detail-grid">
              <div class="detail-item">
                <span class="detail-label">座位</span>
                <span class="detail-value">{{ playerSeatNumber(detailPlayer) }}号</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">难度</span>
                <span class="detail-value">{{ detailPlayer.difficulty || '-' }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">策略</span>
                <span class="detail-value">{{ detailPlayer.strategy || '-' }}</span>
              </div>
            </div>
            <div v-if="detailPlayer.memories && detailPlayer.memories.length" class="detail-memory-list">
              <div class="detail-memory-title">记忆</div>
              <div v-for="(memory, idx) in detailPlayer.memories" :key="idx" class="detail-memory-item">
                {{ memory }}
              </div>
            </div>
            <div v-else class="detail-empty">暂无记忆内容</div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted, nextTick } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const avatarModules = import.meta.glob('../assets/avatar_*.gif', { eager: true, import: 'default' })
const avatarSources = Object.entries(avatarModules)
  .sort((a, b) => {
    const aNum = Number(a[0].match(/avatar_(\d+)\.gif$/)?.[1] || 0)
    const bNum = Number(b[0].match(/avatar_(\d+)\.gif$/)?.[1] || 0)
    return aNum - bNum
  })
  .map(([, src]) => src)

const roomId = ref('')
const wsConnected = ref(false)
const events = ref([])
const logRef = ref(null)
const detailPlayer = ref(null)
const speakingId = ref(null)
const highlightedId = ref(null)
const gameStarted = ref(false)
const phaseStep = ref(1)
const chatDraft = ref('')

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
  winner: null,
  globalMemory: ''
})

const players = ref([])

const getSeatIndex = (player, fallback = 0) => {
  if (typeof player?.seat === 'number') return player.seat
  const numericId = parseInt(player?.id, 10)
  if (!Number.isNaN(numericId) && numericId > 0) return numericId - 1
  return fallback
}

const sortedPlayers = computed(() => {
  return [...players.value]
    .map((player, index) => ({ ...player, seat: getSeatIndex(player, index) }))
    .sort((a, b) => getSeatIndex(a) - getSeatIndex(b))
})

const leftPlayers = computed(() => {
  const half = Math.ceil(sortedPlayers.value.length / 2)
  return sortedPlayers.value.slice(0, half)
})

const rightPlayers = computed(() => {
  const half = Math.ceil(sortedPlayers.value.length / 2)
  return sortedPlayers.value.slice(half).reverse()
})

const aliveCount = computed(() => players.value.filter(p => p.is_alive).length)
const tableTitle = computed(() => `${players.value.length || 0}人标准场`)

const phaseClass = computed(() => {
  if (gameState.gameOver) return 'phase-over'
  if (gameState.phase === '夜晚') return 'phase-night'
  if (gameState.phase === '白天') return 'phase-day'
  return 'phase-wait'
})

const phaseStageName = computed(() => {
  if (gameState.gameOver) return '结算阶段'
  if (gameState.phase === '夜晚') return '夜晚阶段'
  if (gameState.phase === '白天') return '白天阶段'
  return '等待阶段'
})

const phaseRoundText = computed(() => {
  if (gameState.gameOver) return '终局'
  if (gameState.phase === '夜晚') return `第${phaseStep.value}夜`
  if (gameState.phase === '白天') return `第${phaseStep.value}天`
  return '准备中'
})

const winnerText = computed(() => {
  const w = gameState.winner
  if (w === 'werewolf' || w === '狼人') return '狼人阵营'
  if (w === 'villager' || w === '村民' || w === '好人') return '好人阵营'
  return w || '未知阵营'
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

const nightRoleQueue = computed(() => gameState.nightRoleOrder || [])
const nightRoleIdx = computed(() => gameState.currentNightRoleIdx || 0)
const currentSpeaker = computed(() => findPlayer(speakingId.value))
const currentNightRole = computed(() => nightRoleQueue.value[nightRoleIdx.value] || '')

const nightRoleIcons = { '狼人': '🐺', '女巫': '🧪', '预言家': '🔮', '守卫': '🛡️' }

const nightRoleIcon = (idx) => {
  const role = gameState.nightRoleOrder[idx]
  return nightRoleIcons[role] || '❓'
}

const playerEmojis = ['🐺', '🧙', '🔮', '�', '🎭', '🛡', '🐻', '🦉', '🐍', '🦅', '🐗', '🦌']

const getPlayerEmoji = (p) => {
  const seat = getSeatIndex(p)
  return playerEmojis[seat % playerEmojis.length] || '🤖'
}

const playerSeatNumber = (player) => getSeatIndex(player) + 1

const displayPlayerName = (player) => player?.name || `玩家${playerSeatNumber(player)}`
const displaySeatPlayerName = (player) => `玩家${playerSeatNumber(player)}`
const playerAvatarSrc = (player) => {
  if (!avatarSources.length) return ''
  const index = Math.max(playerSeatNumber(player) - 1, 0) % avatarSources.length
  return avatarSources[index]
}

const displayPlayerRole = (player) => {
  if (!player) return '?'
  return player.role || '?'
}

const roleColors = {
  '狼人': 'role-werewolf',
  '平民': 'role-villager',
  '女巫': 'role-witch',
  '猎人': 'role-hunter',
  '守卫': 'role-guard',
  '预言家': 'role-seer'
}

const roleColorClass = (player) => {
  const role = player?.role
  return roleColors[role] || ''
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

const eventLabel = (evt) => {
  if (evt.level === 'system') return '系统'
  if (evt.level === 'phase') return '阶段'
  if (evt.level === 'broadcast') return '法官'
  if (evt.level === 'speech') return '发言'
  if (evt.level === 'vote') return '投票'
  if (evt.level === 'kill') return '出局'
  if (evt.level === 'save') return '结果'
  if (evt.level === 'warn' || evt.level === 'error') return '告警'
  return '系统'
}

const togglePlayerDetail = (id) => {
  const p = findPlayer(id)
  detailPlayer.value = p ? { ...p } : null
}

const phaseNoticeText = computed(() => {
  if (gameState.gameOver) return `${winnerText.value} 获胜`
  if (gameState.phase === '夜晚') {
    return gameState.killedTonight.length ? `昨夜死亡 ${gameState.killedTonight.length} 人` : '昨夜无人出局'
  }
  if (gameState.phase === '白天') {
    if (gameState.votedOut) {
      const player = findPlayer(gameState.votedOut)
      return `${player ? displayPlayerName(player) : gameState.votedOut} 已出局`
    }
    return '白天讨论与投票中'
  }
  return wsConnected.value ? '等待法官指令' : '正在连接服务器'
})

const currentActionIcon = computed(() => {
  if (gameState.gameOver) return '🏆'
  if (showVotePanel.value) return '🗳️'
  if (currentSpeaker.value) return '🎙️'
  if (gameState.phase === '夜晚') return nightRoleIcons[currentNightRole.value] || '🐺'
  if (gameState.phase === '白天') return '☀️'
  return '⏳'
})

const currentActionTitle = computed(() => {
  if (gameState.gameOver) return '游戏结束'
  if (showVotePanel.value) return '请投出可疑目标'
  if (currentSpeaker.value) return `${displayPlayerName(currentSpeaker.value)} 正在发言`
  if (gameState.phase === '夜晚') return `${currentNightRole.value || '狼人'}请闭眼`
  if (gameState.phase === '白天') return '自由讨论阶段'
  return '等待游戏开始'
})

const currentActionSubtitle = computed(() => {
  if (gameState.gameOver) return `最终结果：${winnerText.value}`
  if (showVotePanel.value) {
    const leader = voteRanking.value[0]
    return leader ? `${leader.player ? displayPlayerName(leader.player) : leader.id} 暂时领先` : '所有存活玩家正在投票'
  }
  if (currentSpeaker.value) return '请留意下方发言与系统播报'
  if (gameState.phase === '夜晚') return '请留意夜间结算信息'
  if (gameState.phase === '白天') return '白天可查看发言、投票和放逐结果'
  return wsConnected.value ? '已建立连接，等待初始化数据' : '连接建立中...'
})

const currentActionButtonText = computed(() => {
  if (gameState.gameOver) return '查看结果'
  if (showVotePanel.value) return '投票中'
  if (currentSpeaker.value) return '发言中'
  if (gameState.phase === '夜晚') return '闭眼中'
  if (gameState.phase === '白天') return '讨论中'
  return '待开始'
})

const currentActionSideIcon = computed(() => {
  if (gameState.gameOver) return '🏁'
  if (showVotePanel.value) return '✓'
  if (currentSpeaker.value) return '…'
  if (gameState.phase === '夜晚') return '🌙'
  if (gameState.phase === '白天') return '☀'
  return '○'
})

const actionDots = computed(() => {
  let activeCount = 3
  if (gameState.gameOver) activeCount = 10
  else if (showVotePanel.value) activeCount = Math.min(Object.keys(gameState.votes || {}).length || 1, 10)
  else if (gameState.phase === '夜晚') activeCount = Math.min((nightRoleIdx.value || 0) + 1, Math.max(nightRoleQueue.value.length, 1))
  else if (gameState.phase === '白天') activeCount = currentSpeaker.value ? 7 : 5
  return Array.from({ length: 10 }, (_, index) => index < activeCount)
})

const fillQuickMessage = () => {
  if (currentSpeaker.value) {
    chatDraft.value = `${displayPlayerName(currentSpeaker.value)} 正在发言。`
    return
  }
  if (showVotePanel.value) {
    chatDraft.value = '当前进入投票阶段。'
    return
  }
  if (gameState.phase === '夜晚') {
    chatDraft.value = '夜晚阶段进行中。'
    return
  }
  chatDraft.value = '请继续观察场上局势。'
}

const sendLocalMessage = () => {
  const content = chatDraft.value.trim()
  if (!content) return
  addEvent('💬', `我: "${content}"`, 'speech')
  chatDraft.value = ''
}

const syncPhase = (data) => {
  if (data.phase && data.phase !== gameState.phase) {
    if (gameState.phase) phaseStep.value += 1
    gameState.phase = data.phase
    if (data.phase === '夜晚') {
      gameState.votes = {}
      addEvent('🌙', '进入夜晚阶段', 'phase')
    } else if (data.phase === '白天') {
      addEvent('☀️', '天亮了，进入白天阶段', 'phase')
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
  phaseStep.value = 1
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
        addEvent('🐺', `狼人决定击杀 ${target ? displayPlayerName(target) : targetId}`, 'kill')
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
          addEvent('☠️', `女巫毒杀了 ${target ? displayPlayerName(target) : witchAction.target_id}`, 'kill')
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
        addEvent('🔮', `预言家查验了 ${target ? displayPlayerName(target) : seerAction}，身份: ${target ? target.role : '?'}`, 'info')
        highlightedId.value = String(seerAction)
        setTimeout(() => { highlightedId.value = null }, 2500)
      }
    } else if (prevRole === '守卫' && roleAction) {
      const guardAction = Object.values(roleAction)[0]
      if (guardAction) {
        const target = findPlayer(guardAction)
        addEvent('🛡️', `守卫守护了 ${target ? displayPlayerName(target) : guardAction}`, 'info')
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
      addEvent('💀', `${p ? displayPlayerName(p) : id} 昨晚被杀害了`, 'kill')
    })
  }
}

const handleStartSpeech = (data) => {
  if (data.wait_to_speak_queue) {
    gameState.waitToSpeakQueue = data.wait_to_speak_queue
  }

  const speeches = data.speeches || []
  // 从发言数据中更新玩家角色身份
  speeches.forEach(s => {
    const pid = String(s.player_id)
    if (s.role) {
      const player = findPlayer(pid)
      if (player) {
        player.role = s.role
      }
    }
  })
  speeches.forEach(s => {
    const pid = String(s.player_id)
    const p = findPlayer(pid)
    if (p && !p.is_alive) return
    const name = p ? displayPlayerName(p) : `玩家${pid}`
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
    const name = p ? displayPlayerName(p) : `玩家${pid}`
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
      addEvent('🗳️', `${voter ? displayPlayerName(voter) : voterId} → ${target ? displayPlayerName(target) : targetId}`, 'vote')
      highlightedId.value = String(targetId)
      setTimeout(() => { highlightedId.value = null }, 1000)
    } else {
      addEvent('🗳️', `${voter ? displayPlayerName(voter) : voterId} 弃权`, 'vote')
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
    addEvent('💀', `${p ? displayPlayerName(p) : votedOut} 被投票放逐！`, 'kill')
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
  return newPlayers.map((p, index) => {
    const pid = String(p.id)
    const old = oldMap[pid]
    if (old) {
      return { ...old, ...p, id: pid, seat: p.seat !== undefined ? p.seat : old.seat, memories: old.memories }
    }
    return { ...p, id: pid, seat: p.seat !== undefined ? p.seat : index }
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
  phaseStep.value = 1
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

.game-screen {
  height: 100vh;
  height: 100dvh;
  display: grid;
  grid-template-rows: minmax(0, 1fr) 80px 118px 38px;
  gap: 5px;
  padding: 5px;
  box-sizing: border-box;
  overflow: hidden;
  color: #f6f1ff;
  background: #070b17;
  font-family: 'Microsoft YaHei', Arial, sans-serif;
}

.upper-stage {
  min-height: 0;
  display: grid;
  grid-template-rows: auto minmax(0, 1fr);
  gap: 4px;
  position: relative;
  padding: 3px;
  border-radius: 16px;
  overflow: hidden;
}

.upper-stage::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(7, 13, 31, 0.36) 0%, rgba(7, 13, 31, 0.18) 38%, rgba(7, 13, 31, 0.56) 100%),
    url('../assets/room-background.png') center top / cover no-repeat;
  z-index: 0;
}

.upper-stage > * {
  position: relative;
  z-index: 1;
}

.hud-top,
.action-panel,
.message-board,
.quick-speak-btn,
.chat-input,
.chat-send,
.chat-extra {
  border: 1px solid rgba(126, 136, 182, 0.22);
  background: linear-gradient(180deg, rgba(19, 28, 54, 0.92) 0%, rgba(12, 17, 37, 0.94) 100%);
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.05), 0 8px 18px rgba(3, 8, 20, 0.28);
}

.hud-top {
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr) auto 64px;
  align-items: center;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 12px;
  backdrop-filter: blur(8px);
}

.icon-square {
  width: 30px;
  height: 30px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 9px;
  border: 1px solid rgba(161, 174, 225, 0.18);
  background: linear-gradient(180deg, rgba(32, 42, 72, 0.96) 0%, rgba(19, 25, 48, 0.96) 100%);
  color: #f5f1ff;
  cursor: pointer;
}

.icon-back {
  cursor: pointer;
}

.hud-room {
  min-width: 0;
}

.hud-mode {
  font-size: 0.84rem;
  font-weight: 700;
  line-height: 1.2;
}

.hud-room-id {
  margin-top: 1px;
  color: rgba(212, 208, 255, 0.72);
  font-size: 0.64rem;
}

.hud-phase {
  min-width: 88px;
  padding: 4px 9px;
  border-radius: 11px;
  text-align: center;
  border: 1px solid rgba(126, 136, 182, 0.22);
  background: #1a2238;
}

.hud-phase-round {
  font-size: 0.66rem;
  font-weight: 700;
}

.hud-phase-name {
  margin-top: 1px;
  font-size: 0.66rem;
  color: rgba(245, 241, 255, 0.84);
}

.hud-tools {
  display: flex;
  justify-content: flex-end;
  gap: 4px;
}

.battlefield {
  min-height: 0;
  display: grid;
  grid-template-columns: 66px minmax(0, 1fr) 66px;
  gap: 4px;
}

.seat-column {
  min-height: 0;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 2px;
}

.seat-card {
  position: relative;
  flex: 1;
  min-height: 0;
  padding: 2px 0 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  border: none;
  border-radius: 0;
  background: transparent;
  color: inherit;
  cursor: pointer;
  overflow: visible;
  box-shadow: none;
}

.seat-avatar {
  width: 48px;
  height: 48px;
  position: relative;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #16182a;
  border: 2px solid #8a634a;
  box-shadow: 0 0 0 1px rgba(39, 24, 28, 0.92), 0 3px 10px rgba(0, 0, 0, 0.36);
}

.seat-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  border-radius: 50%;
}

.seat-card-left .seat-avatar-image {
  transform: scaleX(-1);
}

.seat-badge {
  position: absolute;
  top: 33px;
  min-width: 15px;
  height: 15px;
  padding: 0 1px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #d9a64f 0%, #a96b23 100%);
  color: #fff;
  font-size: 0.48rem;
  font-weight: 800;
  border: 1px solid rgba(64, 37, 10, 0.38);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
  text-shadow:
    -1px 0 #1b1207,
    1px 0 #1b1207,
    0 -1px #1b1207,
    0 1px #1b1207;
  opacity: 0.88;
  z-index: 2;
}

.seat-card-left .seat-badge {
  left: 7px;
}

.seat-card-right .seat-badge {
  right: 7px;
}

.seat-role {
  position: absolute;
  left: 50%;
  bottom: 1px;
  font-size: 0.1rem !important;
  transform: translateX(-50%);
  min-width: 22px;
  padding: 1px 4px;
  border-radius: 999px;
  background: rgba(17, 23, 38, 0.72);
  border: 1px solid rgba(116, 116, 116, 0.18);
  font-size: 0.28rem;
  font-weight: 700;
  color: #bcbec8;
  line-height: 1;
  text-align: center;
  letter-spacing: 0;
  white-space: nowrap;
  z-index: 1;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.6);
  pointer-events: none;
}

/* 角色身份颜色 */
.seat-role.role-werewolf {
  color: #ff4444;
  background: rgba(255, 68, 68, 0.15);
  border-color: rgba(255, 68, 68, 0.4);
}

.seat-role.role-villager {
  color: #4caf50;
  background: rgba(76, 175, 80, 0.15);
  border-color: rgba(76, 175, 80, 0.4);
}

.seat-role.role-witch {
  color: #ab47bc;
  background: rgba(171, 71, 188, 0.15);
  border-color: rgba(171, 71, 188, 0.4);
}

.seat-role.role-hunter {
  color: #ff9800;
  background: rgba(255, 152, 0, 0.15);
  border-color: rgba(255, 152, 0, 0.4);
}

.seat-role.role-guard {
  color: #42a5f5;
  background: rgba(66, 165, 245, 0.15);
  border-color: rgba(66, 165, 245, 0.4);
}

.seat-role.role-seer {
  color: #ffd740;
  background: rgba(255, 215, 64, 0.15);
  border-color: rgba(255, 215, 64, 0.4);
}

.seat-name {
  margin-top: 4px;
  font-size: 0.72rem;
  color: rgba(244, 242, 255, 0.96);
  line-height: 1.1;
  text-align: center;
  font-weight: 700;
}

.seat-speak-mark {
  position: absolute;
  right: 4px;
  top: -1px;
  width: 16px;
  height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  background: rgba(136, 177, 255, 0.16);
  font-size: 0.72rem;
}

.seat-card.speaking {
  opacity: 1;
}

.seat-card.highlighted {
  opacity: 1;
}

.seat-card.speaking .seat-avatar {
  box-shadow: 0 0 0 1px rgba(187, 150, 255, 0.36), 0 0 16px rgba(123, 94, 218, 0.34);
}

.seat-card.highlighted .seat-avatar {
  box-shadow: 0 0 0 1px rgba(255, 122, 107, 0.4), 0 0 16px rgba(255, 122, 107, 0.36);
}

.seat-card.dead {
  opacity: 0.72;
}

.seat-card.dead .seat-role,
.seat-card.dead .seat-name {
  color: rgba(255, 170, 170, 0.82);
}

.stage-area {
  min-height: 0;
  display: grid;
  grid-template-rows: auto auto minmax(0, 1fr);
  gap: 6px;
  padding: 4px 8px 0;
  border-radius: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.stage-banner {
  padding: 6px 10px;
  border-radius: 11px;
  background: rgba(25, 34, 61, 0.78);
  color: rgba(224, 219, 255, 0.9);
  font-size: 0.66rem;
  text-align: center;
  line-height: 1.25;
}

.stage-vote-panel {
  padding: 8px 10px;
  border-radius: 12px;
  background: rgba(12, 19, 40, 0.68);
  border: 1px solid rgba(132, 142, 189, 0.22);
}

.stage-vote-title {
  font-size: 0.62rem;
  font-weight: 700;
  color: #e8ddff;
  text-align: center;
}

.stage-vote-list {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.stage-vote-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 8px;
  border-radius: 999px;
  background: rgba(31, 43, 78, 0.7);
  color: rgba(242, 239, 255, 0.9);
  font-size: 0.58rem;
}

.stage-vote-item.eliminated {
  background: rgba(108, 36, 42, 0.7);
  color: #ffd4d4;
}

.stage-vote-player {
  font-weight: 600;
}

.stage-vote-count {
  color: #ffcf74;
  font-weight: 700;
}

.stage-vote-result {
  margin-top: 7px;
  text-align: center;
  font-size: 0.56rem;
  color: #ffb5b5;
}

.night-flow {
  display: flex;
  justify-content: center;
  gap: 5px;
  flex-wrap: wrap;
}

.night-flow-chip {
  padding: 2px 7px;
  border-radius: 999px;
  font-size: 0.58rem;
  color: rgba(225, 220, 255, 0.76);
  background: #1d2640;
  border: 1px solid rgba(126, 136, 182, 0.22);
}

.night-flow-chip.done {
  color: #92f2bd;
}

.night-flow-chip.active {
  color: #ffd36b;
}

.stage-visual {
  min-height: 0;
  background: transparent;
  border: none;
  box-shadow: none;
}

.action-panel {
  display: grid;
  grid-template-columns: 66px minmax(0, 1fr) 60px;
  gap: 8px;
  padding: 7px 8px;
  border-radius: 14px;
  min-height: 0;
}

.action-portrait {
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(247, 240, 255, 0.92);
  background: linear-gradient(180deg, rgba(36, 20, 32, 0.96) 0%, rgba(25, 17, 40, 0.96) 100%);
  border: 1px solid rgba(181, 87, 106, 0.48);
  box-shadow: inset 0 0 0 1px rgba(255, 116, 116, 0.08);
}

.action-portrait-icon {
  font-size: 1.45rem;
}

.action-main {
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.action-title {
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
}

.action-subtitle {
  margin-top: 3px;
  color: rgba(206, 205, 255, 0.76);
  font-size: 0.6rem;
  line-height: 1.2;
}

.action-progress {
  display: flex;
  gap: 5px;
  margin-top: 7px;
}

.action-dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: rgba(118, 113, 166, 0.5);
}

.action-dot.active {
  background: #ff9461;
}

.action-side {
  align-self: center;
  width: 100%;
  min-height: 100%;
  border-radius: 11px;
  border: 1px solid rgba(126, 136, 182, 0.22);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  background: linear-gradient(180deg, rgba(28, 35, 62, 0.96) 0%, rgba(18, 24, 47, 0.96) 100%);
}

.action-side-icon {
  font-size: 0.82rem;
}

.action-side-text {
  font-size: 0.58rem;
}

.message-panel {
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px;
  gap: 6px;
  align-items: stretch;
}

.message-board {
  min-height: 0;
  overflow: hidden;
  padding: 7px 10px;
  border-radius: 14px;
  background: linear-gradient(180deg, rgba(10, 18, 40, 0.94) 0%, rgba(7, 13, 30, 0.95) 100%);
}

.message-empty {
  padding: 10px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  color: rgba(197, 192, 238, 0.6);
}

.message-empty-icon {
  font-size: 1.4rem;
}

.message-empty-text {
  margin-top: 6px;
  font-size: 0.82rem;
}

.message-list {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.message-row {
  display: flex;
  gap: 5px;
  align-items: flex-start;
  font-size: 0.66rem;
  line-height: 1.22;
  word-break: break-word;
}

.message-prefix {
  flex-shrink: 0;
  font-weight: 700;
}

.message-content {
  color: rgba(239, 240, 255, 0.88);
}

.message-system .message-prefix,
.message-info .message-prefix,
.message-phase .message-prefix { color: #f0be54; }
.message-broadcast .message-prefix { color: #63d0ff; }
.message-speech .message-prefix { color: #9c72ff; }
.message-vote .message-prefix { color: #ffb34d; }
.message-kill .message-prefix,
.message-error .message-prefix { color: #ff7575; }
.message-save .message-prefix { color: #71e0a6; }
.message-warn .message-prefix { color: #ffcf66; }

.quick-speak-btn {
  border-radius: 14px;
  color: #efeaff;
  font-size: 0.62rem;
  align-self: center;
  width: 100%;
  height: 80px;
  padding: 6px 0;
  background: linear-gradient(180deg, rgba(22, 28, 56, 0.96) 0%, rgba(15, 20, 42, 0.96) 100%);
  writing-mode: vertical-rl;
  text-orientation: upright;
  letter-spacing: 0.12em;
}

.chat-bar {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 58px 42px 42px;
  gap: 6px;
  min-height: 0;
}

.chat-input {
  min-width: 0;
  height: 100%;
  padding: 0 10px;
  border-radius: 10px;
  color: #f5f1ff;
  outline: none;
  font-size: 0.68rem;
  border-color: rgba(126, 136, 182, 0.18);
}

.chat-input::placeholder {
  color: rgba(196, 190, 235, 0.42);
}

.chat-send,
.chat-extra {
  height: 100%;
  border-radius: 10px;
  font-size: 0.68rem;
  font-weight: 700;
  color: #f5f1ff;
}

.chat-send {
  background: linear-gradient(180deg, #efb54d 0%, #cf8e2a 100%);
  color: #1f1300;
}

.chat-extra {
  background: linear-gradient(180deg, rgba(31, 41, 72, 0.98) 0%, rgba(20, 27, 50, 0.98) 100%);
  padding: 0;
}

.detail-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  background: #11172a;
  border: 2px solid #8f5f47;
  box-shadow: 0 0 0 2px rgba(39, 24, 28, 0.9);
}

.detail-avatar-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-title {
  font-size: 1.05rem;
  font-weight: 700;
}

.detail-subtitle {
  margin-top: 4px;
  font-size: 0.84rem;
  color: rgba(233, 227, 255, 0.72);
}

.detail-memory-list {
  margin-top: 16px;
}

.detail-memory-title {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 10px;
}

.detail-memory-item {
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(236, 233, 255, 0.82);
}

.detail-memory-item + .detail-memory-item {
  margin-top: 8px;
}

.detail-empty {
  margin-top: 16px;
  color: rgba(202, 197, 240, 0.62);
}

.message-item-enter-active { transition: all 0.25s ease; }
.message-item-enter-from { opacity: 0; transform: translateY(6px); }

@media (max-width: 768px) {
  .battlefield {
    grid-template-columns: 62px minmax(0, 1fr) 62px;
  }

  .action-panel {
    grid-template-columns: 62px minmax(0, 1fr) 54px;
  }
}

@media (max-width: 560px) {
  .game-screen {
    grid-template-rows: minmax(0, 1fr) 76px 112px 36px;
    gap: 4px;
    padding: 4px;
  }

  .hud-top {
    grid-template-columns: 30px minmax(0, 1fr) auto 56px;
    padding: 4px 6px;
  }

  .icon-square {
    width: 26px;
    height: 26px;
    border-radius: 8px;
    font-size: 0.72rem;
  }

  .hud-mode { font-size: 0.78rem; }
  .hud-room-id,
  .hud-phase-round,
  .hud-phase-name,
  .stage-banner,
  .timer-label,
  .action-subtitle,
  .message-row,
  .chat-input,
  .chat-send,
  .chat-extra,
  .quick-speak-btn { font-size: 0.64rem; }

  .stage-vote-title {
    font-size: 0.58rem;
  }

  .stage-vote-item,
  .stage-vote-result {
    font-size: 0.52rem;
  }

  .battlefield {
    grid-template-columns: 58px minmax(0, 1fr) 58px;
    gap: 4px;
  }

  .seat-avatar {
    width: 42px;
    height: 42px;
  }

  .seat-role,
  .seat-name {
    font-size: 0.64rem;
  }

  .seat-role {
    font-size: 0.26rem;
  }

  .action-panel {
    grid-template-columns: 54px minmax(0, 1fr) 48px;
    gap: 6px;
    padding: 6px;
  }

  .action-title {
    font-size: 0.74rem;
  }

  .message-panel {
    grid-template-columns: minmax(0, 1fr) 52px;
  }

  .quick-speak-btn {
    height: 74px;
    font-size: 0.58rem;
  }

  .chat-bar {
    grid-template-columns: minmax(0, 1fr) 52px 38px 38px;
    gap: 4px;
  }

  .chat-input,
  .chat-send,
  .chat-extra {
    height: 100%;
  }
}
</style>
