<script setup lang="ts">
import { Ref, ref } from 'vue'
import RestClient from '../../api/girderRest';
import { GirderModel, GirderModelType } from '../../girderTypes';
import { mdiAccount, mdiArrowUpRightBold, mdiEarth, mdiFile, mdiFolder, mdiLock, mdiSitemap } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';

import RootSelection from './RootSelection.vue';
interface Props {
  apiUrl?: string;
  type?: 'multi' | 'item';
}
const props = withDefaults(defineProps<Props>(), {
  apiUrl: 'api/v1',
});

const girderRest = new RestClient({apiRoot: props.apiUrl, authenticateWithCredentials: true});

const iconMap = ref({
    'user': mdiAccount,
    'collection' : mdiSitemap,
    'folder': mdiFolder,
    'item': mdiFile,
})
const home: Ref<string | null>  = ref(null);
const users: Ref<GirderModel[] | null> =  ref(null);
const collections: Ref<GirderModel[] | null> =  ref(null);
const user: Ref<GirderModel | null> =  ref(null);
const rootFolders: Ref<GirderModel[] | null>  = ref(null);
const rootItems: Ref<GirderModel[] | null>  = ref(null);
const breadCrumb: Ref<{type: GirderModelType, path: {name:string, id: string}[]}> = ref({type: 'user', path:[]})

const sizeFormatter =(size, { base = 1024, unit = 'B' } = {})  =>{
    if (size < base) {
    return `${size} ${unit}`;
    }

    let i;
    let val = size;
    for (i = 0; val >= base && i < 4; i += 1) {
    val /= base;
    }

    return `${val.toFixed(2)}  ${['', 'K', 'M', 'G', 'T'][i]}${unit}`;
};
const updateMainView = async (parentId: string, parentType: string, name = '') => {
    const responseFolders = await girderRest.get(`folder`, {
            params: {
                limit: 1001,
                offset: 0,
                sort: 'name',
                sortdir: 1,
                parentType,
                parentId,

            },
        }
    );
    if (parentType  === 'folder') {
        const responseItems = await girderRest.get(`item`, {
                params: {
                    limit: 1001,
                    offset: 0,
                    sort: 'name',
                    sortdir: 1,
                    folderId: parentId,

                },
            }
        );
        rootItems.value = responseItems.data;
    } else {
        rootItems.value = [];
    }

    rootFolders.value = responseFolders.data;
    const foundBreadCrumbIndex = breadCrumb.value.path.findIndex((item) => item.id === parentId);
    if (foundBreadCrumbIndex !== -1) {
        breadCrumb.value = {
            type: breadCrumb.value.type,
            path: breadCrumb.value.path.slice(0, foundBreadCrumbIndex + 1)
        }
    } else {
        breadCrumb.value = {
            type: breadCrumb.value.type,
            path: [ ...breadCrumb.value.path , { name,  id: parentId }],
        };
    }


}

const setRoot = async ({ val, type, name}: {val: string,  type: GirderModelType, name: string}) => {
    home.value = val;
    breadCrumb.value = { type, path: []};
    updateMainView(val, type, name);
}

const upLevel = () => {
  if (breadCrumb.value.path.length > 1) { // we can't go up if add root
    const newPath = breadCrumb.value.path[breadCrumb.value.path.length - 2]
    let newPathType = 'folder';
    if( breadCrumb.value.path.length === 2) {
      newPathType = breadCrumb.value.type;
    }
    updateMainView(newPath.id, newPathType, newPath.name)
  }
}

const getData = async () => {
    const userResponse = (await girderRest.get('user/me')).data;
    user.value = userResponse;

    // REPLACE WITH A PROMISE ALL
    const collectionsResponse = await girderRest.get('collection', {
        params: {
            limit: 1001,
            offset: 0,
            sort: 'name',
            sortdir: 1,
        },
    });
    const usersResponse = await girderRest.get('user', {
        params: {
            limit: 1001,
            offset: 0,
            sort: 'name',
            sortdir: 1,
            parentType: 'user',
        },
    });
    const rootResponse =  await girderRest.get('folder', {
        params: {
            limit: 1001,
            offset: 0,
            sort: 'name',
            sortdir: 1,
            parentType: 'user',
            parentId: userResponse._id,
        },
    });
    users.value = usersResponse.data;
    collections.value = collectionsResponse.data;
    rootFolders.value = rootResponse.data
    home.value = userResponse._id;
    breadCrumb.value = {
        type: 'user',
        path: [{
            name:`${userResponse.firstName} ${userResponse.lastName}`,
            id: userResponse._id
        }]
    }
}
getData();
</script>

<template>
  <div class="card">
    <root-selection
      v-if="home && user && collections && users"
      :home="user._id"
      :value="home"
      :collections="collections"
      :users="users"
      @change="setRoot($event)"
    />
    <div class="row breadcrumb mb-0">
      <div class="col text-left">
        <span
          v-for="(item, index) in breadCrumb.path"
          :key="`breadCrumb_${item.id}`"
        >
          <span
            v-if="index === 0"
          >
            <svg-icon
              type="mdi"
              :path="iconMap[breadCrumb.type]"
              color="lightblue"
              size="30"
              class="pb-2 icon clickable"
              @click="updateMainView(item.id, breadCrumb.type, item.name)"
            />
            <span
              class="clickable"
              @click="updateMainView(item.id, breadCrumb.type, item.name)"
            > 
              {{ item.name }}
            </span>

          </span>
          <span
            v-else-if="index !== breadCrumb.path.length - 1"
            class="clickable"
            @click="updateMainView(item.id, 'folder', item.name)"
          > 
            {{ item.name }}
          </span>
          <span v-else> 
            {{ item.name }}
          </span>
          <span class="px-2">
            /
          </span>
        </span>
      </div>
      <div class="col-auto">
        <span>
          <svg-icon
            type="mdi"
            :path="iconMap['folder']"
            color="gray"
            size="30"
            class="pb-2 icon"
          />
          <span
            class="number-badge"
          >{{ rootFolders ? rootFolders.length : 0 }}</span>
        </span>
        <span>
          <svg-icon
            type="mdi"
            :path="iconMap['item']"
            color="gray"
            size="30"
            class="pb-2 icon"
          />
          <span
            
            class="number-badge"
          >{{ rootItems ? rootItems.length : 0 }}</span>
        </span>
        <span class="px-2">
          <svg-icon
            type="mdi"
            :path="mdiArrowUpRightBold"
            color="blue"
            size="30"
            class="pb-2 icon level-up-button clickable"
            @click="upLevel()"
          />
        </span>
      </div>
    </div>
  </div>
  <div
    v-for="item in rootFolders"
    :key="item._id"
    class="row justify-content-left g-0 item-row"
  >
    <div class="col">
      <svg-icon
        type="mdi"
        :path="iconMap[item._modelType]"
        color="lightblue"
        size="30"
        class="pb-2 icon"
      />
      <span
        class="col-auto clickable"
        @click="updateMainView(item._id, item._modelType, item.name)"
      >
        {{ item.name }}
      </span>
    </div>
    <div class="col-auto">
      <svg-icon
        type="mdi"
        :path="item.public ? mdiEarth : mdiLock"
        color="gray"
        size="30"
        class="pb-2 icon"
      />
      <span class="item-info"> {{ item.public ? 'Public' : 'Private' }}</span>
    </div>
  </div>
  <div
    v-for="item in rootItems"
    :key="item._id"
    class="row justify-content-left align-middle item-row"
  >
    <div class="col">
      <svg-icon
        type="mdi"
        :path="iconMap[item._modelType]"
        color="lightblue"
        size="30"
        class="pb-2 icon"
      />
      <span>
        {{ item.name }}
      </span>
    </div>
    <div class="col-auto">
      <span class="item-info">{{ sizeFormatter(item.size) }}</span>
    </div>
  </div>
</template>

<style scoped>
.breadcrumb {
  background-color: #eaebea;
}

.clickable {
    color: #337ab7;
}
.clickable:hover {
    cursor: pointer;
}
.number-badge {
    position: relative;
    bottom: 0px;
    right: 5px;
    height: 5px;
    background-color: #FFFFFFAA;
    color: 'black';
    font-size: 10px;
}
.item-row {
  border-top: 1px solid lightgray;
  border-left: 2px solid lightgray;
  border-right: 2px solid lightgray;
}
.item-row:hover {
  background-color: #fbfbf7;
}
.item-info {
  color: gray;
}
.level-up-button {
  border: 1px solid lightgray;
  margin-top: 5px;
  margin-bottom: 5px;
}
</style>
