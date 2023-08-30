<script setup lang="ts">
import { ref, Ref, PropType, computed, onMounted, watch } from 'vue';
import { mdiAlertOutline } from '@mdi/js' ;
import SvgIcon from '@jamescoyle/vue-icon';
import { Tooltip } from 'bootstrap'
import { constraints, parse } from '../parser/index'

import RestClient from '../api/girderRest';
import { useGirderSlicerApi, SlicerImage } from '../api/girderSlicerApi';
export type ParamGUIType = 'number'
  | 'boolean'
  | 'string'
  | 'number-vector'
  | 'string-vector'
  | 'number-enumeration'
  | 'string-enumeration'
  | 'region'
  | 'image'
  | 'file'
  | 'item'
  | 'directory'
  | 'multi';

export type ParamSlicerType = 'integer' | 'float' | 'double' | 'boolean' | 'string'
    | 'integer-vector'
    | 'float-vector'
    | 'double-vector'
    | 'string-vector'
    | 'integer-enumeration'
    | 'float-enumeration'
    | 'double-enumeration'
    | 'string-enumeration'
    | 'region'
    | 'image'
    | 'file'
    | 'item'
    | 'directory'
    | 'multi';

type XMLBaseValue = (number | string | number[] | string[] | boolean);

interface XMLParameters {
  type: ParamSlicerType;
  slicerType: ParamGUIType;
  title: string;
  description: string;
  channel?: 'input' | 'output';
  id: string;
  values?: XMLBaseValue[];
  constraints?: {min?: XMLBaseValue; max?: XMLBaseValue; step?: XMLBaseValue};
  defaultValue?: XMLBaseValue;
  extra?: {
    required?: boolean;
    extensions?: string | undefined;
    reference?: string | undefined;
    defaultNameMatch?: string | undefined;
    defaultPathMatch?: string | undefined;
    defaultRelativePath?: string | undefined;
    multiple?: boolean;
    datalist?: boolean;
    shapes?: string | undefined;
  }
}

interface XMLGroups {
  description: string;
  label: string;
  parameter: XMLParameters[];

}

interface XMLPanel {
  advanced: boolean;
}

interface XMLSpecification {
  title: string;
  license: string;
  description: string;
  version:string;
}
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
<div v-if="result" class="card">
  <div class="card-body">
    <h5 class="card-title">{{ result.title }}</h5>
    <p class="card-text">{{  result.description }}</p>
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
