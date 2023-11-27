<script setup lang="ts">
import { Ref, computed, ref, watch } from 'vue';
import { parse } from '../parser/index'
import GirderControlsPanel from './GirderControlsPanel.vue';
import RestClient from '../api/girderRest';
import { JobResponse, useGirderSlicerApi } from '../api/girderSlicerApi';
import type { XMLParameters, XMLSpecification } from '../parser/parserTypes';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose } from '@mdi/js';
interface Props {
  apiUrl?: string;
  taskId: string | null;
  colorMode?: string;
}

const props = withDefaults(defineProps<Props>(), {
  apiUrl: 'api/v1',
  taskId: '64e8aff6072d5e5fbb8719a4',
  colorMode: undefined,
});

const emit = defineEmits<{
  (e: "run-task", jobId: string): void;
}>();

const girderRest = new RestClient({apiRoot: props.apiUrl});
const loggedIn = computed(() => girderRest?.token);
const result: Ref<XMLSpecification | null> = ref(null);
const jobData: Ref<null | JobResponse> = ref(null)
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

const runTask = async () => {
  // First we need to validate the task has all parameters required.
  if (result.value && props.taskId) {
    const resp = await slicerApi.runTask(result.value, props.taskId);
    if (resp) {
      jobData.value = resp;
      emit('run-task', jobData.value._id);
    }
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
    :data-bs-theme="colorMode"
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
      <div
        v-if="jobData"
        class="card-title row justify-content-left g-0"
      >
        <div
          class="alert alert-success alert-dismissible fade show"
          role="alert"
        >
          <span>{{ jobData.title }} running</span>
          <svg-icon
            type="mdi"
            :path="mdiClose"
            size="30"
            class="pb-2 icon clickable"
            data-dismiss="modal"
            aria-label="Close"
            style="float:right"
            @click="jobData = null"
          >
            <span aria-hidden="true">&times;</span>
          </svg-icon>
        </div>
      </div>
      <p class="card-text">
        {{ result.description }}
      </p>
      <GirderControlsPanel
        v-for="(panel, index) in result.panels"
        :key="`panel_${index}`"
        :panel="panel"
        :collapse-override="!!jobData"
        @change="updateParameters($event, index)"
        @input-selected="processInput($event)"
      />
    </div>
  </div>
  <div v-else-if="!loggedIn">
    <div class="card">
      <div
        class="alert alert-warning"
        role="warning"
      >
        <h4>User Not Logged In.  Cannot display Task information.</h4>>
      </div>
    </div>
  </div>
</template>

<style scoped>

a {
  color: #42b983;
}
.clickable {
    color: var(--bs-link-color);
}
.clickable:hover {
    cursor: pointer;
}
</style>
