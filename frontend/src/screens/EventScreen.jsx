import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useEventUpdateMutation,
         useEventCreateMutation, 
         useEventsByFilterMutation } from "../slices/userApiSlice";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";
import Loader from "../components/Loader";
import GuildDisplayName from "../components/DiscordGuildName";

const EventScreen = () => {

    // Define constants for later
    const guildDisplayName = GuildDisplayName(userInfo)
    const [eventUpdate, {isUpdating}] = useEventUpdateMutation()
    const [eventCreate, {isCreating}] = useEventCreateMutation()
    const [eventsByFilter, {isLoading}] = useEventsByFilterMutation()
    const [listItems, setListItems] = useState([]);    
    const [selectedEvent, setSelectedEvent] = useState([]);    
    const [dinoSelection, setDinoSelection] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);    
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
        host:userInfo.global_name
    })

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
        eventsByFilter({ filter }).then(res => {
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
        setSelectedEvent(clickedRequest)
        handleShow()
    }
    
    // delete handler
    const handleDelete = async () => {
        // Handle the delete operation here
        toast.success(`${selectedEvent.global_name} has received ${selectedEvent.dino}`);
        handleClose();
        const updatedValue = {
            status: "Completed"
        }
        await updateRequest({ selectedRequest: selectedEvent, updatedValue })
        refreshFiltered()    
    };


    useEffect(() => {
        console.log("THIS SHOULD TRIGGER ONCE")
    }, [])

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

        console.warn("FORM DATA")
        console.log(formData)

        let dateTime = moment(formData.date+" "+formData.startTime, 'YYYY-MM-DD HH:mm').valueOf()
        const data = {
            id: userInfo.id,
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
                <Button variant="success" disabled={true} onClick={handleDelete}>
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
        <FormContainer>
            <h1>Create Event</h1>
            <Form onSubmit={submitHandler}>
                <Form.Group className="mt-3">
                    <Form.Label>Select Dino</Form.Label>
                    <Typeahead
                        id="Dino-Selector"
                        labelKey="dinoSearch"
                        onChange={setDinoSelection}
                        highlightOnlyResult={false}
                        options={dinoNames}
                        placeholder="Select Dino"
                        selected={dinoSelection}
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