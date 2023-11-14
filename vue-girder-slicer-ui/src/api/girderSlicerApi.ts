import { XMLPanel, XMLSpecification } from "../parser/parserTypes";
import RestClient from "./girderRest"

export interface SlicerImage {
    _id: string;
    description: string;
    image: string;
    name: string;
    type: string;

}

const useGirderSlicerApi = (girderRest: RestClient) => {
    const getSlicerList = async (filter?: string) => {
        return girderRest.get<SlicerImage[]>('slicer_cli_web/cli');
    }
    const getSlicerXML = async(id: string) => {
        return girderRest.get(`slicer_cli_web/cli/${id}/xml`);
    }

    const validateParams = (xml :XMLSpecification) => {
        // Go through each parameter
        xml.panels.forEach((panel) => {
            panel.groups.forEach((group) => {
                group.parameters.forEach((parameter) => {
                    // Check for a value for each item;
                    // TODO More checks for other types for validation
                    if (parameter.type !== 'boolean' && !parameter.value) {
                        parameter.error = 'Value is not set';
                    } else if (parameter.error) {
                        parameter.error = '';
                    }
                });
            });
        });
    }

    return {
        getSlicerList,
        getSlicerXML,
        validateParams,
    }
}

export {
    useGirderSlicerApi
}
