<script setup lang="ts">
withDefaults(defineProps<{ icon?: string; title: string; text?: string }>(), { icon: 'mdi-database-off-outline' })
</script>

<template>
  <div class="text-center py-10 px-4">
    <v-icon :icon="icon" size="56" color="medium-emphasis" class="mb-3" />
    <h2 class="text-h6">{{ title }}</h2>
    <p v-if="text" class="text-body-2 text-medium-emphasis mt-1">{{ text }}</p>
    <div class="mt-4"><slot /></div>
  </div>
</template>
