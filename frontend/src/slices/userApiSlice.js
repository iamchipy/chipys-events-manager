import { apiSlice } from "./apiSlice";
const USERS_URL = '/api/users'

export const usersApliSplice = apiSlice.injectEndpoints({
    endpoints: (builder) => ({
        login: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/auth`,
                method: 'POST',
                body: data
            })
        }),
        register: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/`,
                method: 'POST',
                body: data
            })
        }), 
        updateUser: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/profile`,
                method: 'PUT',
                body: data
            })
        }), 
        getProfile: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/profile`,
                method: 'GET'
            })
        }),          
              
        logout: builder.mutation({
            query: () => ({
                url: `${USERS_URL}/logout`,
                method: 'POST'
            }),
        }),    
        request: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/request`,
                method: 'POST',
                body: data
            })                 
        }),   
        fetchPending: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/fetchPending`,
                method: 'PUT',
                body: data
            })                 
        }), 
        fetchPendingByFilter: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/fetchPendingByFilter`,
                method: 'PUT',
                body: data
            })                 
        }),          
        updateRequest: builder.mutation({
            query: (data) => ({
                url: `${USERS_URL}/updateRequest`,
                method: 'PUT',
                body: data
            })                 
        }),             
                                
    })
})

export const { 
    useLoginMutation,
    useLogoutMutation,
    useRegisterMutation,
    useUpdateUserMutation,
    useRequestMutation,
    useFetchPendingMutation,
    useUpdateRequestMutation,
    useGetProfileMutation,
    useFetchPendingByFilterMutation } = usersApliSplice