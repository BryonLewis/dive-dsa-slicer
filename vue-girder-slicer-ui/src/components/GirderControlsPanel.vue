<script setup lang="ts">
import { PropType, ref } from 'vue'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js' ;
import SvgIcon from '@jamescoyle/vue-icon';
import type { XMLPanel, XMLParameters } from '../parser/parserTypes';
import GirderSlicerParameter from './GirderSlicerParameter.vue';
const props = defineProps({
  panel: {
    type: Object as PropType<XMLPanel>,
    required: true,
  },
})
const emit = defineEmits<{
  (e: "change", data: XMLParameters[]): void;
  (e: "input-selected", data: string): void;
}>();

const collapsed = ref(!props.panel.advanced)

const updateParams = (e: XMLParameters[]) =>{
  emit('change', e);
}
</script>

<template>
  <div class="card">
    <div
      v-if="panel.groups.length === 1"
      class="card-title"
    >
      <div class="row justify-content-left g-0">
        <div class="col-auto">
          <svg-icon
            type="mdi"
            :path="collapsed ? mdiChevronUp : mdiChevronDown"
            size="30"
            class="pb-2 icon"
            @click="collapsed = !collapsed"
          />
        </div>
        <div class="col-auto">
          <h5 @click="collapsed = !collapsed">
            {{ panel.groups[0].label }}
          </h5>
        </div>
      </div>
      <Transition name="collapse">
        <div
          v-if="!collapsed"
          class="row justify-content-left g-0"
        >
          <girder-slicer-parameter
            :parameters="panel.groups[0].parameters"
            @change="updateParams($event)"
            @input-selected="$emit('input-selected', $event)"
          />
        </div>
      </Transition>
    </div>
  </div>
</template>

<style scoped>

.icon:hover {
  cursor: pointer;
}
.collapse-enter-active {
  animation: collapsing reverse 500ms ease;
}
.collapse-leave-active {
  animation: collapsing 500ms ease;
}
@keyframes collapsing {
  from {
    max-height: 1000px;
  }
  to {
    max-height: 0px;
  }
}
</style>
