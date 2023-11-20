<script setup lang="ts">
import { Ref, computed, ref, watch } from 'vue';
import { parse } from '../parser/index'
import GirderControlsPanel from './GirderControlsPanel.vue';
import RestClient from '../api/girderRest';
import { useGirderSlicerApi } from '../api/girderSlicerApi';
import type { XMLParameters, XMLSpecification } from '../parser/parserTypes';

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

const updateParameters = (e: XMLParameters[], index: number) => {
  if (result.value) {
    result.value.panels[index].groups[0].parameters = e;
  }
}

const runTask = () => {
  // First we need to validate the task has all parameters required.
  if (result.value && props.taskId) {
    slicerApi.runTask(result.value, props.taskId)
  }
}

const processInput = async (name: string) => {
  if (result.value) {
    await slicerApi.processInput(result.value, name);
  }

}

</script>

<template>
  <div
    v-if="result"
    class="card"
  >
    <div class="card-body">
      <div class="card-title row justify-content-left g-0">
        <div class="col-10">
          <h5>
            {{ result.title }}
          </h5>
        </div>
        <div class="col-auto ">
          <button
            type="button"
            class="btn btn-primary"
            @click="runTask()"
          >
            Run
          </button>
        </div>
      </div>
      <p class="card-text">
        {{ result.description }}
      </p>
      <GirderControlsPanel
        v-for="(panel, index) in result.panels"
        :key="`panel_${index}`"
        :panel="panel"
        @change="updateParameters($event, index)"
        @input-selected="processInput($event)"
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
