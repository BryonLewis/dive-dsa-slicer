<script setup lang="ts">
import { PropType, onMounted, ref, } from 'vue'
import type { XMLParameters } from '../parser/parserTypes';
import BaseParameter from './Parameters/BaseParameter.vue';
import BooleanParameter from './Parameters/BooleanParameter.vue';
import EnumerationParameters from './Parameters/EnumerationParameters.vue';
const props = defineProps({
  parameters: {
    type: Array as PropType<XMLParameters[]>,
    required: true,
  },
})

const baseParmaeters = ['string', 'number', 'vector', 'string-vector', 'number-vector']
const paramCopy = ref(props.parameters);
onMounted(() => {
  paramCopy.value = props.parameters;
})

const updateParameter = (data: XMLParameters, index: number) => {
  paramCopy.value.splice(index, 1, data);
}
</script>

<template>
  <div
    v-for="(parameter, index) in paramCopy"
    :key="`${parameter.title}_${index}`"
  >
    <div class="row justify-content-left">
      <div class="col-auto">
        <base-parameter 
          v-if="baseParmaeters.includes(parameter.type)"
          :data="parameter"
          @change="updateParameter($event, index)"
        />
        <boolean-parameter
          v-else-if="parameter.slicerType === 'boolean'"
          :data="parameter"
          @change="updateParameter($event, index)"
        />
        <enumeration-parameters
          v-else-if="parameter.slicerType === 'number-enumeration' || parameter.slicerType === 'string-enumeration'"
          :data="parameter"
          @change="updateParameter($event, index)"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
