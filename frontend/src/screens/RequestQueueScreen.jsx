import { useState } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useFetchPendingByFilterMutation, 
         useUpdateRequestMutation,} from "../slices/userApiSlice";
import Loader from "../components/Loader";
import dinoNames from "../assets/dinoNames";
import { Typeahead, AsyncTypeahead } from "react-bootstrap-typeahead"
import GuildDisplayName from "../components/DiscordGuildName";
import {INCOMPLETE_STATES} from "../components/FilterPresets"

function RequestQueueScreen() {
    
    // Define constants for later
    const [listItems, setListItems] = useState([]);
    const [fetchPendingByFilter, {isLoading}] = useFetchPendingByFilterMutation() 
    const [updateRequest, {isWaiting}] = useUpdateRequestMutation() 
    const { userInfo } = useSelector((state) => state.auth)
    const [filterDinoSelections, setFilterDinoSelections] = useState([]);
    const [filterUserSelection, setFilterUserSelection] = useState([]);
    const [userSearching, setUserSearching] = useState(false);
    const [userList, setUserList] = useState([]);
    const [selectedRequest, setSelectedRequest] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);    
    const guildDisplayName = GuildDisplayName(userInfo)
    
 
  // response to new request button
    const refreshFiltered = async (e) => {
        // e.preventDefault()

        // Set the filter baseline
        let filter = {
            status: INCOMPLETE_STATES,
            "guild.id":  userInfo.guild,
            global_name: userInfo.global_name
        }

        // if the user is a breeder we remove the user limit
        if (userInfo.role === "breeder") {
            delete filter.global_name
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (filterDinoSelections.length > 0){
            filter = {
                ...filter,
                dino:filterDinoSelections,
            }            
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (filterUserSelection.length > 0){
            filter = {
                ...filter,
                id:filterUserSelection[0].id,
            }            
        }        

        console.info("Filter:")
        console.info(filter)
        fetchPendingByFilter({ filter }).then(res => {
            if ("error" in res && res.error.status === 404){
                toast.warn(`Waiting list appears to be empty`)
                setListItems([]); 
            }else{
                setListItems(res.data); 
            }
        }).catch(err=>{
            console.error(err)
        })
            
    }

    // Bypass client-side filtering by returning `true`. Results are already
    // filtered by the search endpoint, so no need to do it again.
    const filterBypass = () => true;

    const handleUserSearch = (query) => {
        setUserSearching(true)
        console.info(`userSearch('${query}')`)
        
        fetch(`api/users/profiles/${query}`)
            .then(response => response.json())
            .then(result => {
                // console.warn("result")
                // console.info(result.data)
                if (result.error !== null || result.data.length < 1){
                    // do nothing and keep console clear for clutter sake
                    // console.error("result.error")
                    // console.error(result.error)
                    setUserList([])
                }else{
                    setUserSearching(false)    
                    setUserList(result.data)
                }
            }).catch(e=>console.error(e))
    }

    // Click options 
    const optionsHandler = async (event, clickedRequest) => {
        event.preventDefault()

        // toast.info(`${clickedItem.dino} was clicked`)
        setSelectedRequest(clickedRequest)
        handleShow()
    }
    
    // delete handler
    const handleDelete = async () => {
        handleClose();
        // Handle the delete operation here
        
        if (selectedRequest.id !== userInfo.id && userInfo.role !== "Breeder"){
            toast.warn("Sorry only breeders can delete other's requests")
            return
        }

        const updatedValue = {
            status: "Completed"
        }
        await updateRequest({ selectedRequest, updatedValue }).then(result=>{
            if (result.error === null){
                toast.success(`${selectedRequest.global_name} has received ${selectedRequest.dino}`);
            }
        })
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
                <Button variant="success" onClick={handleDelete}>
                    Completed
                </Button>
            </Modal.Footer>
        </Modal>
    
        <FormContainer>  
            <h1>Waiting List</h1>
            <h5>{guildDisplayName} ({userInfo.role})</h5>
            <Form.Group className="mt-3">
                <Typeahead
                    id="Dino-Selector"
                    labelKey="dinoSearch"
                    multiple
                    onChange={setFilterDinoSelections}
                    highlightOnlyResult={false}
                    options={dinoNames}
                    placeholder="Filter By Dino"
                    selected={filterDinoSelections}
                />
                {userInfo.role === "breeder" &&
                    <AsyncTypeahead
                        filterBy={filterBypass}
                        id="User-Selector"
                        isLoading={userSearching}
                        labelKey="global_name"
                        minLength={3}
                        onSearch={handleUserSearch}
                        onChange={setFilterUserSelection}
                        options={userList}
                        placeholder="Filter By User"
                        renderMenuItemChildren={(userItem) => (
                            <>
                            <img
                                alt={userItem.global_name}
                                src={`https://cdn.discordapp.com/avatars/${userItem.id}/${userItem.avatar}`}
                                style={{
                                height: '24px',
                                marginRight: '10px',
                                width: '24px',
                                }}
                            />
                            <span>{userItem.global_name}</span>
                            </>
                        )}                    
                    /> 
                }               
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
