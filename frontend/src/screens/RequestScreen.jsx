import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useRequestMutation, useFetchPendingMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import { Link } from "react-router-dom";


function RequestScreen() {
    // Define constants for later
    const [listItems, setListItems] = useState([]);
    const [fetchPending] = useFetchPendingMutation() 
    const { userInfo } = useSelector((state) => state.auth)
    const [multiSelections, setMultiSelections] = useState([]);
    const [requestDino, { isLoading }] = useRequestMutation()

    // update function to keep the page dynamic
    useEffect(() => {
        async function fetchData() {
            const result = await fetchPending({ userInfo })
            setListItems(result.data);
        }
        // update list
        try{
            fetchData()
        }catch (err){
            console.warn("Trouble fetching pending dino request history:")
            console.warn(err)
        }        
    }, [fetchPending,userInfo]);

  // response to new request button
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
        }  
        const result = await fetchPending({ userInfo })
        setListItems(result.data);             
    }
  return (
    <FormContainer>  
        <h1>Request Dinos</h1>
        <Form onSubmit={requestHandler}>
            <Form.Group className='my-2' controlId="previously-requested">
                <ListGroup>
                    <Form.Label>Pending Requests</Form.Label>
                    {Array.isArray(listItems) && listItems.map((item, index) => (
                        <ListGroup.Item key={index}>
                            <div className="ms-2 me-auto">
                            <div className="fw-bold">
                                <img width="55" src={`https://www.dododex.com/media/creature/${item.dino.toLowerCase()}.png`} />
                                {item.dino}
                                <Badge bg="primary" pill>
                                1
                                </Badge>                                
                            </div>
                            {`Date: ${item.updatedAt.substring(0,10)} (${item.status})`}
                            </div>
                        
                        </ListGroup.Item>
                    ))}
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
            <Link to="/home">
                <Button variant="secondary" style={{float: 'right'}} className="mt-3">
                    Home
                </Button>  
            </Link>   
        </Form>
    </FormContainer>    
  )
}

export default RequestScreen
