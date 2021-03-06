import React from 'react';

import { createSlice } from '@reduxjs/toolkit'


export const adminPageDrawerSlice = createSlice({
    name: 'adminPageDrawer',
    initialState: {
        open: false,
        pages: undefined,
        page: undefined
    },
    reducers: {
        openAdminPageDrawer: (state) => {
            state.open =true;
        },
        closeAdminPageDrawer: (state) => {
            state.open =false;
        },
        setPages: (state,actions) => {
            state.pages=actions.payload;
        },
        addPage: (state,actions) => {
            state.pages.push(actions.payload);
        },
        setPage: (state,actions) => {
            state.page=actions.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { openAdminPageDrawer,closeAdminPageDrawer,setPages,addPage,setPage } = adminPageDrawerSlice.actions

export default adminPageDrawerSlice.reducer