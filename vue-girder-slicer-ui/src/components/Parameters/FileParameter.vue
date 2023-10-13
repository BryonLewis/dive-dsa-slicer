<script setup lang="ts">
import { PropType, Ref, computed, onMounted, ref } from 'vue'
import type { ParamSlicerType, XMLBaseValue } from '../parser/parserTypes';
import { XMLParameters } from '../../parser/parserTypes';
import widget from '../../parser/widget';
import cloneDeep from 'lodash';
import { mdiFolderOpen, mdiPlusThick } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';

const props = defineProps({
    data: {
        type: Object as PropType<XMLParameters>,
        required: true,
    },
})
const currentValue: Ref<string |  null> = ref(null);
const placeHolder = ref('Choose a file...');
const batchload = ref(false);

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
    console.log(update);
    emit('change', update);
}

</script>

<template>
  <div>
    <label for="parameterInput">{{ data.title }}</label>
    <div class="input-group">
      <input
        id="parameterInput"
        class="form-control"
        type="text"
        disabled
        :value="currentValue"
        :placeholder="placeHolder"
        @change="validate($event)"
      >
      <span class="input-group-append">
        <button
          type="button"
          class="btn select-btn"
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
