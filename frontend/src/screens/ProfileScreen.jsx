import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";

const ProfileScreen = () => {
    const [discord, setDiscord] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    // const navigate = useNavigate()
    const dispatch = useDispatch()

    const [UpdatProfile, { isLoading }] = useUpdateUserMutation()

    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
        setDiscord(userInfo.discord)
    }, [userInfo.setDiscord])

    const submitHandler = async (e) => {
        e.preventDefault()
        if (password === "" || confirmPassword === ""){
            toast.error("Password required")
        }else if (password !== confirmPassword) {
            toast.error("Passwords do not match")
        }else{
            try{
                const res = await UpdatProfile({
                    _id: userInfo._id,
                    discord,
                    password
                }).unwrap()
                dispatch(setCredentials({...res}))
                toast.info(`${userInfo.discord}'s profile has been updated`)
            }catch (err){
                toast.error((err?.data?.message || err.error))
            }
        }
    }
    return (
    <FormContainer>
        <h1>Update Profile</h1>
        <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId="discord">
                <Form.Label>Discord ID</Form.Label>
                <Form.Control 
                    type="text"
                    placeholder="Enter DiscordID"
                    value={discord}
                    onChange={(e)=>setDiscord(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group className='my-2' controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                ></Form.Control>
            </Form.Group>  
            <Form.Group className='my-2' controlId="confirmPassword">
                <Form.Label>Confirm Password</Form.Label>
                <Form.Control 
                    type="password"
                    placeholder="Confirm"
                    value={confirmPassword}
                    onChange={(e)=>setConfirmPassword(e.target.value)}
                ></Form.Control>
            </Form.Group>     
            {isLoading && <Loader />}             
            <Button type='submit' variant="primary" className="mt-3">
                Update 
            </Button>     
        </Form>
    </FormContainer>
  )
}

export default ProfileScreen