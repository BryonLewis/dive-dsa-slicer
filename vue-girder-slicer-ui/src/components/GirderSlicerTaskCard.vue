<script setup lang="ts">
import { Ref, computed, ref, watch } from 'vue';
import { parse } from '../parser/index'
import GirderControlsPanel from './GirderSlicerPanel.vue';
import RestClient from '../api/girderRest';
import { useGirderSlicerApi } from '../api/girderSlicerApi';
import type { XMLSpecification } from '../parser/parserTypes';

interface Props {
  apiUrl?: string;
  taskId: string | null;
}

const props = withDefaults(defineProps<Props>(), {
  apiUrl: 'api/v1',
  taskId: '64e8aff6072d5e5fbb8719a4',
});

const girderRest = new RestClient({apiRoot: props.apiUrl});
const loggedIn = computed(() => girderRest?.token);
const result: Ref<XMLSpecification | null> = ref(null)
const slicerApi = useGirderSlicerApi(girderRest);
const getData = async () => {
  if (props.taskId) {
    const response = await slicerApi.getSlicerXML(props.taskId);
    result.value = parse(response.data);
  }
}
if (props.taskId) {
  getData();
}
watch(() => props.taskId, () => {
  getData();
})

</script>

<template>
  <div
    v-if="result"
    class="card"
  >
    <div class="card-body">
      <h5 class="card-title">
        {{ result.title }}
      </h5>
      <p class="card-text">
        {{ result.description }}
      </p>
      <GirderControlsPanel
        v-for="(panel, index) in result.panels"
        :key="`panel_${index}`"
        :panel="panel"
      />
    </div>
  </div>
</template>

<style scoped>
@media all and (min-width: 992px) {
	.dropdown-menu li{ position: relative; 	}
	.submenu{ 
		display: none;
		position: absolute;
		left:100%; top:-7px;
	}
	.submenu-left{ 
		right:100%; left:auto;
	}
	.dropdown-menu > li:hover{ background-color: #f1f1f1 }
	.dropdown-menu > li:hover > .submenu{ display: block; }
}	
@media all and (min-width: 992px) {

	.dropdown-menu > li:hover{ background-color: #f1f1f1 }
	.dropdown-menu > li:hover > .submenu{ display: block; }
}	
/* ============ desktop view .end// ============ */

/* ============ small devices ============ */

a {
  color: #42b983;
}
</style>
