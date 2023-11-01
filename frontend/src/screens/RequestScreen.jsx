import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { Form, Button, ListGroup, Badge } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useRequestMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"


const RequestScreen = () => {
    const [discord, setDiscord] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [multiSelections, setMultiSelections] = useState([]);

    const getDinoImage = (i) => {
        return dinoNames[i]
    }

    // const navigate = useNavigate()
    const dispatch = useDispatch()

    const [requestDino, { isLoading }] = useRequestMutation()

    const { userInfo } = useSelector((state) => state.auth)

    // load user data if it exists
    useEffect(() => {
        setDiscord(userInfo.discord)
    }, [userInfo.setDiscord])

    const requestHandler = async (e) => {
        e.preventDefault()
        // if user isn't logged in
        
        if (!userInfo.id) {
            toast.error("Please log in")
        }else{
            // if we have something selected to add
            if (multiSelections !== ""){
                toast.info(`Requesting... ${multiSelections}`)
                console.log(typeof multiSelections)
                await requestDino({ multiSelections, userInfo }).unwrap()
            }
        }
    }

    return (
    <FormContainer>
        <h1>Request Dinos</h1>
        <Form onSubmit={requestHandler}>
            <Form.Group className='my-2' controlId="previously-requested">
                <Form.Label>Pending Requests</Form.Label>
                <ListGroup>
                    <ListGroup.Item as="li" className="d-flex justify-content-between align-items-start">
                        <div className="ms-2 me-auto">
                        <div className="fw-bold">
                            <img width="55" src="https://www.dododex.com/media/creature/archaeopteryx.png" />
                            Archaeopteryx
                        </div>
                        Reqested on 10-30-2023
                        </div>
                        <Badge bg="primary" pill>
                        14
                        </Badge>
                    </ListGroup.Item>
               
                </ListGroup>
            </Form.Group>
            <Form.Group className="mt-3">
                <Form.Label>Select Desired Dinos</Form.Label>
                <Typeahead
                    id="basic-typeahead-multiple"
                    labelKey="name"
                    multiple
                    onChange={setMultiSelections}
                    highlightOnlyResult={false}
                    options={dinoNames}
                    placeholder="Choose several states..."
                    selected={multiSelections}
                />
            </Form.Group>               

            {isLoading && <Loader />}             
            <Button type='submit' variant="primary" className="mt-3">
                Request 
            </Button>     
        </Form>
    </FormContainer>
  )
}

export default RequestScreen