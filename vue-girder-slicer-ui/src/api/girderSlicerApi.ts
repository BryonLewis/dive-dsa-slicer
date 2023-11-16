import { XMLBaseValue, XMLPanel, XMLSpecification } from "../parser/parserTypes";
import RestClient from "./girderRest"

export interface SlicerImage {
    _id: string;
    description: string;
    image: string;
    name: string;
    type: string;

}

const fileTypes = ['file', 'directory', 'image', 'item', 'multi', 'new-file'];
const useGirderSlicerApi = (girderRest: RestClient) => {
    const getSlicerList = async (filter?: string) => {
        return girderRest.get<SlicerImage[]>('slicer_cli_web/cli');
    }
    const getSlicerXML = async(id: string) => {
        return girderRest.get(`slicer_cli_web/cli/${id}/xml`);
    }
    const validateParams = (xml:XMLSpecification) => {
        // Go through each parameter
        let valid = true;
        xml.panels.forEach((panel) => {
            panel.groups.forEach((group) => {
                group.parameters.forEach((parameter) => {
                    // Check for a value for each item;
                    // TODO More checks for other types for validation
                    if (!fileTypes.includes(parameter.type) && parameter.required && (parameter.value === undefined || parameter.value === null)) {
                        parameter.error = 'Value is not set';
                        valid = false;
                    }else if (!fileTypes.includes(parameter.type) && parameter.fileValue === undefined) {
                        parameter.error = 'Value is not set';
                        valid = false;
                    }else if (parameter.error) {
                    parameter.error = '';
                }
            });
            });
        });
        return valid;
    }
    const convertToParams = (xml:XMLSpecification) => {
        // Go through and convert the new values to parameters for the /slicer_cli_web/cli endpoint
        const params:Record<string, XMLBaseValue> = {}
        xml.panels.forEach((panel) => {
            panel.groups.forEach((group) => {
                group.parameters.forEach((parameter) => {
                    if (fileTypes.includes(parameter.type) && parameter.fileValue) {
                        if (parameter.type === 'new-file' || parameter.type === 'multi' || parameter.multiple) {
                            params[parameter.id] = parameter.fileValue.name;
                        } else {
                            params[parameter.id] = parameter.fileValue.girderId;
                        }
                        params[`${parameter.id}_folder`] = parameter.fileValue.parentId;
                    } else if (parameter.value !== undefined) {
                        params[parameter.id] = parameter.value;
                    }
                });
            });
        });
        return params;
    }
    const runTask = async (xml:XMLSpecification, taskid: string) => {
        if (validateParams(xml)) {
            const params = convertToParams(xml);
            const url = `slicer_cli_web/cli/${taskid}/run`
            console.log(params);
            return girderRest.post(url, null , { params });
        }
        return false;

    }

    return {
        getSlicerList,
        getSlicerXML,
        validateParams,
        convertToParams,
        runTask,
    }
}

export {
    useGirderSlicerApi
}
