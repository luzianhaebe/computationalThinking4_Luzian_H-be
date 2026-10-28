<script setup lang="ts">
import { Bold } from '@lucide/vue'

const value = defineModel<boolean>({ required: true })
</script>

<template>
  <Toggle :model-value="value" aria-label="Fett" @update:model-value="value = $event">
    <Bold />
  </Toggle>
</template>
