<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import GirderSlicerTaskMenuModalButton from './GlicerSlicerTaskMenuModalButton.tw.vue';
import GirderSlicerTaskCard from './GirderSlicerTaskCard.tw.vue';


export default defineComponent({
  name: 'App',
  components: {
    GirderSlicerTaskCard,
    GirderSlicerTaskMenuModalButton,
  },
  props: {
    
  },
  setup() {
    const selected: Ref<string | null> = ref(null);

    const select = (id: string) => {
      selected.value = id;
    }
    return {
      selected,
      select,
    };

  },
});
</script>

<template>
    <div
    class="card"
    >
        <div class="card-body">
            <div class="card-title justify-content-center row g-20">
                <div class="col">
                    <girder-slicer-task-card :task-id="selected" />

                    <girder-slicer-task-menu-modal-button
                        @selected="select = $event"
                    />
                    <girder-slicer-task-card :task-id="selected" />
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
