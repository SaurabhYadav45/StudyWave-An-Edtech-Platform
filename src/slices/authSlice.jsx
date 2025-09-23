import { createSlice } from "@reduxjs/toolkit";
import { isTokenValid } from "../utils/auth";

const storedToken = localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null;

const initialState = {
    signupData: null,
    loading: false,
    token: isTokenValid(storedToken) ? storedToken : null,
}

const authSlice = createSlice({
    name : "auth",
    initialState : initialState,
    reducers:{
        setSignupData(state, value){
            state.signupData = value.payload
        },

        setLoading(state, value){
            state.loading = value.payload
        },

        setToken(state, value){
            state.token = value.payload;
        },
    }
})

export const{setSignupData, setLoading, setToken}  = authSlice.actions;
export default authSlice.reducer;