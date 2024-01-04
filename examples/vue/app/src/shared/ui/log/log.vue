<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface IPrintLogProps {
  items: unknown[]
}

const props = defineProps<IPrintLogProps>();
</script>

<template>
  <div class="logs">
    <template 
      v-for="item in items"
      :key="item"
    >
      <div class="logs__item log">
        {{ typeof item  === 'string' ? item : JSON.stringify(item, null, 2) }}
      </div>
    </template>
  </div> 
</template>

<style>
@import './log.css';
</style>