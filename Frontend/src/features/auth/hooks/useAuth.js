import { useContext, useEffect, useRef } from "react";
import { AuthContext } from "../auth.context";
import { login,register,logout, getMe } from "../services/auth.api";


export const useAuth = ()=>{
    const context = useContext(AuthContext)
    const {user,setUser,loading,setLoading} = context
    const hasCheckedAuth = useRef(false)

    const handleLogin = async ({email,password})=>{
        setLoading(true)

        try{
            const data=await login({email,password})
            setUser(data.user)
            hasCheckedAuth.current = true
            return data;
        }catch(err){
            console.error(err)
        } finally{
                setLoading(false)
        }
    }
    const handleRegister = async ({username,email,password})=>{
        setLoading(true)

        try{
        const data=await register({username,email,password})
        setUser(data.user)
        hasCheckedAuth.current = true
        }catch(err){
            console.error(err)
        } finally {
            setLoading(false)
        }
    }

    const handleLogout = async ()=>{
        setLoading(true)
        try{

        const data = await logout()
        setUser(null)
        hasCheckedAuth.current = false
        }catch(err){
            console.error(err)
        }finally{
            setLoading(false)
        }
    }

    useEffect(()=>{
        const getAndSetUser= async()=>{
            if(hasCheckedAuth.current) return
            try{
            const data=await getMe()
            setUser(data.user)
            hasCheckedAuth.current = true
            }catch(err){
            hasCheckedAuth.current = true
            } finally{
            setLoading(false)
            }
        }
        getAndSetUser()
    },[])

    return {user,loading,handleRegister,handleLogin,handleLogout}
}