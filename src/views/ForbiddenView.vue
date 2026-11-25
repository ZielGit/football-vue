<script setup lang="ts">
import EmptyState from '@/components/EmptyState.vue'
</script>

<template>
  <empty-state
    icon="mdi-lock-outline"
    title="No tienes permiso para ver esta sección"
    text="Tu rol no incluye este permiso. Si crees que es un error, pide acceso a un administrador."
  >
    <v-btn color="primary" :to="{ name: 'home' }">Volver al inicio</v-btn>
  </empty-state>
</template>
