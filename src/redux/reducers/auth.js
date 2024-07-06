import { createSlice } from "@reduxjs/toolkit";

const initialState = {
    email: null,
    id: null,
    name: null
}

const authSlice = createSlice({
    name: "auth",
    initialState,
    reducers: {
        userExists: (state, action)=>{
            state.email = action.payload.email
            state.id = action.payload.id
            state.name = action.payload.name
        },
        userNotExists: (state)=>{
            state.email = null;
            state.id = null;
            state.name = null;
        }
    }
})

export default authSlice;
export const {userExists, userNotExists} = authSlice.actions;
