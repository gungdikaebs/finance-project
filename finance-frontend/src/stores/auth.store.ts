import { defineStore } from 'pinia';
import api from '../api/axios';

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null as any,
    }),

    actions: {
        async login(email: string, password: string) {
            const res = await api.post('/auth/login', {
                email,
                password,
            });

            this.token = res.data.data.token;
            if (this.token) {
                localStorage.setItem('token', this.token);
            }
        },

        logout() {
            this.token = null;
            localStorage.removeItem('token');
        },
    },
});
