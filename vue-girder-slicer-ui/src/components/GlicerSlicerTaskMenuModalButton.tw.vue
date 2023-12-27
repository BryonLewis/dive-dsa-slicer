<script lang="ts">
import { defineComponent, ref } from "vue";
import SvgIcon from "@jamescoyle/vue-icon";
import Modal from './FileBrowser/Modal.tw.vue';
import GirderSlicerTaskMenu from "./GirderSlicerTaskMenu.tw.vue";

export default defineComponent({
  components: {
    SvgIcon,
    Modal,
    GirderSlicerTaskMenu,
  },
  props: {
    apiUrl: {
      type: String,
      default: "api/v1",
    },
    filter: {
      type: String,
      default: "",
    },
    colorMode: {
      type: String,
      default: undefined,
    },
  },
  setup(_props, { emit }) {
    const modalOpen = ref(false);
    const accept = () => {
        emit('selected', selectedId.value);
        modalOpen.value = false;
    };
    const selectedId = ref('');
    const selectedName = ref('');
    const processSelected = (data: { id: string, name: string }) => {
        selectedId.value = data.id;
        selectedName.value = data.name;
    }
    const selected = ref('');
    return {
        modalOpen,
        accept,
        processSelected,
        selected,
        selectedId,
        selectedName,
    };
  },
});
</script>
<template>
<span>
    <button
        class="gsu-btn font-semibold py-2 px-4 rounded inline-flex items-center
        rounded-sm flex items-center min-w-32"
        @click="modalOpen = true"
      >
      <span v-if="!selectedName" class="pr-1 font-semibold flex-1">Choose Task</span>
      <span v-else-if="selectedName" class="pr-1 text-xs font-semibold flex-1">{{ selectedName }}</span>
    </button>
    <Modal 
    :isVisible="modalOpen"
    :disabled-confrm="!selectedName"
    @cancel="modalOpen =false; $emit('cancel')"
    @confirm="accept()"
    >
        <template slot="header">
            <span>Task Selection</span>
        </template>
        <template slot="body">
            <GirderSlicerTaskMenu
            :api-url="apiUrl"
            :color-mode="colorMode"
            :filter="filter"
            @selected="processSelected($event)"
            />
            <div v-if="selectedName" class="flex flex-row justify-items-center">
                <div class="ma-auto">
                    <span class="px-2">Selected:</span>
                    <span class="px-2" > {{  selectedName }}</span>
                </div>
            </div>
            </template> 
    </Modal>
</span>
</template>
<style scoped lang="scss">
.dropdown:hover > .dropdown-content {
	display: block;
}

</style>
