<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import GirderSlicerTaskButton from './components/GirderSlicerTaskButton.tw.vue';
import GirderSlicerTaskCard from './components/GirderSlicerTaskCard.tw.vue';
import DataBrowser from './components/FileBrowser/DataBrowser.tw.vue';
import Modal from './components/FileBrowser/Modal.tw.vue';
import type { GirderModel } from './girderTypes';


export default defineComponent({
  name: 'App',
  components: {
    GirderSlicerTaskButton,
    GirderSlicerTaskCard,
    DataBrowser,
    Modal,
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
    <div
    class="card"
  >
    <div class="card-body">
      <div class="card-title justify-content-center row g-20"
>

  <div class="col">
    <girder-slicer-task-card :task-id="selected" />

    <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
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
    <girder-slicer-task-button @selected="select($event)" colorMode="dark" />
  </div>
  </div>
  </div>
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
body {
  margin: 0;
  display: flex;
  place-items: center;
  align-content: center;
  min-width: 320px;
  min-height: 100vh;
}

</style>
