import { ref } from 'vue';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  type: ToastType;
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<ToastItem[]>([]);

export function useToast() {
  const show = (type: ToastType, message: string, title?: string, duration = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    const item: ToastItem = { id, type, title, message, duration };
    toasts.value.push(item);

    if (duration > 0) {
      setTimeout(() => {
        dismiss(id);
      }, duration);
    }
    return id;
  };

  const dismiss = (id: string) => {
    const idx = toasts.value.findIndex((t) => t.id === id);
    if (idx !== -1) {
      toasts.value.splice(idx, 1);
    }
  };

  const success = (message: string, title?: string, duration?: number) =>
    show('success', message, title, duration);

  const error = (message: string, title?: string, duration?: number) =>
    show('error', message, title, duration);

  const warning = (message: string, title?: string, duration?: number) =>
    show('warning', message, title, duration);

  const info = (message: string, title?: string, duration?: number) =>
    show('info', message, title, duration);

  return {
    toasts,
    show,
    dismiss,
    success,
    error,
    warning,
    info,
  };
}
