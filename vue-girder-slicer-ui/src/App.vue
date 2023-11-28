<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import GirderSlicerTaskButton from './components/GirderSlicerTaskButton.vue';
import GirderSlicerTaskCard from './components/GirderSlicerTaskCard.vue';
import DataBrowser from './components/FileBrowser/DataBrowser.vue';
import type { GirderModel } from './girderTypes';


export default defineComponent({
  name: 'App',
  components: {
    GirderSlicerTaskButton,
    GirderSlicerTaskCard,
    DataBrowser,
  },
  props: {
    
  },
  setup() {
    const selected: Ref<string | null> = ref(null);

    const select = (id: string) => {
      selected.value = id;
    }
    const showBrowser = ref(false);

    const validate = (e: GirderModel) => {
      if (e.name.includes('jpg')) {
        return  { valid: true}
      } else {
        return {valid: false, msg: 'Item needs to be of type jpg'}
      }
    };
    return {
      selected,
      select,
      showBrowser,
      validate,
    };

  },
});
</script>

<template>
  <div>
    <girder-slicer-task-button @selected="select($event)" />
    <girder-slicer-task-card :task-id="selected" />
    <button
      type="button"
      class="btn btn-primary"
      data-dismiss="modal"
      @click="showBrowser = true"
    >
      File Browser
    </button>

    <data-browser
      v-if="showBrowser"
      :validation="validate"
      type="file"
      @close="showBrowser=false"
    />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
