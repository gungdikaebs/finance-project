import { ref } from 'vue';

export interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'warning' | 'info';
}

interface ConfirmState extends ConfirmOptions {
  isOpen: boolean;
  resolve?: (value: boolean) => void;
}

const confirmState = ref<ConfirmState>({
  isOpen: false,
  title: '',
  message: '',
  confirmText: 'Konfirmasi',
  cancelText: 'Batal',
  type: 'danger',
});

export function useConfirm() {
  const ask = (options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      confirmState.value = {
        ...options,
        isOpen: true,
        confirmText: options.confirmText || 'Konfirmasi',
        cancelText: options.cancelText || 'Batal',
        type: options.type || 'danger',
        resolve,
      };
    });
  };

  const handleConfirm = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(true);
    }
    confirmState.value.isOpen = false;
  };

  const handleCancel = () => {
    if (confirmState.value.resolve) {
      confirmState.value.resolve(false);
    }
    confirmState.value.isOpen = false;
  };

  return {
    confirmState,
    ask,
    handleConfirm,
    handleCancel,
  };
}
