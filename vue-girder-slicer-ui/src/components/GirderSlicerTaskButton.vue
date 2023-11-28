<script lang="ts">
import { Ref, computed, defineComponent, onMounted, ref,  } from 'vue';
import { Tooltip } from 'bootstrap'
import {extractImageInfo } from '../utils';


import RestClient from '../api/girderRest';
import { useGirderSlicerApi } from '../api/girderSlicerApi';
import { mdiAlert } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';

type TaskHierarchy =  Record<string, {tag: string, tasks:{ imageBase:string, imageTag: string; _id: string; name:string; description: string}[]}[]>;


export default defineComponent({
  components: {
    SvgIcon,
  },
  props: {
    apiUrl: {
      type: String,
      default: 'api/v1',
    },
    filter: {
      type: String,
      default: ''
    },
    colorMode: {
      type:String,
      default: undefined
    }
  },
  setup(props, { emit }) {

    const girderRest = new RestClient({apiRoot: props.apiUrl});
    const loggedIn = computed(() => girderRest?.token);
    const slicerApi = useGirderSlicerApi(girderRest);
    const results: Ref<TaskHierarchy> = ref({});
    const getData = async () => {
      const response = await slicerApi.getSlicerList();
      // ground items by their image
      const taskHierarchy: TaskHierarchy = {};
      response.data.forEach((task) => {
        // Lets get the base image name
        const imageInfo = extractImageInfo(task.image);
        if (imageInfo) {
          // We create a root for it
          if (taskHierarchy[imageInfo.baseName] === undefined) {
            taskHierarchy[imageInfo.baseName] = [{tag:imageInfo.tag, tasks:[]}];
          }
          const foundIndex = taskHierarchy[imageInfo.baseName].findIndex((item) => item.tag === imageInfo.tag);
          if (foundIndex !== -1){
            taskHierarchy[imageInfo.baseName][foundIndex].tasks.push({ imageBase: imageInfo.baseName, imageTag: imageInfo.tag, _id: task._id, name: task.name, description: task.description});
          }
          else if (foundIndex === -1){
            taskHierarchy[imageInfo.baseName].push({tag:imageInfo.tag, tasks:[{ imageBase: imageInfo.baseName, imageTag: imageInfo.tag, _id: task._id, name: task.name, description: task.description}]});
          }
        }
      })
      results.value = taskHierarchy;
    }

    const select = (id: string) => {
      emit('selected', id);
    };

    onMounted(() => {
      new Tooltip(document.body, {
          selector: "[data-bs-toggle='tooltip']",
        })
        getData();
    });
    return {
      results,
      mdiAlert,
      loggedIn,
      select,
    };
  },
});

</script>

<template>
  <div
    v-if="loggedIn"
    class="btn-group dropdown"
    :data-bs-theme="colorMode"
  >
    <button
      type="button"
      class="btn btn-primary dropdown-toggle"
      data-bs-toggle="dropdown"
      data-bs-theme="dark"
      aria-expanded="false"
    >
      Tasks
    </button>
    <ul class="dropdown-menu">
      <li
        v-for="(item, key) in results"
        :key="key"
        class="dropdown-item"
      >
        {{ item.length === 1 ? `${key}:${item[0].tag}`: key }} &raquo;
        <ul
          v-if="item.length === 1"
          class="submenu dropdown-menu"
        >
          <li
            v-for="task in item[0].tasks"
            :key="task._id"
            class="dropdown-item"
            @click="select(task._id)"
          >
            {{ task.name }}
          </li>
        </ul>
        <ul
          v-else
          class="submenu dropdown-menu"
        >
          <li
            v-for="tag in item"
            :key="tag.tag"
            class="dropdown-item"
          >
            {{ tag.tag }} &raquo;
            <ul class="submenu dropdown-menu">
              <li
                v-for="task in tag.tasks"
                :key="task._id"
                class="dropdown-item"
                @click="select(task._id)"
              >
                {{ task.name }}
              </li>
            </ul>
          </li>
        </ul>
      </li>
    </ul>
  </div>
  <div v-else>
    <button
      type="button"
      class="btn btn-outline-warning"
      data-toggle="tooltip"
      data-placement="top"
      title="Not Logged In"
    >
      Error 
      <svg-icon
        type="mdi"
        :path="mdiAlert"
        :size="30"
        class="pb-1"
      />
    </button>
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
	.dropdown-menu > li:hover{ background-color:  var(--bs-highlight-bg) }
	.dropdown-menu > li:hover > .submenu{ display: block; }
}	
@media all and (min-width: 992px) {

	.dropdown-menu > li:hover{ background-color:  var(--bs-highlight-bg) }
	.dropdown-menu > li:hover > .submenu{ display: block; }
}	
/* ============ desktop view .end// ============ */

/* ============ small devices ============ */

a {
  color: #42b983;
}
</style>
