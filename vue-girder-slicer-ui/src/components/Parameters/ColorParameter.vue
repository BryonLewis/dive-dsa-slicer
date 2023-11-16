<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import { XMLParameters } from '../../parser/parserTypes';
import type { XMLBaseValue } from '../parser/parserTypes';
const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters>,
        required: true,
    },
})

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
const error = computed(() => props.data.error)

const validate = (e: Event) => {
    // Validation Logic for different types
    const update = { ...props.data };
    let value = (e.target as HTMLInputElement).value as XMLBaseValue;
    update.value = value;
    currentValue.value = value;
    emit('change', update);
}

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
