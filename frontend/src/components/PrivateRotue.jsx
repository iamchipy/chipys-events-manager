import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from "react-redux/es/hooks/useSelector";

export const PrivateRoute = () => {
    const { userInfo } = useSelector((state)=>state.auth)

  return userInfo ? <Outlet /> : <Navigate to='/home' replace />
}

export default PrivateRoute