<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
import widget from '../../parser/widget';
import cloneDeep from 'lodash';
import { mdiFolderOpen, mdiPlusThick } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';
import DataBrowser from '../FileBrowser/DataBrowser.vue';

const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters & {error?: string}>,
        required: true,
    },
})
const currentValue: Ref<string |  null> = ref(null);
const placeHolder = ref('Choose a file...');
const batchload = ref(false);

const error = computed(() => props.data.error)
onMounted(() => {
  if (props.data.slicerType === 'file') {
    placeHolder.value = !props.data.multiple ?  'Choose a file...' : 'Choose multiple files...'
  }
  if (props.data.slicerType === 'multi') {
    placeHolder.value = 'Choose multiple files...'
  }
  if (props.data.slicerType === 'image') {
    placeHolder.value = !props.data.multiple ?  'Choose an image...' : 'Choose multiple images...'
  }
  if (props.data.slicerType === 'directory') {
    placeHolder.value = !props.data.multiple ?  'Choose a folder...' : 'Choose multiple folders...'
  }
  if (['file', 'item', 'image', 'multi'].includes(props.data.slicerType) && ! props.data.multiple) {
    batchload.value = true;
  }
});

const emit = defineEmits<{
    (e: "change", data: XMLParameters): void;
}>();


const validate = (e: InputEvent) => {
    // Validation Logic for different types
    const update = { ...props.data };
    let value = (e.target as HTMLInputElement).value as XMLBaseValue;
    update.value = value;
    currentValue.value = value;
    emit('change', update);
}

const showBrowser = ref(false);

const acceptBrowser = ({name, girderId}: {name: string, girderId: string}) => {
  console.log(name);
  showBrowser.value = false;
  const update = { ...props.data };
  update.value = { name, girderId} as XMLBaseValue;
  currentValue.value = name;
  emit('change', update);
}

</script>

<template>
  <div>
    <label for="parameterInput">{{ data.title }} <span
      v-if="error"
      class="text-danger"
    > {{ error }}</span></label>
    <div class="input-group">
      <input
        id="parameterInput"
        class="form-control"
        type="text"
        disabled
        :value="currentValue"
        :placeholder="placeHolder"
      >
      <span class="input-group-append">
        <button
          type="button"
          class="btn select-btn"
          @click="showBrowser = true"
        >
          <svg-icon
            type="mdi"
            :path="mdiFolderOpen"
            color="black"
            size="15"
            class="icon clickable"
          />
        </button>
        <button
          v-if="!batchload"
          type="button"
          class="btn select-btn-multi"
          @click="showBrowser = true"
        >
          <svg-icon
            type="mdi"
            :path="mdiFolderOpen"
            color="black"
            size="15"
            class="icon clickable"
          />
          <svg-icon
            type="mdi"
            :path="mdiPlusThick"
            color="black"
            size="15"
            class="icon clickable"
          />
        </button>
      </span>
    </div>
    <small
      v-if="data.description"
      class="form-text text-muted"
    >{{ data.description }}</small>
    <data-browser
      v-if="showBrowser"
      :output="data.channel === 'output' || data.type === 'new-file'"
      @close="showBrowser=false"
      @submit="acceptBrowser($event)"
    />
  </div>
</template>

<style scoped>
.select-btn {
  border: 1px solid gray;
  border-radius: 0px;
}
.select-btn:hover {
  border: 1px solid gray;
  background-color: lightgray;
}
.select-btn-multi {
  border: 1px solid gray;
  border-radius: 0px 4px 4px 0px;
}
.select-btn-multi:hover {
  border: 1px solid gray;
  background-color: lightgray;
}
</style>
