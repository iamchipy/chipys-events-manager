// import { useState, useEffect } from "react";
// import { Link, useNavigate } from "react-router-dom";
// import { Form, Button, Row, Col } from "react-bootstrap";
// import { useDispatch, useSelector} from 'react-redux'
// import FormContainer from "../components/FormContainer";
// import { useLoginMutation } from "../slices/userApiSlice";
// import { setCredentials } from "../slices/authSlice";
// import { toast } from "react-toastify";
// import Loader from '../components/Loader'
// import discordOAuthURL from "../components/DiscordOAuthURL";

// const LoginScreen = () => {
//     const [discord, setDiscord] = useState('')
//     const [password, setPassword] = useState('')

//     const navigate = useNavigate()
//     const dispatch = useDispatch()

//     const [login, { isLoading }] = useLoginMutation()

//     const { userInfo } = useSelector((state) => state.auth)

//     useEffect(() => {
//         if (userInfo) {
//             navigate('/home')
//         }
//     }, [navigate, userInfo])

//     const submitHandler = async (e) => {
//         e.preventDefault()
//         // console.log('login pressed')
//         try{
//             const res = await login({ discord, password }).unwrap()
//             console.log({...res})
//             dispatch(setCredentials({...res}))
//             // navigate('/')
//         }catch (err) {
//             // adding "?." appears to let you skip ignore undefined parts and search for ".message"
//             let errMsg = (err?.data?.message || err.error)
//             console.log(errMsg)
//             toast.error(errMsg)
//         }
//     }

//     return (
//     <FormContainer>
//         <h1>Sign In</h1>
//         <Form onSubmit={submitHandler}>
//             <Form.Group className='my-2' controlId="discord">
//                 <Form.Label>Discord ID</Form.Label>
//                 <Form.Control 
//                     type="text"
//                     placeholder="Enter DiscordID"
//                     value={discord}
//                     onChange={(e)=>setDiscord(e.target.value)}
//                 ></Form.Control>
//             </Form.Group>
//             <Form.Group className='my-2' controlId="password">
//                 <Form.Label>Password</Form.Label>
//                 <Form.Control 
//                     type="password"
//                     placeholder="Password"
//                     value={password}
//                     onChange={(e)=>setPassword(e.target.value)}
//                 ></Form.Control>
//             </Form.Group>   
//             {isLoading && <Loader />} 
//             <Button type='submit' disabled={true} variant="primary" className="mt-3">
//                 Sign In 
//             </Button>     
//             <Row className="py-3">
//                 <Col>
//                     New User? <Link to='/register'>Sign Up</Link>
//                 </Col>
//                 <Col>
//                     <Link to={discordOAuthURL}>
//                         Sign In with Discord!
//                         <img width="80" src="https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a69f118df70ad7828d4_icon_clyde_blurple_RGB.svg" />
//                     </Link>
//                 </Col>
//             </Row>
//         </Form>
//     </FormContainer>
//   ) 
// }

// export default LoginScreen