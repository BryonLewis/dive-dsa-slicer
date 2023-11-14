<script setup lang="ts">
import { PropType } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
const props = defineProps({
    title: {
        type: String,
    },
    type: {
        type: Object as PropType<ParamSlicerType>,
    },
    id: {
        type: String,
    },
    value: {
        type: Object as PropType<XMLBaseValue>
    },
    description: {
        type: String,
        required: false,
        default: '',
    }
})

</script>

<template>
  <div class="form-group">
    <label for="parameterInput">{{ title }}</label>
    <input
      id="parameterInput"
      class="form-control"
      type="color"
      :value="value"
    >
    <small
      v-if="description"
      class="form-text text-muted"
    >{{ description }}</small>
  </div>
</template>

<style scoped>
</style>
