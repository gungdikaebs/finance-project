import { createRouter, createWebHistory } from 'vue-router';
import Landing from '../pages/Landing.vue';

const routes = [
    { path: '/', component: Landing },
    { path: '/about', component: () => import('../pages/About.vue') },
    { path: '/login', component: () => import('../pages/Login.vue') },
    { path: '/register', redirect: '/login?mode=register' },
    { path: '/dashboard', component: () => import('../pages/Dashboard.vue') },
];

const router = createRouter({
    history: createWebHistory(),
    routes,
    scrollBehavior(to, _from, savedPosition) {
        if (savedPosition) return savedPosition;
        if (to.hash) return { el: to.hash, behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' };
        return { top: 0 };
    },
});

export default router;
