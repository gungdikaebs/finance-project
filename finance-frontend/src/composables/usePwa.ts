import { ref, computed } from 'vue';
import { registerSW } from 'virtual:pwa-register';

// Check if running as standalone PWA
const isStandalone = () => {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true
  );
};

const isIosDevice = () => {
  if (typeof window === 'undefined') return false;
  const userAgent = window.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(userAgent);
};

const deferredPrompt = ref<any>(null);
const isInstalled = ref(isStandalone());
const isIOS = ref(isIosDevice());
const showIosInstructions = ref(false);
const needRefresh = ref(false);

let updateSW: ((reloadPage?: boolean) => Promise<void>) | null = null;

if (typeof window !== 'undefined') {
  // Capture native install prompt (Chrome, Edge, Android)
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt.value = e;
  });

  // Track appinstalled event
  window.addEventListener('appinstalled', () => {
    isInstalled.value = true;
    deferredPrompt.value = null;
  });

  // Register service worker with auto/manual update handling
  try {
    updateSW = registerSW({
      onNeedRefresh() {
        needRefresh.value = true;
      },
      onOfflineReady() {
        // App is ready to work offline
      },
    });
  } catch (err) {
    // Ignore in unsupported environments
  }
}

export function usePwa() {
  const canInstall = computed(() => {
    if (isInstalled.value) return false;
    // Android/Desktop: deferredPrompt exists
    // iOS: isIOS is true and not yet installed
    return deferredPrompt.value !== null || isIOS.value;
  });

  const installApp = async () => {
    if (deferredPrompt.value) {
      deferredPrompt.value.prompt();
      const choiceResult = await deferredPrompt.value.userChoice;
      if (choiceResult.outcome === 'accepted') {
        isInstalled.value = true;
      }
      deferredPrompt.value = null;
    } else if (isIOS.value) {
      showIosInstructions.value = true;
    }
  };

  const closeIosInstructions = () => {
    showIosInstructions.value = false;
  };

  const reloadApp = () => {
    if (updateSW) {
      updateSW(true);
    } else {
      window.location.reload();
    }
  };

  return {
    canInstall,
    isInstalled,
    isIOS,
    showIosInstructions,
    needRefresh,
    installApp,
    closeIosInstructions,
    reloadApp,
  };
}
