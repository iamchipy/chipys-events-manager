import { Navigate, Outlet } from "react-router-dom";
import { useSelector } from 'react-redux';

export const PrivateRoute = () => {
    const { userInfo } = useSelector((state)=>state.auth)

    // // getting a bit more careful and detailed here
    if (userInfo.token == undefined){
      return (<Navigate to='/logout' replace />)
    }else{
      return (<Outlet /> )
    }
  
}

export default PrivateRoute

