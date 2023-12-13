<script lang='ts'>
  import {defineComponent} from 'vue';

export default defineComponent({
    props: {
        isVisible: {
            type: Boolean,
            default: false,
        }
    },
    setup(_, { emit}) {
        const cancel = () => {
            emit('cancel')
        }
        const confirm = () => {
            emit('confirm')
        }
        return {
            cancel,
            confirm

        }
    }
})
</script>

<template>
<div v-if="isVisible">
    <div class="fixed inset-0 z-50 flex justify-center items-center">
      <div class="flex flex-col max-w-5xl rounded-lg shadow-lg bg-white">
        <!-- Header -->
        <div class="p-5">
          <div class="flex justify-between items-start">
            <h3 class="text-2xl font-semibold">Modal Header</h3>
            <button class="p-1 leading-none" @click="cancel">
              <div class="text-xl font-semibold h-6 w-6">
                <span>x</span>
              </div>
            </button>
          </div>
        </div>
        
        <!-- Body -->
        <div class="p-6">
          <p>This is a modal body content. Let's make this line a bit longer to see the width.</p>
        </div>
        
        <!-- Footer -->
        <div class="p-6 flex justify-end items-center">
          <button class="btn-outline font-bold py-2 px-4 rounded" @click="cancel">Cancel</button>
          <button class="btn ml-2 bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded" @click="confirm">Confirm</button>
        </div>
      </div>
    </div>
    <div class="opacity-25 fixed inset-0 z-40 bg-black"></div>
  </div>
</template>