<script setup lang="ts">
import ToastContainer from './components/ui/ToastContainer.vue';
import ConfirmModal from './components/ui/ConfirmModal.vue';
// import PwaInstallBanner from './components/ui/PwaInstallBanner.vue';
</script>

<template>
  <router-view />
  <ToastContainer />
  <ConfirmModal />
  <!-- <PwaInstallBanner /> - Sementara dinonaktifkan -->
</template>


