<script setup lang="ts">
import { computed, PropType } from 'vue'
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
const error = computed(() => props.data.error)


</script>

<template>
  <div class="form-group">
    <label for="parameterInput">{{ data.title }} <span
      v-if="error"
      class="text-danger"
    > {{ error }}</span></label>
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
