import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { Form, Button, ListGroup, Badge } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";


const EventScreen = () => {
    // const [discord, setDiscord] = useState('')
    // const [password, setPassword] = useState('')
    // const [confirmPassword, setConfirmPassword] = useState('')

    // // const navigate = useNavigate()
    // const dispatch = useDispatch()

    // const [UpdatProfile, { isLoading }] = useUpdateUserMutation()

    // const { userInfo } = useSelector((state) => state.auth)

    // useEffect(() => {
    //     setDiscord(userInfo.discord)
    // }, [userInfo.setDiscord])

    const submitHandler = async (e) => {
    //     e.preventDefault()
    //     if (password === "" || confirmPassword === ""){
    //         toast.error("Password required")
    //     }else if (password !== confirmPassword) {
    //         toast.error("Passwords do not match")
    //     }else{
    //         try{
    //             const res = await UpdatProfile({
    //                 _id: userInfo._id,
    //                 discord,
    //                 password
    //             }).unwrap()
    //             dispatch(setCredentials({...res}))
    //             toast.info(`${userInfo.discord}'s profile has been updated`)
    //         }catch (err){
    //             toast.error((err?.data?.message || err.error))
    //         }
    //     }
    }

    return (
    <>
        <FormContainer>
            <h1>Existing Events</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className='my-2' controlId="previously-requested">
                    <Form.Label>Pending Requests</Form.Label>
                    <ListGroup>
                        <ListGroup.Item 
                          as="li" 
                          className="d-flex justify-content-between align-items-start" >
                            <div className="ms-2 me-auto">
                            <div className="fw-bold">Giga's with Chipy</div>
                            11-11-2023 11AM -5 UTC
                            </div>
                            <Badge bg="primary" pill>
                            3
                            </Badge>
                        </ListGroup.Item>
                
                    </ListGroup>
                </Form.Group>  
            </Form>
        </FormContainer>        
        <FormContainer>
            <h1>Create Event</h1>
            <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId="dino">
                    <Form.Label>New Request</Form.Label>
                    <Form.Control
                        as="select"
                        onChange={e=>{
                            console.log(e.target.value)
                            alert(`${e.target.value} has been requested`)
                        }}>
                        <option>Select Dino</option>
                        <option value="Pteradon">Pteradon</option>
                        <option value="Rex">Rex</option>
                        <option value="Racer">Racer</option>                    
                    </Form.Control>
                </Form.Group>   
                <Form.Group className='my-2' controlId="dino">
                    <Form.Label>New Request</Form.Label>
                    <Form.Control
                        type="text"
                        placeholder="Select a date"
                    />
                </Form.Group>                            
                
                <Button type='submit' variant="primary" className="mt-3">
                    Create 
                </Button>     
            </Form>
        </FormContainer>
    </>
  )
}

export default EventScreen