<script setup lang="ts">
import ToastContainer from './components/ui/ToastContainer.vue';
import ConfirmModal from './components/ui/ConfirmModal.vue';
</script>

<template>
  <router-view />
  <ToastContainer />
  <ConfirmModal />
</template>

