import { useDispatch } from 'react-redux';
import { useLogoutMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import FormContainer from '../components/FormContainer';
import Loader from '../components/Loader';
import { useEffect } from 'react';

//TODO ERROR ON THIS PAGE FROM SOMETHING UNKNOWN
const LogoutScreen = () => {
  const dispatch = useDispatch()
  const navigate = useNavigate
  const [logoutApiCall] = useLogoutMutation()

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap();
      dispatch(logout());
      navigate('/');
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    logoutHandler();
  }, []);

  return (
    <FormContainer>
      <h1>Session Timeout</h1>
      {<Loader />}
    </FormContainer>
  )
}
export default LogoutScreen