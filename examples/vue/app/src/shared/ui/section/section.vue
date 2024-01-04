<script setup lang="ts">
interface ISectionProps {
  modifier?: string
}

const props = defineProps<ISectionProps>()

</script>

<template>
  <div :class="['section', modifier ? `section--${modifier}` : '']">
    <slot />
  </div>
</template>

<style>
@import './section.css';
</style>