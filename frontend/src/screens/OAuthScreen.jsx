import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useRegisterMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";

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
    // Used for saving user's data to DB
    const [registerUser, { isLoading }] = useRegisterMutation()

    // once we have tokens this function does a double promise to get user AND guilds info
    // We then safe the info and register the user
    const fetchUserAll = (tokenType,accessToken) => {
        if (tokenType === undefined || accessToken === undefined) {
            console.log(`Invalid Token/Access skipping discord fetch`);
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
            // HERE is where we land when a user has successfully logged in and we have data
            const fetchedUser = {...data[0], guilds:data[1]}
            console.log("fetchedUser:")
            console.info(fetchedUser)
            toast.success(`Welcome ${fetchedUser.global_name}`)
            
            registerUser(fetchedUser).then(res=>{
                toast.info(`Fetching profile data . . . `)
                console.warn(JSON.stringify(res.data))
                dispatch(setCredentials(res.data))
                // http://localhost:3000/oauth#token_type=Bearer&access_token=16gcn6W4Rh3SjBfw2rNeAfqRNRfxO3&expires_in=604800&scope=identify+guilds
                // console.log(res.data.guild)
                // console.log(typeof res.data.guild)
                if (res.data.guild !== undefined) {
                    toast.success(`${res.data.guild}`)
                }else{
                    toast.warn("Please go to PROFILE and select a Discord Server", {autoClose: 10000})
                }
                
            }).catch(error => console.warn(`Failed to fetch UserData e:${error}`))        
        }).catch(function (err) {
            console.error(`DiscordError406: ${err}`)
        })
    }

    // Handle the initial sign in request but only run once
    useEffect(() => {
        if (!hasRunOnce.current){
            fetchUserAll(tokenType, accessToken)
            hasRunOnce.current = true
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array ensures this runs once on mount

    // Handle redirects once we have user info
    useEffect(() => {
        // redirect if signed in
        if (userInfo) {
            navigate('/home')
        }
    }, [navigate, userInfo])    

    return (
        <FormContainer>
            <h1>Authorizing</h1>  
            {isLoading && <Loader />}  
        </FormContainer>
    )
}
export default OAuthScreen