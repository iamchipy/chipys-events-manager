import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
    

const OAuthScreen = () => {
    // website navigation
    const navigate = useNavigate()
    const dispatch = useDispatch()    

    // redirect if signed in
    const { userInfo } = useSelector((state) => state.auth)
    useEffect(() => {
        if (userInfo) {
            navigate('/')
        }
    }, [navigate, userInfo])

    // Discord OAuth
    // Look for the fragment that will be returned to this URI
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];
    
    // check if we received something
    if (!accessToken) {
        toast.warning("Discord Token Missing")
    }else {
        // if we do hav a token then lets fetch info
        fetch('https://discord.com/api/users/@me', {
            headers: {
                authorization: `${tokenType} ${accessToken}`,
            },
        }).then(result => result.json()).then(response => {
                const {id, username, discriminator, avatar, global_name} = response;
                toast.success(`Welcome ${global_name}`)
                dispatch(setCredentials({id, username, discriminator, avatar, global_name}))
            }).catch(console.error);
    }

    return (
        <FormContainer>
            <h1>Sign In</h1>        
            {/* <Form onSubmit={submitHandler}> */}
            <Form >
                <Button type='submit' variant="primary" className="mt-3">
                    Sign In 
                </Button>     
            </Form>
        </FormContainer>
    )
}
export default OAuthScreen