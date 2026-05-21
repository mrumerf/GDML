import { create } from "zustand";
import { useExtractedData } from "./extractedData.js";

import useStore from './'

export const useHeaders = create((set, get) => ({

    //fba and non fba results
    fbaResults: 0,
    results: 0,
}))
