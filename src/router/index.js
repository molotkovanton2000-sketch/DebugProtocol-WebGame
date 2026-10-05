import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/difficulty', name: 'difficulty', component: () => import('../views/DifficultyView.vue') },
    { path: '/about', name: 'about', component: () => import('../views/AboutView.vue') },
    { path: '/tutorial', name: 'tutorial', component: () => import('../views/RulesView.vue') },
    { path: '/game', name: 'game', component: () => import('../views/GameView.vue') },
    { path: '/victory', name: 'victory', component: () => import('../views/VictoryView.vue') },
    { path: '/defeat', name: 'defeat', component: () => import('../views/DefeatView.vue') },
    { path: '/:pathMatch(.*)*', redirect: '/' },
  ],
})

export default router
