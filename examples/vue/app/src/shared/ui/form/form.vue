<!-- eslint-disable vue/multi-word-component-names -->
<script setup lang="ts">
import { computed } from 'vue';


interface IFormProps {
  onSubmit: () => void
  onReset?: () => void

  disabled?: boolean
  done?: boolean
}

const props = defineProps<IFormProps>();
const buttonLabel = computed(() => {
  if (props.disabled) {
    return props.done === undefined ? 'Connect' : (props.done ? 'Connected' : 'Connecting...');
  } else {
    return 'Connect';
  }
});

</script>

<template>
  <div class="form">
    <slot 
      v-for="(_, slotName) in $slots" 
      :name="slotName" 
      :disabled="disabled" 
    ></slot>

    <div class="buttons">
      <button 
        class="button" 
        :class="{'button--disactive': disabled, 'button--active': !disabled}" 
        @click="onSubmit"
        :disabled="disabled"
      >
        {{ buttonLabel }}
      </button>

      <button
        v-if="done && onReset"
        class="button button--reset"
        @click="onReset"
      >
        Clear & Reset
      </button>
    </div>
  </div>
</template>

<style>
@import './form.css';
</style>