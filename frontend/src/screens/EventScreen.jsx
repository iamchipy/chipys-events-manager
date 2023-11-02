import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useRequestMutation, useFetchPendingMutation, useUpdateRequestMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import { Link } from "react-router-dom";
import TimezonePicker from 'react-bootstrap-timezone-picker';

const EventScreen = () => {

    // Define constants for later
    const [listItems, setListItems] = useState([]);
    const [fetchPending] = useFetchPendingMutation() 
    const { userInfo } = useSelector((state) => state.auth)
    const [multiSelections, setMultiSelections] = useState([]);
    const [selectedRequest, setselectedRequest] = useState([]);
    const [timezone, setTimezone] = useState('Europe/Moscow');
    const [requestDino, { isLoading }] = useRequestMutation()
    const [updateRequest, { isUpdating }] = useUpdateRequestMutation()
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);    

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

    // Click options 
    const optionsHandler = async (event, clickedRequest) => {
        event.preventDefault()

        // toast.info(`${clickedItem.dino} was clicked`)
        setselectedRequest(clickedRequest)
        handleShow()
    }
    
    // delete handler
    const handleDelete = async () => {
        // Handle the delete operation here
        toast.success(`${selectedRequest.dino} request deleted`);
        handleClose();
        const updatedValue = {
            status: "DeletedByUser"
        }
        await updateRequest({ selectedRequest, updatedValue })
        const result = await fetchPending({ userInfo })
        setListItems(result.data);      
    };

    const submitHandler = async (e) => {

    }

    return (
    <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
            <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
            {`${selectedRequest.dino} requested on ${selectedRequest.updatedAt}, delete?`}
            </Modal.Body>
            <Modal.Footer>
            <Button variant="secondary" onClick={handleClose}>
                Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
                Delete
            </Button>
            </Modal.Footer>
        </Modal>

        <FormContainer>
            <h1>Upcoming</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className='my-2' controlId="previously-requested">
                    <Form.Label>Scheduled Events</Form.Label>
                    <ListGroup>
                        {Array.isArray(listItems) && listItems.map((item, index) => (
                            <ListGroup.Item key={index} action onClick={(event) => optionsHandler(event,item)} >
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
            </Form>
        </FormContainer>        
        <FormContainer>
            <h1>Create Event</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mt-3">
                    <Form.Label>Select Dino</Form.Label>
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
                <Form.Group className='my-2' controlId="dino">
                    <Form.Label>Select Day</Form.Label>
                    <Form.Control
                        type="date"
                        placeholder="Select a date"
                    />
                    <Form.Label>Select Time</Form.Label>
                    <Form.Control
                        type="time"
                        placeholder="Select a time"
                    />     
                    <Form.Label>Select Timezone</Form.Label>  
                    <TimezonePicker
                        absolute={false}
                        defaultValue="Europe/Moscow"
                        placeholder="Select timezone..."
                        onChange={(tz) => setTimezone(tz)}
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