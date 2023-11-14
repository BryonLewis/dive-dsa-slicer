<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
import widget from '../../parser/widget';
import cloneDeep from 'lodash';
const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters>,
        required: true,
    },
})

const error = computed(() => props.data.error)
const currentValue: Ref<XMLBaseValue> = ref(0);
onMounted(() => {
    currentValue.value = props.data.value || props.data.defaultValue;
})

const emit = defineEmits<{
    (e: "change", data: XMLParameters): void;
}>();


const validate = (e: XMLBaseValue) => {
    // Validation Logic for different types
    const update = { ...props.data }
    let value = (e.target as HTMLInputElement).checked as boolean;
    update.value = value;
    currentValue.value = value;
    emit('change', update);
}

</script>

<template>
  <div class="form-check">
    <label for="parameterInput">{{ data.title }} <span
      v-if="error"
      class="text-danger"
    > {{ error }}</span></label>
    <input
      class="form-check-input"
      type="checkbox"
      :checked="currentValue"
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
