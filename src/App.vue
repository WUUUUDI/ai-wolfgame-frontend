<script setup>
import Header from './components/Header.vue'
</script>

<template>
  <div class="app-container">
    <Header />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

#app {
  width: 100%;
  min-height: 100vh;
  margin: 0;
  padding: 0;
}

.app-container {
  min-height: 100vh;
  width: 100%;
  margin: 0;
  padding: 0;
}

.main-content {
  width: 100%;
  margin: 0;
  padding: 0;
}
</style>