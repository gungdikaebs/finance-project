<script setup lang="ts">
import { onMounted, onUnmounted, ref } from 'vue';

type GoogleApi = {
  accounts: {
    id: {
      initialize: (options: { client_id: string; callback: (response: { credential?: string }) => void; auto_select: boolean }) => void;
      renderButton: (element: HTMLElement, options: Record<string, string | number>) => void;
    };
  };
};

const emit = defineEmits<{
  credential: [credential: string];
  unavailable: [message: string];
}>();

const container = ref<HTMLElement | null>(null);
const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
let resizeObserver: ResizeObserver | null = null;
let mounted = false;
let googleScriptPromise: Promise<GoogleApi> | null = null;

function getGoogle() {
  return (window as Window & { google?: GoogleApi }).google;
}

function loadGoogleScript(): Promise<GoogleApi> {
  const existing = getGoogle();
  if (existing) return Promise.resolve(existing);
  if (googleScriptPromise) return googleScriptPromise;

  googleScriptPromise = new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client?hl=id';
    script.async = true;
    script.onload = () => {
      const api = getGoogle();
      if (api) resolve(api);
      else reject(new Error('Google Identity Services tidak tersedia'));
    };
    script.onerror = () => {
      script.remove();
      googleScriptPromise = null;
      reject(new Error('Gagal memuat Google Identity Services'));
    };
    document.head.appendChild(script);
  });
  return googleScriptPromise;
}

onMounted(async () => {
  mounted = true;
  if (!clientId || clientId === 'isi-dengan-google-web-client-id') {
    emit('unavailable', 'Masuk dengan Google belum tersedia saat ini. Kamu tetap bisa memakai email dan kata sandi.');
    return;
  }

  try {
    const google = await loadGoogleScript();
    if (!mounted || !container.value) return;
    google.accounts.id.initialize({
      client_id: clientId,
      auto_select: false,
      callback: (response) => {
        if (mounted && response.credential) emit('credential', response.credential);
      },
    });

    let lastWidth = 0;
    const render = () => {
      if (!container.value) return;
      const width = Math.min(Math.floor(container.value.clientWidth), 400);
      if (width === lastWidth) return;
      lastWidth = width;
      container.value.replaceChildren();
      google.accounts.id.renderButton(container.value, {
        type: 'standard',
        theme: document.documentElement.classList.contains('dark') ? 'outline_dark' : 'outline',
        text: 'continue_with',
        size: 'large',
        shape: 'rectangular',
        logo_alignment: 'left',
        locale: 'id',
        width,
      });
    };
    render();
    resizeObserver = new ResizeObserver(render);
    resizeObserver.observe(container.value);
  } catch {
    if (mounted) emit('unavailable', 'Google tidak bisa dimuat saat ini. Gunakan email dan kata sandi.');
  }
});

onUnmounted(() => {
  mounted = false;
  resizeObserver?.disconnect();
});
</script>

<template>
  <div ref="container" class="min-h-10 w-full" aria-label="Lanjutkan dengan Google"></div>
</template>
