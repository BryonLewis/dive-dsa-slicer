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
        return girderRest.get('slicer_cli_web/cli');
    }
    const getSlicerXML = async(id: string) => {
        return girderRest.get<SlicerImage[]>(`slicer_cli_web/cli/${id}/xml`);
    }
    return {
        getSlicerList,
        getSlicerXML,
    }
}

export {
    useGirderSlicerApi
}
