<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
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


const validate = (e: Event) => {
    // Validation Logic for different types
    const update = { ...props.data };
    let value = (e.target as HTMLSelectElement).value as XMLBaseValue;

    if (props.data.slicerType === 'number-enumeration') {
        value = parseFloat(value);
    }
    update.value = value;
    currentValue.value = value;
    console.log(update);
    emit('change', update);
}

</script>

<template>
  <div>
    <label for="parameterInput">{{ data.title }}</label>
    <select
      :value="data.value"
      @change="validate($event)"
    >
      <option
        v-for="item in data.values"
        :key="`${data.title}_${item}`"
        :value="item"
      >
        {{ item }}
      </option>
    </select>
    <small
      v-if="data.description"
      class="form-text text-muted"
    >{{ data.description }}</small>
  </div>
</template>

<style scoped>
</style>
