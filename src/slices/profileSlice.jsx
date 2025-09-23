import { createSlice } from "@reduxjs/toolkit";
import { isTokenValid } from "../utils/auth";

const storedToken = localStorage.getItem("token") ? JSON.parse(localStorage.getItem("token")) : null;
const storedUser = localStorage.getItem("user") ? JSON.parse(localStorage.getItem("user")) : null;


const initialState = {
    user: isTokenValid(storedToken) ? storedUser : null,
    loading : false
}

const profileSlice = createSlice({
    name : "profile",
    initialState,
    reducers:{
        setUser(state, value){
            state.user = value.payload
        },

        setLoading(state, value){
            state.loading = value.payload
        }
    }
})

export const {setUser, setLoading} = profileSlice.actions;
export default profileSlice.reducer;