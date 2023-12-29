# Girder Slicer UI

This is a vue based component library to interface with the girder slicer CLI plugin. 
https://github.com/girder/slicer_cli_web

This Vue component library can be used with the above plugin to list and set values for slicer CLI plugins.

# GirderSlicerTasksIntegrated.vue

This is a single component that provies a listing of the tasks as well as an interface to set the paramemter values.

## Customization

### apiURL
The URL of the base girder instance that contains the slicer cli plugin.  This defaults to the current host `/api/v1`

### filter
A filter function that can be used to remove tasks from the listing.  This will be run on every task that is returned from the `/slicer_cli_web/cli` endpoint.  It takes a function of the type `(item: SlicerTask) => boolean` where returning true will display the task and returning false will filter out the task.

```
export interface SlicerTask {
    _id: string;
    description: string;
    image: string;
    name: string;
    type: string;
}
```

### defaults

A function that iterates through every task parameter and enables setting default values.
`(item: XMLParameters) => undefined | null | XMLParameters`
```
export interface XMLParameters {
  type: ParamSlicerType;
  slicerType: ParamGUIType;
  title: string;
  description: string;
  channel?: 'input' | 'output';
  id: string;
  value?: XMLBaseValue;
  values?: XMLBaseValue[];
  constraints?: {min?: XMLBaseValue; max?: XMLBaseValue; step?: XMLBaseValue};
  defaultValue?: XMLBaseValue;
  // Extra
  fileValue?: {
    girderId: string; // item/folder Id for the selected item
    name: string; //File Name for display purposes
    parentId: string; // Parent folder to open when using DataBrowser
    regExp?: boolean | undefined; // When selecting multiple the regExp pattern
    fileId?: string | undefined; // fileId used
  }; // Added to handle files
  required?: boolean;
  extensions?: string | undefined;
  reference?: string | undefined;
  defaultNameMatch?: string | undefined;
  defaultPathMatch?: string | undefined;
  defaultRelativePath?: string | undefined;
  multiple?: boolean;
  datalist?: boolean;
  shapes?: string | undefined;
  error?: string | undefined; // Used to display errors
}
```
You can take the XMLParameter information and set a default `fileValue` or default  `value | values` to indicate what it should be.
I.E:
```
(item: XMLParamemters) => {
    if (item.channel == 'input' and item.type === 'file') {
        const updatedItem = {...item}
        item.fileValue = {
          fileId: '6433f9123b271b58c749ddbc',
          girderId: '6433f9123b271b58c749ddbb',
          name: 'SampleVideo.mp4',
          parentId: '6433f9113b271b58c749ddb6',
          regExp: false,
        }
    }
}
```
This is used to set default values.

## Color Customization

There are some global css variables that are used to set the colors used in the system:
```
:root {
  --gsu-color-primary: rgb(59, 130, 246);
  --gsu-color-secondary: #000;
  --gsu-color-link: rgb(56, 189, 248);
  --gsu-color-text: #dcdcdc;
  --gsu-color-muted-text: #d6d6d692;
  --gsu-color-background: rgb(75, 85, 99);
  --gsu-background-muted: rgb(107, 114, 128);
  --gsu-color-highlight: rgb(250, 204, 21);
  --gsu-color-selected: rgb(250, 204, 21):
}
```
These variables can be modified to change the visual styling of the system.
