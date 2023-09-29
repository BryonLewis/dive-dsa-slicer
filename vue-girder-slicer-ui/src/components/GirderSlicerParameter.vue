<script setup lang="ts">
import { ref, PropType } from 'vue'
import type { XMLParameters } from '../parser/parserTypes';
const props = defineProps({
  parameters: {
    type: Array as PropType<XMLParameters[]>,
    required: true,
  },
})

</script>

<template>
    <div v-for="(parameter, index) in props.parameters" :key="`${parameter.title}_${index}`">
      <div class="row justify-content-left">
        <div class="col-auto">
          <h6><b>{{ parameter.title }}</b></h6>
        </div>
      </div>
        <div class="row justify-content-left">
          <div class="col-auto">
            <p>{{ parameter.description }}</p>
          </div>
        </div>
    </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
