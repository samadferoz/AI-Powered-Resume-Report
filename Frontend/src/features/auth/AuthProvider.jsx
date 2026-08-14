import {useState, useEffect} from "react";
import { AuthContext } from "./auth.context.jsx";
import { getMe } from "./services/auth.api";

export const AuthProvider = ({children}) =>{
    const [user, setUser] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkUser = async () => {
            try {
                const data = await getMe()
                setUser(data.user)
            } catch (err) {
                console.log("User not authenticated")
                setUser(null)
            } finally {
                setLoading(false)
            }
        }
        checkUser()
    }, [])

    return (
        <AuthContext.Provider value={{user, setUser, loading, setLoading}}>
            {children}
        </AuthContext.Provider>
    )
}
