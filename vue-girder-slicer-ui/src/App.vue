<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { Ref, ref } from 'vue';
import GirderSlicerTaskButton from './components/GirderSlicerTaskButton.vue';
import GirderSlicerTaskCard from './components/GirderSlicerTaskCard.vue';
import DataBrowser from './components/FileBrowser/DataBrowser.vue';


const selected: Ref<string | null> = ref(null);

const select = (id: string) => {
  selected.value = id;
}
const showBrowser = ref(false);
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
      output="defaultName"
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
