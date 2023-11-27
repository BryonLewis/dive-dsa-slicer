<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import type { XMLBaseValue } from '../../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters & {error?: string}>,
        required: true,
    },
})

const emit = defineEmits<{
    (e: "change", data: XMLParameters): void;
}>();


const currentValue: Ref<XMLBaseValue> = ref(0);
onMounted(() => {
    if (props.data.defaultValue && Array.isArray(props.data.defaultValue)) {
        currentValue.value = props.data.defaultValue.join(',') || props.data.value || '';
    } else {
        currentValue.value = props.data.defaultValue || props.data.value || '';
    }
})

const validate = (e: Event) => {
    // Validation Logic for different types
    const update = { ...props.data };
    let value = (e.target as HTMLSelectElement).value as XMLBaseValue;

    if (props.data.slicerType === 'number-enumeration') {
        value = parseFloat(value as string);
    }
    update.value = value;
    currentValue.value = value;
    emit('change', update);
}


const error = computed(() => props.data.error)
</script>

<template>
  <div class="form-group">
    <label for="parameterInput">{{ data.title }} <span
      v-if="error"
      class="text-danger"
    > {{ error }}</span></label>
    <input 
      v-if="data.constraints && typeof data.constraints.min === 'number' && typeof data.constraints.max === 'number'"
      id="parameterInput"
      class="form-control"
      type="range"
      :min="data.constraints.min || 0"
      :max="data.constraints.max || 1"
      :value="currentValue"
      @change="validate($event)"
    >
    <input 
      v-else
      id="parameterInput"
      class="form-control"
      type="range"
      min="0"
      max="1"
      :value="currentValue"
      @change="validate($event)"
    >

    <small
      v-if="data.description"
      class="form-text text-muted"
    >{{ data.description }}</small>
  </div>
</template>

<style scoped>
</style>
