<script lang="ts">
import { PropType, Ref, computed, defineComponent, onMounted, ref } from 'vue'
import { XMLParameters } from '../../parser/parserTypes';
export default defineComponent({
  props: {
    data: {
      type: Object as PropType<XMLParameters>,
        required: true,
    }
  },
  setup(props, { emit }) {
    const error = computed(() => props.data.error)
    const currentValue: Ref<boolean> = ref(false);
    onMounted(() => {
        currentValue.value = !!props.data.value || !!props.data.defaultValue || false;
    })
    const validate = (e: Event) => {
        // Validation Logic for different types
        const update = { ...props.data }
        let value = (e.target as HTMLInputElement).checked as boolean;
        update.value = value;
        currentValue.value = value;
        emit('change', update);
    }
    return {
      error,
      currentValue,
      validate
    }
  },
});

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
