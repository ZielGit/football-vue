<script setup lang="ts">
defineProps<{ message: string; retryable?: boolean }>()
defineEmits<{ retry: [] }>()
</script>

<template>
  <v-alert type="error" variant="tonal" class="mb-4" icon="mdi-alert-circle-outline">
    <div class="d-flex flex-wrap align-center ga-2">
      <span class="flex-grow-1">{{ message }}</span>
      <v-btn v-if="retryable !== false" size="small" variant="outlined" @click="$emit('retry')">Reintentar</v-btn>
    </div>
  </v-alert>
</template>
