<script setup lang="ts">
import HelloWorld from './components/HelloWorld.vue'
import { ref, Ref, PropType, computed, onMounted } from 'vue';
import GirderSlicerTaskButton from './components/GirderSlicerTaskButton.vue';
import GirderSlicerTaskCard from './components/GirderSlicerTaskCard.vue';


const selected: Ref<string | null> = ref(null);
const select = (id: string) => {
  selected.value = id;
}
</script>

<template>
  <div>
  <img alt="Vue logo" src="./assets/logo.png" />
  <HelloWorld msg="Hello Vue 3 + Vite" />
  <girder-slicer-task-button @selected="select($event)"/>
  <girder-slicer-task-card :task-id="selected"/>
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
