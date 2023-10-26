<script setup lang="ts">
import { Ref, onMounted, ref, watch } from 'vue'
import RestClient from '../../api/girderRest';
import { GirderModel, GirderModelType } from '../../girderTypes';
import { mdiAccount, mdiArrowUpRightBold, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp,
mdiClose, mdiEarth, mdiFile, mdiFolder, mdiLock, mdiSitemap } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';
import { Collapse } from 'vue-collapsed'

import RootSelection from './RootSelection.vue';
interface Props {
  apiUrl?: string;
  multi?: boolean;
  type?: 'item' | 'directory'
  limit?: number,
  validation?: (id: string) => ({ valid: boolean, msg?: string});
}
const props = withDefaults(defineProps<Props>(), {
  apiUrl: 'api/v1',
  multi: false,
  type: 'item',
  limit: 10,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validation: (_id: string) => ({ valid:true }),
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
const folderCount: Ref<number> = ref(0);
const folderShow: Ref<boolean> = ref(false);
const itemShow: Ref<boolean> = ref(false);
const itemCount: Ref<number> = ref(0);
const rootItems: Ref<GirderModel[] | null>  = ref(null);
const folderOffset: Ref<number> = ref(0);
const itemOffset: Ref<number> = ref(0);
const breadCrumb: Ref<{type: GirderModelType, path: {name:string, id: string}[]}> = ref({type: 'user', path:[]})

const currentParentId = ref('');
const currnetParentType = ref('user');

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

const countFormatter = (count: number | null) => {
  if (count && count > 1000) {
    return `${(count / 1000).toFixed(2)}k`;
  }
  return count ? count : 0;
}
const updateMainView = async (parentId: string, parentType: string, name = '', resetShow=false) => {
  currentParentId.value = parentId;
  currnetParentType.value = parentType;
  if (resetShow) {
    itemShow.value = false;
    folderShow.value = false;
  }
    const responseFolders = await girderRest.get(`folder`, {
            params: {
                limit: props.limit,
                offset: folderOffset.value,
                sort: 'name',
                sortdir: 1,
                parentType,
                parentId,

            },
        }
    );
    folderCount.value = responseFolders.headers['girder-total-count'];
    if (parentType  === 'folder') {
        const responseItems = await girderRest.get(`item`, {
                params: {
                    limit: props.limit,
                    offset: itemOffset.value,
                    sort: 'name',
                    sortdir: 1,
                    folderId: parentId,

                },
            }
        );
        itemCount.value = responseItems.headers['girder-total-count'];
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
    updateMainView(val, type, name, true);
}

const upLevel = () => {
  if (breadCrumb.value.path.length > 1) { // we can't go up if add root
    const newPath = breadCrumb.value.path[breadCrumb.value.path.length - 2]
    let newPathType = 'folder';
    if( breadCrumb.value.path.length === 2) {
      newPathType = breadCrumb.value.type;
    }
    updateMainView(newPath.id, newPathType, newPath.name, true)
  }
}

// This gets the main data for the Root Hierarchy Tool
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

watch(folderOffset, () => updateMainView(currentParentId.value, currnetParentType.value));

const updateOffset = (type: 'folder' | 'item', value: number) => {
  console.log(value);
  if (value < 0 || Number.isNaN(value)) {
    folderOffset.value = 0;
    return;
  }
  if (type === 'folder' && value >= Math.ceil(folderCount.value/ props.limit)) {
    folderOffset.value = Math.ceil(folderCount.value/ props.limit)-1;

    return;
  }
  if (type === 'item' && value >= Math.ceil(itemCount.value/ props.limit)) {
    itemOffset.value = Math.ceil(itemCount.value/ props.limit)-1;
    return;
  }
  if (type ==='folder') {
    folderOffset.value = value;
  }
  if (type === 'item') {
    itemOffset.value = value;
  }
}

const convertInputNumber = (e: Event) => {
  const val = (e.target as HTMLInputElement).value;
  return parseInt(val);
}
</script>

<template>
  <div
    class="modal modal-lg"
    tabindex="-1"
    role="dialog"
    style="display:block;"
  >
    <div
      class="modal-dialog modal-dialog-centered "
      role="document"
    >
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            File Browser
          </h5>
          <svg-icon
            type="mdi"
            :path="mdiClose"
            size="30"
            class="pb-2 icon close clickable"
            data-dismiss="modal"
            aria-label="Close"
          >
            <span aria-hidden="true">&times;</span>
          </svg-icon>
        </div>
        <div class="modal-body">
          <div class="container-fluid">
            <div
              class="row"
            >
              <root-selection
                v-if="home && user && collections && users"
                :home="user._id"
                :value="home"
                :collections="collections"
                :users="users"
                @change="setRoot($event)"
              />
            </div>
            <div class="row breadcrumb mb-0">
              <div class="col text-left">
                <span
                  v-for="(item, index) in breadCrumb.path"
                  :key="`breadCrumb_${item.id}`"
                >
                  <span
                    v-if="index === 0"
                    @click="updateMainView(item.id, breadCrumb.type, item.name, true)"
                  >
                    <svg-icon
                      type="mdi"
                      :path="iconMap[breadCrumb.type]"
                      color="lightblue"
                      size="30"
                      class="pb-2 icon clickable"
                    />
                    <span
                      class="clickable"
                    > 
                      {{ item.name }}
                    </span>

                  </span>
                  <span
                    v-else-if="index !== breadCrumb.path. length - 1"
                    class="clickable"
                    @click="updateMainView(item.id, 'folder', item.name, true)"
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
                  >{{ countFormatter(folderCount) }}</span>
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
                  >{{ countFormatter(itemCount) }}</span>
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
          <div class="data-list">
            <div
              v-if="folderCount > limit || itemCount > limit"
              class="folder-header"
            >
              <div class="row">
                <div class="col-2">
                  <svg-icon
                    type="mdi"
                    :path="folderShow ? mdiChevronDown : mdiChevronUp"
                    size="30"
                    class="icon clickable"
                    @click="folderShow = !folderShow"
                  />
                  Folders
                </div>
                <div class="col-8">
                  <div
                    v-if="folderCount > limit"
                    class="row justify-content-center"
                  >
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronDoubleLeft"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': folderOffset === 0}"
                        @click="updateOffset('folder', 0)"
                      />
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronLeft"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': folderOffset === 0}"
                        @click="updateOffset('folder', folderOffset - 1)"
                      />
                    </div>
                    <div class="col-auto">
                      <span> Page
                        <input
                          type="number"
                          :value="folderOffset + 1"
                          min="1"
                          Lmax=""
                          inputmode="numeric"
                          style="width:40px"
                          @change="updateOffset('folder', convertInputNumber($event))"
                        >

                        of {{ Math.ceil(folderCount / limit) }}</span>
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronRight"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': folderOffset >= Math.ceil(folderCount/limit)-1}"
                        @click="updateOffset('folder', folderOffset + 1)"
                      />
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronDoubleRight"
                        size="30"
                        :class="{'disabled-icon': folderOffset === Math.ceil(folderCount/limit)-1}"
                        class="icon clickable"
                        @click="updateOffset('folder', Math.ceil(folderCount/limit)-1)"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-2" />
              </div>
            </div>
            <Collapse
              v-show="rootFolders && rootFolders.length"
              :when="!folderShow"
            >
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
                  <span class="row-info"> {{ item.public ? 'Public' : 'Private' }}</span>
                </div>
              </div>
            </Collapse>
            <div
              v-if="itemCount > limit || folderCount > limit"
              class="item-header"
            >
              <div class="row">
                <div class="col-2">
                  <svg-icon
                    type="mdi"
                    :path="itemShow ? mdiChevronDown : mdiChevronUp"
                    size="30"
                    class="icon clickable"
                    @click="itemShow = !itemShow"
                  />
                  Items
                </div>
                <div class="col-8">
                  <div
                    v-if="itemCount > limit"
                    class="row justify-content-center"
                  >
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronDoubleLeft"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': itemOffset === 0}"
                        @click="updateOffset('item', 0)"
                      />
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronLeft"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': itemOffset === 0}"
                        @click="updateOffset('item', itemOffset - 1)"
                      />
                    </div>
                    <div class="col-auto">
                      <span> Page
                        <input
                          type="number"
                          :value="itemOffset + 1"
                          min="1"
                          Lmax=""
                          inputmode="numeric"
                          style="width:40px"
                          @change="updateOffset('item', convertInputNumber($event))"
                        >

                        of {{ Math.ceil(itemCount / limit) }}</span>
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronRight"
                        size="30"
                        class="icon clickable"
                        :class="{'disabled-icon': folderOffset >= Math.ceil(itemCount/limit)-1}"
                        @click="updateOffset('item', itemOffset + 1)"
                      />
                    </div>
                    <div class="col-auto">
                      <svg-icon
                        type="mdi"
                        :path="mdiChevronDoubleRight"
                        size="30"
                        :class="{'disabled-icon': itemOffset === Math.ceil(itemCount/limit)-1}"
                        class="icon clickable"
                        @click="updateOffset('item', Math.ceil(folderCount/limit)-1)"
                      />
                    </div>
                  </div>
                </div>
                <div class="col-2" />
              </div>
            </div>

            <Collapse
              v-show="rootItems && rootItems.length"
              :when="!itemShow"
            >
              <div
                v-for="item in rootItems"
                :key="item._id"
                class="row justify-content-left g-0  item-row"
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
                  <span class="row-info">{{ sizeFormatter(item.size) }}</span>
                </div>
                <div class="col-auto">
                  <svg-icon
                    type="mdi"
                    :path="item.public ? mdiEarth : mdiLock"
                    color="gray"
                    size="30"
                    class="pb-2 icon"
                  />
                  <span class="row-info"> {{ item.public ? 'Public' : 'Private' }}</span>
                </div>
              </div>
            </Collapse>
          </div>
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-dismiss="modal"
          >
            Confirm
          </button>
        </div>
      </div>
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

.disabled-icon{
  color: lightgray;
}
.disabled-icon:hover {
  cursor: default;
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
.row-info {
  color: gray;
  padding-right: 10px;
}
.level-up-button {
  border: 1px solid lightgray;
  margin-top: 5px;
  margin-bottom: 5px;
}

.data-list {
  max-height: 70vh;
  max-width: 800px;
  overflow-y: auto;
  border-bottom: 1px solid lightgray;

}
.folder-header {
  user-select: none;
  border-left: 2px solid lightgray;
  border-right: 2px solid lightgray;
  border-top: 1px solid lightgray;
}

.item-header {
  user-select: none;
  border-left: 2px solid lightgray;
  border-right: 2px solid lightgray;
  border-top: 1px solid lightgray;

}

</style>
