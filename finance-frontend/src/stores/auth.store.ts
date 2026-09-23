import { defineStore } from 'pinia';
import api from '../api/axios';

interface AuthUser {
    id: number;
    name: string;
    email: string;
}

export const useAuthStore = defineStore('auth', {
    state: () => ({
        token: localStorage.getItem('token') || null,
        user: null as AuthUser | null,
    }),

    actions: {
        async fetchUser() {
            if (!this.token) {
                this.user = null;
                return;
            }

            const res = await api.get<{ data: AuthUser }>('/auth/me');
            this.user = res.data.data;
        },

        async login(email: string, password: string) {
            const res = await api.post('/auth/login', {
                email,
                password,
            });

            this.token = res.data.data.token;
            if (this.token) {
                localStorage.setItem('token', this.token);
                try {
                    await this.fetchUser();
                } catch (error) {
                    this.logout();
                    throw error;
                }
            }
        },

        logout() {
            this.token = null;
            this.user = null;
            localStorage.removeItem('token');
        },
    },
});
