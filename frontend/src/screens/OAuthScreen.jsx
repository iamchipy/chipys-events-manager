import { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
// import { fetchUserAll } from "../components/DiscordFetchUser";
    

const OAuthScreen = () => {
    // website navigation
    const navigate = useNavigate()
    const dispatch = useDispatch()    
    const hasRunOnce = useRef(false)
    // Discord OAuth
    // Look for the fragment that will be returned to this URI
    const fragment = new URLSearchParams(window.location.hash.slice(1))
    const [accessToken, tokenType] = [fragment.get('access_token'), fragment.get('token_type')];    

    // Extract authentication info
    const { userInfo } = useSelector((state) => state.auth)

    const fetchUserAll = (tokenType,accessToken) => {
        if (tokenType === undefined || accessToken === undefined) {
            console.log(`Invalid Toekn/Access skipping discord fetch`);
            return false
        }else{
            console.log(`${tokenType} -- ${accessToken}`);
            console.log(`Fetching All Started`);
        }
        
        const headers = {authorization: `${tokenType} ${accessToken}`}
        Promise.all([fetch('https://discord.com/api/users/@me', {headers}),
                     fetch('https://discord.com/api/users/@me/guilds', {headers})])
        .then(function (responses) {
            return Promise.all(responses.map(function (res) {
                return res.json()
            }))
        }).then(function (data) {
            const fetchedUser = {...data[0], guilds:data[1]}
            console.log(fetchedUser)
            dispatch(setCredentials(fetchedUser))
            
        }).catch(function (err) {
            console.error(`DiscordError406: ${err}`)
        })
    }

    useEffect(() => {
        if (!hasRunOnce.current){
            fetchUserAll(tokenType, accessToken)
            hasRunOnce.current = true
        }

    }, []); // Empty array ensures this runs once on mount

    useEffect(() => {
        // redirect if signed in
        if (userInfo) {
            navigate('/home')
        }
    }, [navigate, userInfo])    

    

        // const userInfo = fetchUserAll(tokenType, accessToken)
        // console.warn(JSON.stringify(userInfo))
        
    
        // console.log(`Access Token Present ${JSON.stringify(accessToken)}`);
        // let userInfo = {}
        // // if we do have a token then lets fetch user info
        // fetch('https://discord.com/api/users/@me', {
        //     headers: {
        //         authorization: `${tokenType} ${accessToken}`,
        //     },
        // })
        //     .then(result => result.json())
        //     .then(response => {
        //         console.log(`AUTH RES ${JSON.stringify(response)}`);
        //         const {id, username, discriminator, avatar, global_name} = response;
        //         userInfo = {
        //             id: id,
        //             username: username,
        //             idiscriminatord: discriminator,
        //             avatar: avatar,
        //             global_name: global_name,
        //         }
        //         toast.success(`Welcome ${global_name}`)
        //     }).catch(console.error);

        // console.log(`userInfo After 1 ${JSON.stringify(userInfo)}`);
        // fetch('https://discord.com/api/users/@me/guilds', {
        //     headers: {
        //         authorization: `${tokenType} ${accessToken}`,
        //     },
        // })
        //     .then(result => result.json())
        //     .then(response => {
        //         userInfo["guilds"] = response
        //         console.log(`guilds: ${JSON.stringify(response)}`);
        //     })
        //     console.log(`userInfo After 2 ${JSON.stringify(userInfo)}`);
        //     // cache the creds
        //     dispatch(setCredentials(userInfo))
    

    return (
        <FormContainer>
            <h1>Authorizing</h1>        
        </FormContainer>
    )
}
export default OAuthScreen