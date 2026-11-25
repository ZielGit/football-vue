<script setup lang="ts">
withDefaults(
  defineProps<{ title: string; text: string; confirmLabel?: string; loading?: boolean }>(),
  { confirmLabel: 'Confirmar', loading: false },
)
const open = defineModel<boolean>({ required: true })
defineEmits<{ confirm: [] }>()
</script>

<template>
  <v-dialog v-model="open" max-width="440">
    <v-card :title="title">
      <v-card-text>{{ text }}</v-card-text>
      <v-card-actions>
        <v-spacer />
        <v-btn variant="text" :disabled="loading" @click="open = false">Cancelar</v-btn>
        <v-btn color="secondary" :loading="loading" @click="$emit('confirm')">{{ confirmLabel }}</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
