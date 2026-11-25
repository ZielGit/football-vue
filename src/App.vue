<script setup lang="ts">
import { computed } from 'vue'
import { useNotificationsStore } from '@/stores/notifications'

const notifications = useNotificationsStore()
const open = computed({
  get: () => notifications.current !== null,
  set: (value: boolean) => {
    if (!value) notifications.next()
  },
})
</script>

<template>
  <v-app>
    <router-view />
    <v-snackbar v-model="open" :color="notifications.current?.color" :timeout="5000" location="bottom right" multi-line>
      {{ notifications.current?.text }}
      <template #actions>
        <v-btn variant="text" @click="open = false">Cerrar</v-btn>
      </template>
    </v-snackbar>
  </v-app>
</template>
