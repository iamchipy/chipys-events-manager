import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Form, Button, Row, Col } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import Loader from '../components/Loader'
import {useRegisterMutation} from '../slices/userApiSlice'
import { setCredentials } from "../slices/authSlice";

const RegisterScreen = () => {
    const [discord, setDiscord] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')

    const navigate = useNavigate()
    const dispatch = useDispatch()

    const [register, { isLoading }] = useRegisterMutation()

    const { userInfo } = useSelector((state) => state.auth)

    useEffect(() => {
        if (userInfo) {
            navigate('/')
        }
    }, [navigate, userInfo])

    const submitHandler = async (e) => {
        e.preventDefault()
        if (password !== confirmPassword){
            toast.error("Passwords do not match")
        }else{
            try{
                const res = await register({ discord, password }).unwrap()
                dispatch(setCredentials({...res}))
                navigate('/')
            }catch (err) {
                toast.error((err?.data?.message || err.error))
            }
        }
    }
    return (
    <FormContainer>
        <h1>Sign Up</h1>
        <Form onSubmit={submitHandler}>
            <Form.Group ClassName='my-2' controlId="discord">
                <Form.Label>Discord ID</Form.Label>
                <Form.Control 
                    type="text"
                    placeholder="Enter DiscordID"
                    value={discord}
                    onChange={(e)=>setDiscord(e.target.value)}
                ></Form.Control>
            </Form.Group>
            <Form.Group ClassName='my-2' controlId="password">
                <Form.Label>Password</Form.Label>
                <Form.Control 
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e)=>setPassword(e.target.value)}
                ></Form.Control>
            </Form.Group>  
            <Form.Group ClassName='my-2' controlId="confirmPassword">
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
                Sign Up 
            </Button>     

            <Row className="py-3">
                <Col>
                    Already registered? <Link to='/login'>Sign In</Link>
                </Col>
            </Row>
        </Form>
    </FormContainer>
  )
}

export default RegisterScreen