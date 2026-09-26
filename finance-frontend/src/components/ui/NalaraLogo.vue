<script setup lang="ts">
import { computed } from 'vue';

const props = withDefaults(
  defineProps<{
    size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
    showWordmark?: boolean;
    wordmarkClass?: string;
    variant?: 'auto' | 'light' | 'dark';
    withBadge?: boolean;
  }>(),
  {
    size: 'md',
    showWordmark: false,
    variant: 'auto',
    withBadge: false,
  }
);

const iconDimension = computed(() => {
  if (typeof props.size === 'number') return props.size;
  switch (props.size) {
    case 'xs': return 18;
    case 'sm': return 26;
    case 'md': return 34;
    case 'lg': return 44;
    case 'xl': return 56;
    default: return 34;
  }
});

const badgeDimensionClass = computed(() => {
  if (typeof props.size === 'number') return `w-[${props.size}px] h-[${props.size}px]`;
  switch (props.size) {
    case 'xs': return 'w-7 h-7 rounded-lg';
    case 'sm': return 'w-8 h-8 rounded-xl';
    case 'md': return 'w-10 h-10 rounded-xl';
    case 'lg': return 'w-12 h-12 rounded-2xl';
    case 'xl': return 'w-16 h-16 rounded-3xl';
    default: return 'w-10 h-10 rounded-xl';
  }
});

const badgeBgClass = computed(() => {
  if (!props.withBadge) return '';
  if (props.variant === 'dark') return 'bg-[#16201A] border border-[#243329] shadow-xs';
  if (props.variant === 'light') return 'bg-white border border-emerald-950/10 shadow-xs';
  return 'bg-white dark:bg-[#16201A] border border-emerald-950/10 dark:border-[#243329] shadow-xs';
});

const badgeIconDimension = computed(() => {
  return Math.round(iconDimension.value * 0.82);
});
</script>

<template>
  <div class="inline-flex items-center gap-2.5 select-none" :class="{ 'cursor-pointer': $attrs.onClick }">
    <!-- Icon Container with Badge -->
    <div
      v-if="withBadge"
      class="flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 p-1"
      :class="[badgeDimensionClass, badgeBgClass]"
    >
      <!-- Light Icon -->
      <img
        v-if="variant === 'light' || variant === 'auto'"
        src="/nalara-icon-light.png"
        :width="badgeIconDimension"
        :height="badgeIconDimension"
        alt="Nalara"
        class="object-contain pointer-events-none select-none"
        :class="{ 'dark:hidden': variant === 'auto' }"
        draggable="false"
        loading="eager"
      />
      <!-- Dark Icon -->
      <img
        v-if="variant === 'dark' || variant === 'auto'"
        src="/nalara-icon-dark.png"
        :width="badgeIconDimension"
        :height="badgeIconDimension"
        alt="Nalara"
        class="object-contain pointer-events-none select-none"
        :class="{ 'hidden dark:block': variant === 'auto' }"
        draggable="false"
        loading="eager"
      />
    </div>

    <!-- Standalone Icon (No Badge Box) -->
    <div
      v-else
      class="flex items-center justify-center shrink-0"
    >
      <!-- Light Icon -->
      <img
        v-if="variant === 'light' || variant === 'auto'"
        src="/nalara-icon-light.png"
        :width="iconDimension"
        :height="iconDimension"
        alt="Nalara"
        class="object-contain pointer-events-none select-none"
        :class="{ 'dark:hidden': variant === 'auto' }"
        draggable="false"
        loading="eager"
      />
      <!-- Dark Icon -->
      <img
        v-if="variant === 'dark' || variant === 'auto'"
        src="/nalara-icon-dark.png"
        :width="iconDimension"
        :height="iconDimension"
        alt="Nalara"
        class="object-contain pointer-events-none select-none"
        :class="{ 'hidden dark:block': variant === 'auto' }"
        draggable="false"
        loading="eager"
      />
    </div>

    <!-- Optional Brand Wordmark -->
    <span
      v-if="showWordmark"
      class="font-extrabold tracking-tight"
      :class="wordmarkClass || 'text-sm sm:text-base text-[#18221B] dark:text-[#F0F4F1]'"
    >
      Nalara
    </span>
  </div>
</template>
