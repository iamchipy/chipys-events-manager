import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useEventUpdateMutation,
         useEventCreateMutation, 
         useEventsByFilterMutation,
         useFetchPendingByFilterMutation } from "../slices/userApiSlice";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";
import Loader from "../components/Loader";
import GuildDisplayName from "../components/DiscordGuildName";
import {INCOMPLETE_STATES} from "../components/FilterPresets"

const EventScreen = () => {

    // Define constants for later
    
    const [eventUpdate, {isUpdating}] = useEventUpdateMutation()
    const [fetchPendingByFilter] = useFetchPendingByFilterMutation()     
    const [eventCreate, {isCreating}] = useEventCreateMutation()
    const [eventsByFilter, {isLoading}] = useEventsByFilterMutation()
    const [listItems, setListItems] = useState([]);    
    const [selectedEvent, setSelectedEvent] = useState([]);    
    const [dinoSelection, setDinoSelection] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);    
    const [totalPendingCount, setTotalPendingCount] = useState([0]);  
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);    
    const { userInfo } = useSelector((state) => state.auth)
    const timezoneList = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]
    const [formData, setFormData] = useState({
        timezone:userInfo.timezone,
        note:"Event notes...",
        time:userInfo.timeOpen,
        date:"today",
        host:userInfo.global_name,
        capacity:1,
    })
    const guildDisplayName = GuildDisplayName(userInfo)
    

  // response to new request button
    const refreshFiltered = async (e) => {
        // e.preventDefault()

        // Set the filter baseline
        let filterForPendingEvents = {
            status: INCOMPLETE_STATES,
            "guild.id":  userInfo.guild,
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (multiSelections.length > 0){
            filterForPendingEvents = {
                ...filterForPendingEvents,
                dino:multiSelections,
            }            
        }

        console.info("filterForPendingEvents:")
        console.info(filterForPendingEvents)
        eventsByFilter({ filter: filterForPendingEvents}).then(res => {
            if ("error" in res && res.error.status === 404){
                toast.warn(`No sheduled events`)
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
        setSelectedEvent(clickedRequest)
        handleShow()
    }
    
    // delete handler
    const handleDelete = async () => {
        // Handle the delete operation here

        if (userInfo.role !== "breeder"){
            toast.warn("Sorry only breeders can delete Events")
            return
        }
        
        handleClose();
        const updatedValue = {
            status: "DeletedByBreeder"
        }
        console.warn("selectedEvent._id")
        console.info(selectedEvent._id)

        await eventUpdate({ _id: selectedEvent._id, updatedValue }).then(res=>{
            console.log(res.data)
            toast.success(`${selectedEvent._id} has been deleted.`);
            refreshFiltered() 
        }).catch(err=>{toast.error(err)})
        
           
    };


    useEffect(() => {
        console.log("THIS SHOULD TRIGGER ONCE")
    }, [])

    // Here we update the badge with a count of pending dinos of selected type
    useEffect(() => {
        console.log("THIS RUNS WHEN DINO CHANGES")
        // Set the filter
        let filterForPendingCheck = {
            status: INCOMPLETE_STATES,
            "guild.id":  userInfo.guild,
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (dinoSelection.length > 0){
            filterForPendingCheck = {
                ...filterForPendingCheck,
                dino:dinoSelection[0],
            }            
        }

        console.info("filterForPendingCheck:")
        console.info(filterForPendingCheck)
        fetchPendingByFilter({filter:filterForPendingCheck} ).then(res => {
            if ("error" in res && res.error.status === 404){
                toast.warn(`No dinos of that type have been requested`)
                setTotalPendingCount("0")
            }else{
                // console.warn("res.data"); 
                // console.log(res.data); 
                setTotalPendingCount(res.data.length)
            }
        }).catch(err=>{
            console.error(err)
        })
        
    }, [dinoSelection])    
    

    // custom handler that pumps out setStates as needed by overwriting
    // existing form date with whatever the new input was
    const handleChangeEvents = (inputValue, event) => {
        // check if we were provided both or just an event object
        if (inputValue instanceof(Object)) {
            event = inputValue
        }
        console.log(`Event name: ${event}`)
        console.log(`Event name: ${event.target}`)
        console.log(`Event name: ${event.target.name}`)
        console.log(`Event value: ${event.target.value} (${typeof event.target.value})`)
        setFormData({
            ...formData,
            [event.target.name]: event.target.value
        })
    }

    const submitHandler = async (e) => {
        e.preventDefault()

        // Debug
        console.warn("FORM DATA")
        console.log(formData)        

        // if the user is a breeder we remove the user limit
        if (userInfo.role !== "breeder"){
            toast.error("Only breeders can make events!")
            return
        }


        let dateTime = moment(formData.date+" "+formData.startTime, 'YYYY-MM-DD HH:mm').valueOf()
        const data = {
            id: userInfo.id,
            global_name: userInfo.global_name,
            guild: userInfo.guilds[userInfo.guild],
            startTime: dateTime,
            dino: dinoSelection[0],
            ...formData
            }
        console.warn("SENT DATA")
        console.log(data)        

        // Create the event with API
        await eventCreate(data).then(res=>{
                toast.success(`${res.data.dino} event created`)
                console.warn(res)
            })
    }

    return (
    <>
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>Confirm Deletion</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {`${selectedEvent.dino} requested by ${selectedEvent.global_name}, done?`}
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
            <h1>Events</h1>
            <h5>{guildDisplayName}</h5>
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
                                    <Badge bg="secondary" pill>
                                        {item.capacity}
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
        <FormContainer>
            <h1>Create Event</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mt-3">
                    <Form.Label>
                        Select Dino 
                        <Badge bg="primary" pill>
                            {totalPendingCount}
                        </Badge>     
                    </Form.Label>                 
                    <Typeahead
                        id="Dino-Selector"
                        labelKey="dinoSearch"
                        onChange={setDinoSelection}
                        highlightOnlyResult={false}
                        options={dinoNames}
                        placeholder="Select Dino"
                        selected={dinoSelection}
                        clearButton
                    />
                    <Form.Label>Select Day</Form.Label>
                    <Form.Control
                        name="date"
                        type="date"
                        onChange={handleChangeEvents}
                        placeholder="Select a date"
                    />
                    <Form.Label>Select Time</Form.Label>
                    <Form.Control 
                        name="time"
                        type="time"
                        onChange={handleChangeEvents}
                        defaultValue={formData.time}
                    />    

                    <Form.Label>Select Timezone</Form.Label>  
                    <Form.Select 
                        onChange={handleChangeEvents}
                        defaultValue={formData.timezone}
                        name="timezone"
                        >
                        {Array.isArray(timezoneList) && timezoneList.map((item, index) => (
                            <option key={index} value={item} >
                                {item} UTC
                            </option>
                        ))}                    
                    </Form.Select>
                    <Form.Label>Host: </Form.Label>
                    <Form.Control 
                        type="text"
                        name="host"
                        onChange={handleChangeEvents}
                        defaultValue={formData.host}
                    />                      
                    <Form.Label>Claim Capacity</Form.Label>
                    <Form.Control 
                        type="number"
                        name="capacity"
                        onChange={handleChangeEvents}
                        defaultValue={formData.capacity}
                    />    
                    <Form.Label>Note \ Comment</Form.Label>
                    <Form.Control 
                        type="text"
                        name="note"
                        onChange={handleChangeEvents}
                        defaultValue={formData.note}
                    />                                                               
                </Form.Group>                            
                {isCreating && <Loader />}  
                {isUpdating && <Loader />}  
                <Button type='submit' variant="primary" className="mt-3">
                    Create 
                </Button>     
            </Form>
        </FormContainer>
    </>
  )
}

export default EventScreen