<script setup lang="ts">
import { PropType } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
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
    defaultValue: {
        type: Object as PropType<XMLBaseValue>
    },
    description: {
        type: String,
        required: false,
        default: '',
    },
    constraints: {
        type: Object as PropType<XMLParameters['constraints']>,
        required: false,
    }
})

const error = computed(() => props.data.error)
</script>

<template>
  <div class="form-group">
    <label for="parameterInput">{{ title }}</label>

    <input 
      v-if="constraints && typeof constraints.min === 'number' && typeof constraints.max === 'number'"
      id="parameterInput"
      class="form-control"
      type="range"
      :min="constraints.min || 0"
      :max="constraints.max || 1"
      :value="defaultValue || constraints.min || 0"
    >
    <input 
      v-else
      id="parameterInput"
      class="form-control"
      type="range"
      min="0"
      max="1"
      :value="defaultValue || 0"
    >

    <small
      v-if="description"
      class="form-text text-muted"
    >{{ description }}</small>
  </div>
</template>

<style scoped>
</style>
