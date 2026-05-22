import axios from 'axios'

const API_BASE_URL = 'http://localhost:8000/api/v1'

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
})

api.interceptors.request.use(
  (config) => {
    const accessToken = localStorage.getItem('access_token')
    if (accessToken) {
      config.headers.Authorization = `Bearer ${accessToken}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => {
    const responseData = response.data
    if (responseData && typeof responseData === 'object') {
      if (responseData.code !== undefined && responseData.code !== 200) {
        const error = new Error(responseData.message || 'Request failed')
        error.code = responseData.code
        error.response = response
        return Promise.reject(error)
      }
      if (responseData.code === 200) {
        return responseData
      }
    }
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('access_token')
      localStorage.removeItem('user')
      window.location.href = '/'
    }
    return Promise.reject(error)
  }
)

export const authApi = {
  login: async (username, password) => {
    const response = await api.post('/auth/login', {
      username,
      password
    })
    return response
  },

  register: async (username, password, email) => {
    const response = await api.post('/auth/register', {
      username,
      password,
      email
    })
    return response
  },

  logout: () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('user')
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user')
    return user ? JSON.parse(user) : null
  },

  isLoggedIn: () => {
    return !!localStorage.getItem('access_token')
  }
}

export const roomApi = {
  createRoom: async (players) => {
    const response = await api.post('/game/room/create', {
      players
    })
    return response
  }
}

export default api