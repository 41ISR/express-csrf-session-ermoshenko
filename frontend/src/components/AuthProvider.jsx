import {Outlet, useNavigate} from "react-router-dom"
import { useAuthStore } from "../store/useAuthStore"
import { useEffect } from "react"

const AuthProvider = () => {

    useEffect (()=> {
        const init = async () => {
            await checkAuth()
        }
        init()
    }, [])

    const {user, checkAuth} = useAuthStore()
    const navigate = useNavigate
    if(!user) navigate("/signin")
    return <Outlet />
}

export default AuthProvider