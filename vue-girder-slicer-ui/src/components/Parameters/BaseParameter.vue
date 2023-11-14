<script setup lang="ts">
import { PropType, Ref, onMounted, ref, computed } from 'vue'
import type { XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters>,
        required: true,
    },
})

const error = computed(() => props.data.error)
const numberVectors = ref(['integer-vector', 'float-vector', 'double-vector', 'string-vector']);
const numbers = ref(['integer', 'float', 'double']);
const currentValue: Ref<XMLBaseValue> = ref(0);
onMounted(() => {
    if (props.data.defaultValue && Array.isArray(props.data.defaultValue)) {
        currentValue.value = props.data.defaultValue.join(',') || props.data.value;
    } else {
        currentValue.value = props.data.defaultValue || props.data.value;
    }
})

const emit = defineEmits<{
    (e: "change", data: XMLParameters): void;
}>();


const validate = (e: InputEvent) => {
    // Validation Logic for different types
    const update = { ...props.data };
    let value = (e.target as HTMLInputElement).value as XMLBaseValue;
    if (numberVectors.value.includes(props.data.slicerType)) {
        console.log(value);
        value = value.split(',').map(parseFloat);
    } else if (props.data.slicerType === 'string-vector') {
        console.log(value);
        value = value.split(',');
    }
    update.value = value;
    currentValue.value = value;
    console.log(update);
    emit('change', update);
}

</script>

<template>
  <div>
    <label for="parameterInput">{{ data.title }} <span
      v-if="error"
      class="text-danger"
    > {{ error }}</span></label>
    <input
      v-if="numbers.includes(data.slicerType) || data.slicerType === 'string'"
      id="parameterInput"
      class="form-control"
      :type="numbers.includes(data.slicerType) ? 'number' : 'text'"
      :value="currentValue"
      @change="validate($event)"
    >
    <input
      v-else-if="(numberVectors.includes(data.slicerType) || data.slicerType === 'string-vector')"
      id="parameterInput"
      class="form-control"
      type="text"
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
