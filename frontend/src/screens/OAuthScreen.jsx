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
    const fetchDiscordInfo = (tokenType,accessToken) => {
        if (tokenType === undefined || accessToken === undefined) {
            console.log(`Invalid Token/Access skipping discord fetch`);
            return false
        }else{
            console.log(`${tokenType} -- ${accessToken}`);
            console.log(`Fetching Discord Info Started`);
        }
        
        const headers = {authorization: `${tokenType} ${accessToken}`}
        Promise.all([fetch('https://discord.com/api/users/@me', {headers}),
                     fetch('https://discord.com/api/users/@me/guilds', {headers})])
        .then(function (responses) {
            return Promise.all(responses.map(function (result) {
                return result.json()
            }))
        }).then(function (data) {
            // HERE is where we land when a user has successfully logged in and we have data
            // convert Guilds to an object instead of an unorder'd list
            // console.warn(data)
            let guilds = data[1].reduce((obj, item) => {
                obj[item.id] = item;
                return obj;
            }, {});
            
            // now combind them into a new user obj
            const fetchedUser = {...data[0], guilds: guilds}
            console.log("Discord User Info:")
            console.info(fetchedUser)
            toast.success(`Welcome ${fetchedUser.global_name}`)

            
            registerUser(fetchedUser).then(result=>{

                toast.info(`Fetching profile data . . . `)
                // rename for readability
                const profile = result.data.user
                console.warn(result)

                console.log("Full Profile")
                console.info(profile)

                dispatch(setCredentials(profile))

                // // report guild's info
                // console.log(`"guild" in profile  ${"guild" in profile  }`)
                // console.log(`profile.guild !== 0  ${profile.guild !== 0 }`)
                // console.log(`profile.guild: ${profile.guild} (${typeof profile.guild})`)  

                // // report guilds's info
                // console.log(`"guilds" in profile  ${"guilds" in profile  }`)
                // console.log(`profile.guilds: ${profile.guilds} (${typeof profile.guilds})`)  

                // // how to access in future
                // console.log(`profile.guild in profile.guilds  ${profile.guild in profile.guilds  }`)
                // console.log(`profile.guilds[profile.guild]  ${profile.guilds[profile.guild]  }`)
                // console.log(`profile.guilds[profile.guild].name  ${profile.guilds[profile.guild].name  }`)
     
                if ("guild" in profile  &&  
                    profile.guild !== "0" &&
                    profile.guild in profile.guilds) {
                    // console.info(res.data.guilds[res.data.guild])
                    toast.success(`Server: ${profile.guilds[profile.guild].name}`)
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
            fetchDiscordInfo(tokenType, accessToken)
            hasRunOnce.current = true
        }

    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []); // Empty array ensures this runs once on mount

    // Handle redirects once we have user info
    useEffect(() => {
        // redirect if signed in
        // if (userInfo) {
        //     navigate('/home')
        // }
    }, [navigate, userInfo])    

    return (
        <FormContainer>
            <h1>Authorizing</h1>  
            {isLoading && <Loader />}  
        </FormContainer>
    )
}
export default OAuthScreen