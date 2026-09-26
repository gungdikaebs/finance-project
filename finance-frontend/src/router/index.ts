import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../pages/Landing.vue';

const routes = [
    { path: '/', component: Landing },
    { path: '/login', component: () => import('../pages/Login.vue') },
    { path: '/register', redirect: '/login?mode=register' },
    { path: '/dashboard', component: () => import('../pages/Dashboard.vue') },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
});

export default router;
