import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/auth/callback',
      name: 'auth-callback',
      component: () => import('../views/AuthCallback.vue'),
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/Dashboard.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/location/:id',
      name: 'location-detail',
      component: () => import('../views/LocationDetail.vue'),
    },
    {
      path: '/add-location',
      name: 'add-location',
      component: () => import('../views/AddLocation.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/admin',
      name: 'admin',
      component: () => import('../views/Admin.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/invite/:code',
      name: 'invite',
      component: () => import('../views/InviteAccept.vue'),
    },
    {
      path: '/admin/setup',
      name: 'admin-setup',
      component: () => import('../views/AdminSetup.vue'),
      meta: { requiresAuth: true, requiresFirstAdmin: true },
    },
  ],
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Wait for auth to initialize
  if (authStore.loading) {
    await new Promise(resolve => {
      const unwatch = authStore.$subscribe(() => {
        if (!authStore.loading) {
          unwatch()
          resolve(true)
        }
      })
    })
  }

  // Check if route requires authentication
  if (to.meta.requiresAuth && !authStore.isLoggedIn) {
    next('/')
    return
  }

  // Check if route requires admin
  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    next('/')
    return
  }

  // Check if route requires first admin setup
  if (to.meta.requiresFirstAdmin) {
    // This logic will be handled in the component
    next()
    return
  }

  next()
})

export default router
