import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
import { Form, Button, ListGroup, Badge } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useRequestMutation, useFetchPendingMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
// import PendingDinoRequestsGroup from "../components/PendingRequestsGroup.jsx";

const RequestScreen = () => {
    const [multiSelections, setMultiSelections] = useState([]);

    const [requestDino, { isLoading }] = useRequestMutation()
    const [fetchPending] = useFetchPendingMutation() 

    // get user info
    const { userInfo } = useSelector((state) => state.auth)

    // define the state tracker
    const [listItems, setItems] = useState([])

    // variable for requests to be temp stored to do updates from
    let tempRequestList = []

    // function to fetch the data
    async function fetchData() {
        const response = await fetchPending({ userInfo })
        tempRequestList = response.data
        // console.log("response.data ===?")
        // console.info(JSON.stringify(tempRequestList))
        setItems(tempRequestList)
        // console.info(listItems)
    }

    useEffect(()=>{
        //placeholder
        console.log(listItems)
    },[listItems])

    const requestHandler = async (e) => {
        e.preventDefault()
        // if user isn't logged in
        
        if (!userInfo.id) {
            toast.error("Please log in")
        }else{
            // if we have something selected to add
            if (multiSelections !== ""){
                toast.info(`Requesting... ${multiSelections}`)
                // console.log(typeof multiSelections)
                await requestDino({ multiSelections, userInfo })
            }

            // update list
            try{
                fetchData(userInfo)
            }catch (err){
                console.warn("Trouble fetching pending dino request history:")
                console.warn(err)
            }            
        }          
    }

    return (
    <FormContainer>
        <h1>Request Dinos</h1>
        <Form onSubmit={requestHandler}>
            <Form.Group className='my-2' controlId="previously-requested">
                <ListGroup>
                    <Form.Label>Pending Requests</Form.Label>
                    {listItems.map((item, index) => {
                        <ListGroup.Item key={index} as="li" className="d-flex justify-content-between align-items-start">
                            <div className="ms-2 me-auto">
                            <div className="fw-bold">
                                <img width="55" src={`https://www.dododex.com/media/creature/${item.dino.toLowerCase()}.png`} />
                                {item.dino}
                            </div>
                            {`Date: ${item.updatedAt.substring(0,10)} (${item.status})`}
                            </div>
                            <Badge bg="primary" pill>
                            1
                            </Badge>
                        </ListGroup.Item>    
                    })}
                </ListGroup>
            </Form.Group>
            <Form.Group className="mt-3">
                <Form.Label>Select Desired Dinos</Form.Label>
                <Typeahead
                    id="Dino-Selector"
                    labelKey="dinoSearch"
                    multiple
                    onChange={setMultiSelections}
                    highlightOnlyResult={false}
                    options={dinoNames}
                    placeholder="Select multiple"
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