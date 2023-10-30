import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react'

// this can stay empty cause we are using a proxy in config
const baseQuery = fetchBaseQuery({baseUrl: ''})

// Functionally this is the parent slice for all slices
// products or blog types can be tag types for if we don't 
// want to update after each change but only cache locally
// each of those might have their own ApiSlice that have their own endpoints
export const apiSlice = createApi({
    baseQuery,
    tagType: ['User'],
    endpoints: (builder) => ({})
})