import { useState } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useFetchPendingByFilterMutation, useUpdateRequestMutation } from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"

function RequestQueueScreen() {
    // Define constants for later
    const [listItems, setListItems] = useState([]);
    const [fetchPendingByFilter, {isLoading}] = useFetchPendingByFilterMutation() 
    const [updateRequest, {isWaiting}] = useUpdateRequestMutation() 
    const { userInfo } = useSelector((state) => state.auth)
    const [multiSelections, setMultiSelections] = useState([]);
    const [selectedRequest, setselectedRequest] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);    
    
 
  // response to new request button
    const refreshFiltered = async (e) => {
        e.preventDefault()

        // Set the filter baseline
        let filter = {
            status: {$nin:["Completed","DeletedByUser"]},
            "guild.id":  userInfo.guild,
            global_name: userInfo.global_name
        }

        // if the user is a breeder we remove the user limit
        if (userInfo.role === "breeder") {
            delete filter.global_name
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (multiSelections.length > 0){
            filter = {
                ...filter,
                dino:multiSelections,
            }            
        }

        console.info("Filter:")
        console.info(filter)
        fetchPendingByFilter({ filter }).then(res => {
            if ("error" in res && res.error.status === 404){
                toast.error(`Waiting list appears to be empty`)
            }else{
                setListItems(res.data); 
            }
        }).catch(err=>{
            console.error(err)
        })
            
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
        toast.success(`${selectedRequest.global_name} has received ${selectedRequest.dino}`);
        handleClose();
        const updatedValue = {
            status: "Completed"
        }
        await updateRequest({ selectedRequest, updatedValue })
        refreshFiltered()    
    };


  return (
    <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {`${selectedRequest.dino} requested by ${selectedRequest.global_name}, done?`}
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>
                    Cancel
                </Button>
                <Button variant="success" disabled={true} onClick={handleDelete}>
                    Completed
                </Button>
            </Modal.Footer>
        </Modal>
    
        <FormContainer>  
            <h1>Waiting List</h1>
            <h5>{userInfo.guilds[userInfo.guild].name}</h5>
            <Form.Group className="mt-3">
                <Form.Label>Filter</Form.Label>
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
            
            <Form >

                {isLoading && <Loader />}                  
                {isWaiting && <Loader />}                  
                <Button onClick={refreshFiltered} variant="primary" className="mt-3">
                    Refresh Queue 
                </Button>                  
   
                <Form.Group className='my-2' controlId="previously-requested">
                    <ListGroup>
                        <Form.Label>Pending Requests</Form.Label>
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
                                <br/>
                                {`User: ${item.global_name} `}
                                {(userInfo.role === "breeder")?<br/> :"" }
                                {(userInfo.role === "breeder")?`Note: ${item.note}`:"" }
                                </div>
                            
                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </Form.Group> 

            </Form>
        </FormContainer>   
    </> 
  )
}

export default RequestQueueScreen
