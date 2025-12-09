import {create} from "zustand"
export const useAuthStore = create ((set, get) => ({
    user: undefined,
    checkAuth: async () =>{
        try {
            const res = await fetch("https://symmetrical-engine-69465rq9xpvpf47gx-3000.app.github.dev/auth/me", {
                credentials: "include"
            })
            if (!res.ok) throw new Error(res.error)
            if (!res.body) return
            set((state) => ({...state, user: res.body}))  
    }
    catch (error) {
            console.error(error);
        }
}}))