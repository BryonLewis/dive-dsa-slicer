<script lang="ts">
import { PropType, Ref, computed, defineComponent, ref, watch } from 'vue';
import parse from '../parser/parse';
import GirderControlsPanel from './GirderControlsPanel.tw.vue';
import RestClient from '../api/girderRest';
import { JobResponse, useGirderSlicerApi } from '../api/girderSlicerApi';
import type { XMLParameters, XMLSpecification } from '../parser/parserTypes';
import SvgIcon from '@jamescoyle/vue-icon';
import { mdiClose } from '@mdi/js';
export default defineComponent({
  compatConfig: { mode: 2 },
  components: {
    GirderControlsPanel,
    SvgIcon
  },
  props: {
    apiUrl: {
      type: String,
      default: 'api/v1',
    },
    taskId: {
      type: String as PropType<string | null>,
      default: '64e8aff6072d5e5fbb8719aa'
    },
    colorMode: {
      type:String,
      default: undefined
    }
  },
  setup(props, { emit }) {
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
    return {
      result,
      runTask,
      updateParameters,
      processInput,
      jobData,
      loggedIn,
      mdiClose,
    }
  }
});
</script>
<template>
  <div
    v-if="result"
    class="relative flex flex-col min-w-0 rounded break-words border bg-white text-black dark:bg-gray-600 dark:text-gray-300 border-1 border-grey-light"
    :class="{dark: colorMode === 'dark'}"
  >
    <div class="flex-auto p-6">
      <div class="grid grid-cols-12 gap-4 pb-2">
        <span class="col-span-10">
          <h5>
            {{ result.title }}
          </h5>
        </span>
        <span class="col-span-2">
          <button
            type="button"
            class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded border-2"
            @click="runTask()"
          >
            Run
          </button>
        </span>
      </div>
      <div
        v-if="jobData"
        class="mb-3 flex flex-wrap justify-content-left g-0"
      >
        <div
          class="relative px-3 py-3 mb-4 border rounded text-green-darker border-green-dark bg-green-lighter  opacity-0 opacity-100 block"
          role="alert"
        >
          <span>{{ jobData.title }} running</span>
          <svg-icon
            type="mdi"
            :path="mdiClose"
            :size="30"
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
      <p class="mb-0">
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
    <div class="relative flex flex-col min-w-0 rounded break-words border bg-white text-black dark:bg-gray-600 dark:text-gray-300 border-1 border-grey-light">
      <div
        class="relative px-3 py-3 mb-4 border rounded text-yellow-darker border-yellow-dark bg-yellow-lighter"
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
