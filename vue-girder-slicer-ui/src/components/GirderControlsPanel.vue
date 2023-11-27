<script setup lang="ts">
import { PropType, ref } from 'vue'
import { mdiChevronDown, mdiChevronUp } from '@mdi/js' ;
import SvgIcon from '@jamescoyle/vue-icon';
import type { XMLPanel, XMLParameters } from '../parser/parserTypes';
import GirderSlicerParameter from './GirderSlicerParameter.vue';
import { Collapse } from 'vue-collapsed'

const props = defineProps({
  panel: {
    type: Object as PropType<XMLPanel>,
    required: true,
  },
  collapseOverride: {
    type: Boolean,
    required: false,
  }
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
      class="card-title mb-0"
    >
      <div
        class="row justify-content-left g-0"
        @click="collapsed = !collapsed"
      >
        <div class="col-auto">
          <svg-icon
            type="mdi"
            :path="collapsed ? mdiChevronUp : mdiChevronDown"
            :size="30"
            class="pb-2 icon"
          />
        </div>
        <div class="col-auto">
          <h5 @click="collapsed = !collapsed">
            {{ panel.groups[0].label }}
          </h5>
        </div>
      </div>
      <Collapse
        :when="!collapsed || collapseOverride"
      >
        <div
          v-if="!collapsed"
          class="row"
        >
          <girder-slicer-parameter
            :parameters="panel.groups[0].parameters"
            @change="updateParams($event)"
            @input-selected="$emit('input-selected', $event)"
          />
        </div>
      </Collapse>
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
