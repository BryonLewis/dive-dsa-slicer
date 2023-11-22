<script setup lang="ts">
import { onMounted, Ref, ref, watch } from 'vue'
import RestClient from '../../api/girderRest';
import { GirderModel, GirderModelType } from '../../girderTypes';
import { mdiAccount, mdiArrowUpRightBold, mdiChevronDoubleLeft, mdiChevronDoubleRight, mdiChevronDown, mdiChevronLeft, mdiChevronRight, mdiChevronUp,
mdiClose, mdiEarth, mdiFile, mdiFolder, mdiLock, mdiSitemap } from '@mdi/js';
import SvgIcon from '@jamescoyle/vue-icon';
import { Collapse } from 'vue-collapsed'
import { convertInputNumber, convertInputString, countFormatter, isValidRegex, sizeFormatter } from './utils'

import RootSelection from './RootSelection.vue';
import { XMLParameters } from '../../parser/parserTypes';
interface Props {
  apiUrl?: string;
  multi?: boolean;
  type?: 'file' | 'directory' | 'image' | 'new-file'
  multiple?: boolean;
  limit?: number,
  output?: boolean,
  validation?: (id: GirderModel) => ({ valid: boolean, msg?: string});
  name?: string;
  parentId?: string;
  girderId?: string;
}
const props = withDefaults(defineProps<Props>(), {
  apiUrl: 'api/v1',
  multi: false,
  type: 'file',
  limit: 100,
  multiple: false,
  output: undefined,
  parentId: undefined,
  girderId: undefined,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  validation: (_id: GirderModel) => ({ valid:true }),
});

const emit = defineEmits<{
    (e: "close"): void;
    (e: "submit", data : XMLParameters['fileValue']): void;
}>();

const errorMsg = ref('');

const submit = async () => {
  if (selectedModel.value === null) {
    selectedModel.value = await girderRest.get(`folder/${currentParentId.value}`);
  }
  if (selected.value !== null && selectedModel.value !== null) 
  {
    errorMsg.value = '';
    const result = props.validation(selectedModel.value);
    if (result.valid) {
      emit('submit', 
        {
          girderId: selected.value.girderId,
          name: selected.value.name,
          parentId: currentParentId.value,
          regExp: props.multi || props.multiple,
          fileId: selected.value.fileId,
        }
      );
    } else if (result.msg) {
      errorMsg.value = result.msg;
    }
  }
}

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
const currentParentType = ref('user');

const selected: Ref<null | {name: string, girderId: string, parentId?: string, fileId?: string}> = ref(null);
const selectedModel: Ref<null | GirderModel> = ref(null);

onMounted(async () => {
  await getData();
  if (props.parentId && props.girderId && props.name) {
    currentParentId.value = props.parentId;
    currentParentType.value = 'user';
    const hierarchy = (await (girderRest.get(`folder/${props.parentId}/rootpath`))).data;
    breadCrumb.value.type = hierarchy[0]['type'];
    breadCrumb.value.path = [];
    hierarchy.forEach((folder) => {
      let name = folder['object']['name'];
      if (!name && breadCrumb.value.type === 'user') {
        name = `${folder['object']['firstName']} ${folder['object']['lastName']}`
      } 
      breadCrumb.value.path.push({ name, id: folder['object']['_id'] });
    });
    const baseFolder = (await (girderRest.get(`folder/${props.parentId}`))).data;
    console.log(baseFolder);
    breadCrumb.value.path.push({name: baseFolder['name'], id: baseFolder['_id']});
    updateMainView(props.parentId, 'folder', '', true);
    selected.value = {
      name: props.name,
      girderId: props.girderId,
      parentId: props.parentId,
    }
    recalculatedSelected();
  }
})



const updateFolders = async (parentId: string, parentType: string) => {
  const responseFolders = await girderRest.get(`folder`, {
            params: {
                limit: props.limit,
                offset: folderOffset.value * props.limit,
                sort: 'name',
                sortdir: 1,
                parentType,
                parentId,

            },
        }
    );
    folderCount.value = parseInt(responseFolders.headers['girder-total-count']);
    rootFolders.value = responseFolders.data;
    return responseFolders.data;
};

const updateItems = async (parentId: string) => {
  const responseItems = await girderRest.get(`item`, {
                params: {
                    limit: props.limit,
                    offset: itemOffset.value * props.limit,
                    sort: 'name',
                    sortdir: 1,
                    folderId: parentId,

                },
            }
        );
        itemCount.value = parseInt(responseItems.headers['girder-total-count']);
        rootItems.value = responseItems.data;
    return responseItems.data;
}


const updateMainView = async (parentId: string, parentType: string, name = '', resetShow=false) => {
  if (props.type === 'directory' && parentType === 'folder') {
    selected.value = {
      name,
      girderId: parentId,
    };
  } else if (parentType !== 'folder') {
    selected.value = null;
  }

  currentParentId.value = parentId;
  currentParentType.value = parentType;
  if (resetShow) {
    itemShow.value = false;
    folderShow.value = false;
  }
    await updateFolders(parentId, parentType);
    if (parentType  === 'folder') {
      await updateItems(parentId)
    } else {
        rootItems.value = [];
    }
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



watch(folderOffset, () => updateFolders(currentParentId.value, currentParentType.value));
watch(itemOffset, () => updateItems(currentParentId.value));

const updateOffset = (type: 'folder' | 'item', value: number) => {
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

const selecting = async (item: GirderModel, type: 'folder' | 'file') => {
  if (type === props.type) {
    selected.value = {
      name: item.name,
      girderId: item._id,
      parentId: type === 'file' ? item.parentId || undefined : undefined, 
    };
    selectedModel.value = item;
  }
  if (type === 'file' && selected.value) {
    const files = (await (girderRest.get(`item/${item._id}/files`))).data
    if (files.length) {
      selected.value.fileId = files[0]['_id'];
    }
  }
}

const selectedItems: Ref<Record<string, boolean>> = ref({});

const setSelectedName = async (data: string) => {
  selected.value = {
    name: data,
    girderId: currentParentId.value,
    parentId: currentParentId.value
  };
  recalculatedSelected();
}

const setRegularExpression = (data: string) => {
  if (isValidRegex(data)) {
    selected.value = {
      name: data,
      girderId: data,
      parentId: currentParentId.value,
    };
    recalculatedSelected();
    errorMsg.value = '';
  } else {
    errorMsg.value = 'Specify a valid Regular Expression';
  }
}

const recalculatedSelected = () => {
  selectedItems.value = {};
  let reg: RegExp;
  if (selected.value?.name) {
    reg = new RegExp(selected.value.name);
  } else {
    return;
  }
    if (props.type !== 'directory' && rootItems.value) {
      rootItems.value.forEach((item) => {
        if (!props.multi && item.name === selected.value?.name) {
          selectedItems.value[item.name] = true;
        } else if (reg && reg.test(item.name)) {
          selectedItems.value[item.name] = true;
        }
      })
    }
    if (props.type === 'directory' && rootFolders.value) {
      rootFolders.value.forEach((item) => {
        if (!props.multi && item.name === selected.value?.name) {
          selectedItems.value[item.name] = true;
        } else if (reg && reg.test(item.name)) {
          selectedItems.value[item.name] = true;
        }
      })
    }
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
          <h4 class="modal-title header">
            File Browser
          </h4>
          <svg-icon
            type="mdi"
            :path="mdiClose"
            size="30"
            class="pb-2 icon close clickable"
            data-dismiss="modal"
            aria-label="Close"
            @click="emit('close')"
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
              <div class="col text-left pt-1">
                <span
                  v-for="(item, index) in breadCrumb.path"
                  :key="`breadCrumb_${item.id}`"
                >
                  <span
                    v-if="index === 0"
                    @click="updateMainView(item.id, breadCrumb.type, item.name, true);"
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
                    class="pb-1 icon"
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
                    size="25"
                    class="pb-2 icon level-up-button clickable"
                    @click="upLevel()"
                  />
                </span>
              </div>
            </div>
          </div>
          <div class="data-list">
            <div
              v-if="(folderCount > limit || itemCount > limit) && folderCount"
              class="folder-header"
            >
              <div class="row">
                <div class="col-2">
                  <svg-icon
                    type="mdi"
                    :path="folderShow ? mdiChevronDown : mdiChevronUp"
                    size="30"
                    class="icon clickable header"
                    @click="folderShow = !folderShow"
                  />
                  <span class="header">
                    Folders
                  </span>
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
                      <span class="header"> Page
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
              :when="!folderShow || !(rootFolders && rootFolders.length)"
            >
              <div
                v-for="item in rootFolders"
                :key="item._id"
                :class="{'selected-items' :selectedItems[item.name] || (selected && selected.girderId === item.girderId)}"
                class="row justify-content-left g-0 item-row"
                @click="selecting(item, 'folder'); updateMainView(item._id, item._modelType, item.name)"
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
              v-if="(itemCount > limit || folderCount > limit) && itemCount"
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
                  <span class="header">
                    Items
                  </span>
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
                      <span class="header"> Page
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
                        :class="{'disabled-icon': itemOffset >= Math.ceil(itemCount/limit)-1}"
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
              :when="!itemShow || !(rootItems && rootItems.length)"
            >
              <div
                v-for="item in rootItems"
                :key="item._id"
                class="row justify-content-left g-0  item-row"
                :class="{'selected-items' :selectedItems[item.name] || (selected && selected.girderId === item.girderId)}"
                @click="selecting(item, 'file')"
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
        <div
          v-if="['directory', 'file'].includes(type)"
          class="mx-5 selection mb-2"
        >
          <div v-if="!multi">
            <span> Selected {{ type === 'directory' ? 'folder' : 'file' }}:</span>
            <input
              v-if="type === 'directory'"
              :value="selected ? selected.name : 'Select a folder'"
              class="form-control"
              type="text"
              placeholder="Select a folder…"
              readonly
            >
            <input
              v-if="type === 'file'"
              :value="selected && selected.name"
              class="form-control"
              type="text"
              :placeholder="!output ? 'Select an item' : 'Output name:'"
              :disabled="!output || currentParentType !== 'folder'"
              @input="setSelectedName(convertInputString($event))"
            >        
          </div>
          <div v-else>
            <span> {{ type === 'directory' ? 'Folder' : 'Item' }} Filter (Regular Expression)</span>
            <input
              :value="selected && selected.name"
              class="form-control"
              type="text"
              placeholder="Regular Expression"
              @input="setRegularExpression(convertInputString($event))"
            >        
          </div>
        </div>
        <div
          v-if="errorMsg"
          class="mx-5 error-msg"
        >
          {{ errorMsg }}
        </div>
        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary"
            @click="emit('close')"
          >
            Cancel
          </button>
          <button
            type="button"
            class="btn btn-primary"
            data-dismiss="modal"
            :disabled="selected === null || !!errorMsg || (multi && Object.values(selectedItems).length === 0)"
            @click="submit"
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
  background-color: var(--bs-tertiary-bg);
  color: var(--bs-link-color)

}

.clickable {
    color: var(--bs-link-color);
}
.clickable:hover {
    cursor: pointer;
}

.disabled-icon{
  color: var(--bs-border-color);
}
.disabled-icon:hover {
  cursor: default;
}
.number-badge {
    position: relative;
    bottom: 0px;
    right: 5px;
    height: 5px;
    background-color: var(--bs-highlight-bg);
    color: var(--bs-body-color);
    font-size: 10px;
}
.item-row {
  border-top: 1px solid var(--bs-border-color);
  border-left: 2px solid var(--bs-border-color);
  border-right: 2px solid var(--bs-border-color);
  color: var(--bs-body-color)
}
.item-row:hover {
  background-color: var(--bs-highlight-bg);
  cursor: pointer;
}
.row-info {
  color: var(--bs-body-color);
  padding-right: 10px;
}
.level-up-button {
  border: 1px solid var(--bs-border-color);
  margin-top: 5px;
  margin-bottom: 5px;
}

.data-list {
  max-height: 70vh;
  max-width: 800px;
  overflow-y: auto;
  overflow-x: hidden;
  border-bottom: 1px solid var(--bs-border-color);

}
.folder-header {
  user-select: none;
  border-left: 2px solid var(--bs-border-color);
  border-right: 2px solid var(--bs-border-color);
  border-top: 1px solid var(--bs-border-color);
}

.item-header {
  user-select: none;
  border-left: 2px solid var(--bs-border-color);
  border-right: 2px solid var(--bs-border-color);
  border-top: 1px solid var(--bs-border-color);

}

.error-msg {
  font-weight: bold;
  color:red;
}

.selected-items {
  background-color: var(--bs-highlight-bg);
}

.header{
  color: var(--bs-body-color);
}

.selection {
  color: var(--bs-body-color);
}

</style>
