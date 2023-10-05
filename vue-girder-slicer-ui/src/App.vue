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
</script>

<template>
  <div>
    <girder-slicer-task-button @selected="select($event)" />
    <girder-slicer-task-card :task-id="selected" />
    <data-browser />
  </div>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
