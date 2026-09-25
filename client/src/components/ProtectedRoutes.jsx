import { useSelector } from "react-redux"
import { Navigate } from "react-router-dom";

export const ProtectedRoute = ({children}) => {
    const {isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    return children;
}
export const AuthenticatedUser = ({children}) => {
    const {user, isAuthenticated} = useSelector(store=>store.auth);

    if(isAuthenticated){
        const isAdmin = user?.role === "instructor" || user?.role === "admin";
        return <Navigate to={isAdmin ? "/admin/dashboard" : "/student/dashboard"}/>
    }

    return children;
}


export const AdminRoute = ({children}) => {
    const {user, isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    const isAdmin = user?.role === "instructor" || user?.role === "admin";
    if(!isAdmin){
        return <Navigate to="/student/dashboard"/>
    }

    return children;
}

export const StudentRoute = ({children}) => {
    const {user, isAuthenticated} = useSelector(store=>store.auth);

    if(!isAuthenticated){
        return <Navigate to="/login"/>
    }

    if(user?.role !== "student"){
        return <Navigate to="/admin/dashboard"/>
    }

    return children;
}


