<template>
  <div class="default-layout">
    <header class="layout-header">
      <h1 class="app-title">众爱联盟</h1>
    </header>
    <main class="layout-main">
      <slot />
    </main>
  </div>
</template>

<style scoped>
.default-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.layout-header {
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e4e7ed;
}

.app-title {
  margin: 0;
  font-size: 20px;
  color: #303133;
}

.layout-main {
  flex: 1;
  padding: 24px;
}
</style>
