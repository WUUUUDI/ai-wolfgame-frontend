import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import Game from '../views/Game.vue'
import CreateRoom from '../views/CreateRoom.vue'
import GameRoom from '../views/GameRoom.vue'

const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home
  },
  {
    path: '/game',
    name: 'Game',
    component: Game
  },
  {
    path: '/create-room',
    name: 'CreateRoom',
    component: CreateRoom
  },
  {
    path: '/game-room',
    name: 'GameRoom',
    component: GameRoom
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router