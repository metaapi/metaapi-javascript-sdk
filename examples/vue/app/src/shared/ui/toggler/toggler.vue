<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
interface ITogglerProps {
  activeItem?: string;
  className?: string;
  onClickHandler: (value: string) => void;
  items: string[];
  name: string;
}

const props = defineProps<ITogglerProps>();

const handleClick = (value: string) => {
  props.onClickHandler(value);
};
</script>

<template>
  <div :class="['toggler', className || '']">
    <div class="toggler__title">{{ name }}</div>
    <div class="toggler__list">
      <button 
        v-for="item in items" 
        :key="item"
        @click="handleClick(item)"
        :class="['toggler__button', (activeItem === item) ? 'toggler__button--active' : '']"
      >
        {{ item }}
      </button>
    </div>
  </div>
</template>

<style>
@import './toggler.css';
</style>