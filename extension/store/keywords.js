import { create } from "zustand";

export default create((set) => ({
    aps: '',
    setAps: (aps) => set({ aps }),
    query: '',
    setQuery: (query) => set({ query }),

    keywordPages: [],
    setKeywordPages: (data) => set((s) => ({ keywordPages: [...s.keywordPages, data] })),
    setKeywordPagesToDefault: (data) => set({ keywordPages: data }),
}))