export type ParamGUIType = 'number'
  | 'boolean'
  | 'string'
  | 'number-vector'
  | 'string-vector'
  | 'number-enumeration'
  | 'string-enumeration'
  | 'region'
  | 'image'
  | 'file'
  | 'item'
  | 'directory'
  | 'multi';

export type ParamSlicerType = 'integer' | 'float' | 'double' | 'boolean' | 'string'
    | 'integer-vector'
    | 'float-vector'
    | 'double-vector'
    | 'string-vector'
    | 'integer-enumeration'
    | 'float-enumeration'
    | 'double-enumeration'
    | 'string-enumeration'
    | 'region'
    | 'image'
    | 'file'
    | 'item'
    | 'directory'
    | 'multi'
    | 'new-file';

export type XMLBaseValue = (number | string | number[] | string[] | boolean);

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

export interface XMLGroups {
  description: string;
  label: string;
  parameters: XMLParameters[];

}

export interface XMLPanel {
  advanced: boolean;
  groups: XMLGroups[];
}

export interface XMLSpecification {
  title: string;
  license: string;
  description: string;
  version: string;
  'documentation-url'?: string;
  acknowledgements?: string;
  contributor?: string;
  panels: XMLPanel[];
}