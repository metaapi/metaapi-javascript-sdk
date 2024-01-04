<script setup lang="ts">
export interface IFieldProps {
  label: string
  onChange: (value: string) => void
  value: string
  disabled?: boolean
}

const props = defineProps<IFieldProps>();
const handleInput = (event: Event) => props.onChange((event.target as HTMLInputElement).value);
</script>

<template>
  <label class="field">
    <span>{{label}}</span>
    <input
      :value="value" 
      @input="handleInput" 
      :disabled="disabled" 
      type="text" 
    />
  </label>
</template>