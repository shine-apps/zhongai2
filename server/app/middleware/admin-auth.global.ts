export default defineNuxtRouteMiddleware((to) => {
  // Only guard admin routes (except login page)
  if (!to.path.startsWith('/admin') || to.path === '/admin/login') {
    return
  }

  if (import.meta.client) {
    const token = localStorage.getItem('admin_token')
    if (!token) {
      return navigateTo('/admin/login')
    }
  }
})
