<script setup lang="ts">
import { ref, Ref } from 'vue';

import RestClient from '../api/girderRest';
import { useGirderSlicerApi, SlicerImage } from '../api/girderSlicerApi';


const props = defineProps({
  apiUrl: {type: String, required: false, default: 'api/v1'},
})
const girderRest = new RestClient({apiRoot: props.apiUrl});
console.log(girderRest);
const slicerApi = useGirderSlicerApi(girderRest);
const results: Ref<SlicerImage[]> = ref([]);
const getData = async () => {
  const response = await slicerApi.getSlicerList();
  results.value = response.data;
}
getData();

</script>

<template>
  <div v-for="item in results" :key="item._id">
    <div> {{  item.name }}</div>
  </div>
</template>

<style scoped>
a {
  color: #42b983;
}
</style>
