<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'

const props = withDefaults(defineProps<{ label?: string; delay?: number }>(), { label: 'Buscar', delay: 400 })
const model = defineModel<string>({ default: '' })

const local = ref(model.value)
let timer: number | undefined

watch(local, (value) => {
  window.clearTimeout(timer)
  timer = window.setTimeout(() => (model.value = value), props.delay)
})
watch(model, (value) => {
  if (value !== local.value) local.value = value
})
onBeforeUnmount(() => window.clearTimeout(timer))
</script>

<template>
  <v-text-field
    v-model="local"
    :label="label"
    prepend-inner-icon="mdi-magnify"
    clearable
    hide-details
  />
</template>
