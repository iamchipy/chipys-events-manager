import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { useRequestMutation, useFetchPendingMutation, useUpdateRequestMutation } from "../slices/userApiSlice";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";


const EventScreen = () => {

    // Define constants for later
    const [dinoSelection, setDinoSelection] = useState([]);
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);    
    const { userInfo } = useSelector((state) => state.auth)
    const timezoneList = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]
    const [formData, setFormData] = useState({
        timezone:userInfo.timezone,
        note:"Event notes...",
        startTime:userInfo.timeOpen,
        date:"today",
        host:userInfo.global_name
    })


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

        console.warn(dateTime)

        // submit formData for upser update
        // try{
        //     await UpdateProfile({
        //         id: userInfo.id,
        //         guild: guildSelection[0].id,
        //         timeOpen: moment(formData.timeOpen, 'HH:mm').valueOf(),
        //         timeClose: moment(formData.timeClose, 'HH:mm').valueOf(),
        //         ...formData,})
        //         .then(res => {
        //             toast.info(`${res.data.global_name}'s profile has been updated`)

        //             dispatch(setCredentials(res.data))
        //             // SOMETHING is funky here causing AUTH Redux maybe to fail being over written
        //             console.warn("Response value")
        //             console.log(res.data)
        //         })
        // }catch (err){
        //     toast.error((err?.data?.message || err.error))
        // }
    }

    return (
    <>
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
                        placeholder="Select multiple"
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
                        name="startTime"
                        type="time"
                        onChange={handleChangeEvents}
                        defaultValue={formData.startTime}
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
                
                <Button type='submit' variant="primary" className="mt-3">
                    Create 
                </Button>     
            </Form>
        </FormContainer>
    </>
  )
}

export default EventScreen