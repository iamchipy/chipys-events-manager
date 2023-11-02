import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import discordOAuthURL from "../components/DiscordOAuthURL";

const RegisterScreen = () => {

    const navigate = useNavigate()

    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
        if (userInfo) {
            navigate('/home')
        }else{
            window.location.href = discordOAuthURL
        }
    }, [navigate, userInfo])

    return (
    <FormContainer>
        <h1>DISCORD</h1>
    </FormContainer>
  )
}

export default RegisterScreen