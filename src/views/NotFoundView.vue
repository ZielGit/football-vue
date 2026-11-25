<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <v-main class="d-flex align-center justify-center" style="min-height: 100vh">
    <empty-state icon="mdi-map-marker-question-outline" title="Página no encontrada" text="La dirección no existe.">
      <v-btn color="primary" :to="{ name: 'home' }">Ir al inicio</v-btn>
    </empty-state>
  </v-main>
</template>
