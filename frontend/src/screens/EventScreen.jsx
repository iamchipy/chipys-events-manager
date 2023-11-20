import { useState, useEffect } from "react";
import { Form, Button, ListGroup, Badge, Modal } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useSelector } from 'react-redux'
import { toast } from "react-toastify";
import {
    useEventUpdateMutation,
    useEventCreateMutation,
    useEventsByFilterMutation,
    useFetchPendingByFilterMutation,
    useUpdateUserMutation,
} from "../slices/userApiSlice";
import dinoNames from "../assets/dinoNames";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";
import Loader from "../components/Loader";
import GuildDisplayName from "../components/DiscordGuildName";
import { INCOMPLETE_STATES } from "../components/FilterPresets"

const EventScreen = () => {

    // Define constants for later

    const [eventUpdate, { isUpdating }] = useEventUpdateMutation()
    const [fetchPendingByFilter] = useFetchPendingByFilterMutation()
    const [eventCreate, { isCreating }] = useEventCreateMutation()
    const [eventsByFilter, { isLoading }] = useEventsByFilterMutation()
    const [updateUserProfile] = useUpdateUserMutation()
    const [isBuildingRecommendation, setIsBuildingRecommendation] = useState(false);
    const [recommendationList, setRecommendationList] = useState((<>None</>));
    const [listItems, setListItems] = useState([]);
    const [selectedEvent, setSelectedEvent] = useState([]);
    const [dinoSelection, setDinoSelection] = useState([]);
    const [multiSelections, setMultiSelections] = useState([]);
    const [totalPendingCount, setTotalPendingCount] = useState([0]);
    const [selectedEventNote, setSelectedEventNote] = useState();
    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const { userInfo } = useSelector((state) => state.auth)
    const timezoneList = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const [formData, setFormData] = useState({
        timezone: userInfo.timezone,
        note: "Event notes...",
        startTime: moment(userInfo.timeOpen).format("HH:mm"),
        date: "today",
        host: userInfo.global_name,
        capacity: 1,
    })
    const guildDisplayName = GuildDisplayName(userInfo)

    // trigger update on filter change
    useEffect(() => {
        refreshFiltered()
    }, [multiSelections]);

    // Here we update the badge with a count of pending dinos of selected type
    useEffect(() => {
        fetchPendingDinosBySelction()
    }, [dinoSelection])

    const fetchPendingDinosBySelction = () => {
        // console.log("THIS RUNS WHEN DINO CHANGES")
        // Set the filter
        let filterForPendingCheck = {
            status: INCOMPLETE_STATES,
            "guild.id": userInfo.guild,
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (dinoSelection.length > 0) {
            filterForPendingCheck = {
                ...filterForPendingCheck,
                dino: dinoSelection[0],
            }
        }

        // console.info("filterForPendingCheck:")
        // console.info(filterForPendingCheck)
        fetchPendingByFilter({ filter: filterForPendingCheck })
            .then(res => {
                if ("error" in res && res.error.status === 404) {
                    toast.info(`No pending '${dinoSelection[0]}' requests in ${userInfo.guilds[userInfo.guild].name}`)
                    setTotalPendingCount("0")
                } else {
                    // console.warn("res.data"); 
                    // console.log(res.data); 
                    setTotalPendingCount(res.data.length)
                }
            }).catch(err => {
                console.error(err)
            })
    }

    // refresh the list of events
    const refreshFiltered = async () => {
        // e.preventDefault()

        // Set the filter baseline
        let filterForPendingEvents = {
            status: INCOMPLETE_STATES,
            "guild.id": userInfo.guild,
        }

        // if the user is selecting mutliple dinos we add in the dino filter
        if (multiSelections.length > 0) {
            filterForPendingEvents = {
                ...filterForPendingEvents,
                dino: multiSelections,
            }
        }

        // console.info("filterForPendingEvents:")
        // console.info(filterForPendingEvents)
        eventsByFilter({ filter: filterForPendingEvents })
            .then(res => {
                if ("error" in res && res.error.status === 404) {
                    toast.warn(`No sheduled events`)
                    setListItems([]);
                } else {
                    setListItems(res.data);
                }
            }).catch(err => {
                console.error(err)
            })

    }

    // This function returns the change in timezone hours required to sync up
    const syncTimezones = (currentZone, targetZone) => {
        if (currentZone == undefined || targetZone == undefined) {
            console.warn(`syncTimezones received UNDEFINED (${currentZone} | ${targetZone})`)
            return null
        }
        try {
            // handle case where they have the same sign
            if (currentZone <= 0 && targetZone <= 0) {
                return Math.abs(currentZone) - Math.abs(targetZone)
            }
            if (currentZone >= 0 && targetZone >= 0) {
                return Math.abs(targetZone) - Math.abs(currentZone)
            }
            // then cases where they're opposite 
            return targetZone - currentZone
        } catch (error) {
            console.warn(`syncTimezones(${currentZone},${targetZone}) UNHANDLED CASE`)
            console.error(error)
            return null
        }
    }

    // // returns the time difference in HH:MM format
    // const timeDifference = (currentTime, targetTime) => {
    //     // split strings into hour/minute arrays
    //     currentTime = currentTime.split(":")
    //     targetTime = targetTime.split(":")
    //     // create Date objects from those string/arrays
    //     const startDate = new Date(0, 0, 0, currentTime[0], currentTime[1], 0)
    //     const endDate = new Date(0, 0, 0, targetTime[0], targetTime[1], 0)
    //     // run the Date math on them
    //     let timeSplit = endDate.getTime() - startDate.getTime()
    //     // calc the hours (in ms) from the difference value
    //     const hours = Math.floor(timeSplit / 1000 / 60 / 60)
    //     // extract those hours from the difference to leave only minutes
    //     timeSplit -= hours * 1000 * 60 * 60
    //     // floor out the ms into minutes
    //     const minutes = Math.floor(timeSplit / 1000 / 60)
    //     // return the HH:MM formatted time
    //     return (hours <= 9 ? "0" : "") + hours + ":" + (minutes <= 9 ? "0" : "") + minutes
    // }

    // returns true if target time is within timzone+window
    const isUserAvailable = (eventObject, userRequestMergeObject) => {
        // handle 
        if (eventObject == undefined || userRequestMergeObject == undefined) {
            console.warn(`isUserAvailable received UNDEFINED (${eventObject} | ${userRequestMergeObject})`)
            return null
        }

        const isTimeInWindow = (targetTime, openTime, closeTime) => {

            // Create Date objects
            const targetDate = new Date(targetTime)
            const windowOpen = new Date(openTime)
            const windowClose = new Date(closeTime)

            // Set adjusted objects to use targetDates day for math to work
            const windowOpenAdjusted = new Date(targetTime)
            const windowCloseAdjusted = new Date(targetTime)

            // Overwrite times to create a comparable time window on the same day
            windowOpenAdjusted.setHours(windowOpen.getHours(),windowOpen.getMinutes())
            windowCloseAdjusted.setHours(windowClose.getHours())
            windowCloseAdjusted.setMinutes(windowClose.getMinutes())

            // test to confirm that the time is within the window or not
            if (windowOpenAdjusted.valueOf() < targetDate.valueOf() &&
                targetDate.valueOf() < windowCloseAdjusted.valueOf()) {
                return true
            }
            return false
        }

        // console.warn("isUserAvailable = (eventObject, userRequestMergeObject)")
        // console.log(eventObject)
        // console.log(userRequestMergeObject)
        try {
            const inWindow = isTimeInWindow(eventObject.startTime,
                                            userRequestMergeObject.timeOpen,
                                            userRequestMergeObject.timeClose)
            console.log(`Event is during ${userRequestMergeObject.global_name}'s window? ${inWindow}`)
            return inWindow

        } catch (e) {
            console.error(e)
            return false
        }
    }


    // Gather list of all matching requests and return slice with names
    const fetchRecommendedRecipients = async (clickedEvent) => {
        let cachedRequests = []
        let recommendedRequests  =[]
        setIsBuildingRecommendation(true)

        // Set the filter
        let filterForRecommended = {
            status: INCOMPLETE_STATES,
            "guild.id": userInfo.guild,
            dino: clickedEvent.dino,
        }

        // get the list of all matching requests 
        const allMatchingRequests = await fetchPendingByFilter({ filter: filterForRecommended })

        console.log(allMatchingRequests)
        // catch no case of no requests for event
        if ("error" in allMatchingRequests || allMatchingRequests == null)
        {
            toast.info("No pending requests for selected Event")
            setIsBuildingRecommendation(false)
            return
        }

        // build the promises to get user info for each of the pending requests
        const allMatchingRequestsPromises = allMatchingRequests.data.map(request => updateUserProfile({ id: request.id }))

        // launch the promise to fetch user data
        Promise.all(allMatchingRequestsPromises)
        .then(results => {
            // loop for each returned prompise
            results.forEach((result, index) => {
                const thisRequest = result.data
                console.warn(index)
                cachedRequests.push({ ...thisRequest, ...allMatchingRequests.data[index] })
                if (isUserAvailable(clickedEvent, cachedRequests[index])==true){
                    console.log(`${cachedRequests[index].global_name} has been added to the list`)
                    recommendedRequests.push(cachedRequests[index])
                }
            })

            // take cached results and sort by matching time and age
            setIsBuildingRecommendation(false)
            console.warn("RETURNING:")
            console.info(cachedRequests)
            const recommendationListHTML = (
                <>
                    <ListGroup>
                        <Form.Label>Recommended requests for this event:</Form.Label>
                        {Array.isArray(recommendedRequests) && recommendedRequests.map((item, index) => (
                            <ListGroup.Item key={index} disabled={true} onClick={(event) => optionsHandler(event, item)} >
                                <div className="ms-2 me-auto">
                                    <img src={`https://cdn.discordapp.com/avatars/${item.id}/${item.avatar}`} 
                                         style={{width:34, height:34}} 
                                         alt="avatar" />                                    
                                    <div className="fw-bold d-inline">
                                        {`${item.global_name} `}
                                    </div>
                                    <br /> 
                                    {`Date: ${item.updatedAt.substring(0, 10)} (${item.status})`}                                    
                                    <br /> 
                                    {`Note: ${item.note}`}
                                </div>

                            </ListGroup.Item>
                        ))}
                    </ListGroup>
                </>
            )      
            setRecommendationList(recommendationListHTML)       
        })
        .catch(error => {
            // LOG ERRORS 
            console.warn("Promise stack error")
            console.error(error)
            return (<>ERR</>)
        })
    }

    // custom handler that pumps out setStates as needed by overwriting
    // existing form date with whatever the new input was
    const handleChangeEvents = (inputValue, event) => {
        // check if we were provided both or just an event object
        if (inputValue instanceof (Object)) {
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

    // show the selected item info/options 
    const optionsHandler = async (event, clickedEvent) => {
        event.preventDefault()

        // console.log(clickedEvent)
        // toast.info(`${clickedItem.dino} was clicked`)
        setSelectedEvent(clickedEvent)
        setSelectedEventNote(clickedEvent.note)
        fetchRecommendedRecipients(clickedEvent)
        handleShow()
    }

    // delete handler
    const handleDelete = async () => {
        // Handle the delete operation here


        if (userInfo.role !== "breeder") {
            toast.warn("Sorry only breeders can delete Events")
            return
        }

        const updatedValue = {
            status: "DeletedByBreeder"
        }
        console.warn("selectedEvent._id")
        console.info(selectedEvent._id)

        await eventUpdate({ _id: selectedEvent._id, updatedValue })
            .then(result => {
                if ("error" in result) {
                    toast.error("Something went wrong!")
                } else {
                    console.log("eventUpdate=>res.data")
                    console.log(result.data)
                    toast.success(`${selectedEvent._id} has been deleted.`);
                }
                refreshFiltered()
            }).catch(err => { toast.error(err) })

        handleClose();
    };

    const submitHandler = async (e) => {
        e.preventDefault()

        // Debug
        console.warn("FORM DATA")
        console.log(formData)

        // if the user is a breeder we remove the user limit
        if (userInfo.role !== "breeder") {
            toast.error("Only breeders can make events!")
            return
        }

        const dateTime = new Date(formData.date.substring(0, 4),
            parseInt(formData.date.substring(5, 7)) - 1,
            formData.date.substring(8, 10),
            formData.startTime.substring(0, 2),
            formData.startTime.substring(3, 5))

        // console.warn(dateTime)
        // console.log(dateTime.valueOf())
        // console.log(new Date(dateTime.valueOf()))

        // Wed Dec 06 2023 06:06:00 GMT-0500 (Eastern Standard Time)
        // 1701860760000
        // Wed Dec 06 2023 06:06:00 GMT-0500 (Eastern Standard Time)

        const data = {
            ...formData,
            id: userInfo.id,
            global_name: userInfo.global_name,
            guild: userInfo.guilds[userInfo.guild],
            startTime: dateTime.valueOf(),
            timezoneOffset: dateTime.getTimezoneOffset(), //WE ARE USING UTC and offset
            dino: dinoSelection[0],

        }
        console.warn("SENT DATA")
        console.log(data)
        // console.log(dateTime)

        // Create the event with API
        await eventCreate(data).then(res => {
            toast.success(`${res.data.dino} event created`)
            console.warn("eventCreate - result")
            console.log(res.data)
            refreshFiltered()
        })
    }

    const handleSave = async () => {
        const updatedValue = {
            note: selectedEventNote.target.value,
        }

        console.warn(selectedEvent)
        console.warn(updatedValue)

        eventUpdate({ event: selectedEvent, updatedValue }).then(result => {
            if ("error" in result) {
                toast.error("Something went wrong")
            } else {
                toast.success("Event note saved!")
                handleClose();
                refreshFiltered()
            }
        })
    };

    return (
        <>
            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Modify Event</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {`Dino: ${selectedEvent.dino}`}
                    <br />
                    {`User: ${selectedEvent.global_name}`}
                    <br />
                    {`Note:`}
                    <Form.Control type="text" onChange={setSelectedEventNote} defaultValue={selectedEventNote} />
                    <br />
                    {isBuildingRecommendation && <Loader />}
                    {recommendationList}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleSave}>
                        Save
                    </Button>
                    <Button variant="danger" onClick={handleDelete}>
                        Delete
                    </Button>

                </Modal.Footer>
            </Modal>

            <FormContainer>
                <Form >
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

                    {isLoading && <Loader />}

                    <Form.Group className='my-2' controlId="previously-requested">
                        <ListGroup>
                            <Form.Label>Scheduled Events</Form.Label>
                            {Array.isArray(listItems) && listItems.map((item, index) => (
                                <ListGroup.Item key={index} action onClick={(event) => optionsHandler(event, item)} >
                                    <div className="ms-2 me-auto">
                                        <div className="fw-bold">
                                            <img width="55" src={`https://www.dododex.com/media/creature/${item.dino.toLowerCase()}.png`} />
                                            {item.dino}
                                            <Badge bg="secondary" pill>
                                                {item.capacity}
                                            </Badge>
                                        </div>
                                        {`Date: ${item.updatedAt.substring(0, 10)} (${item.status})`}
                                        <br />
                                        {`User: ${item.global_name} `}
                                        {(userInfo.role === "breeder") ? <br /> : ""}
                                        {(userInfo.role === "breeder") ? `Note: ${item.note}` : ""}
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
                            Select Dino (pending requests
                            <Badge bg="primary" pill>{totalPendingCount}</Badge>
                            )

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
                            name="startTime"
                            type="time"
                            onChange={handleChangeEvents}
                            defaultValue={formData.startTime}
                        />

                        {/* <Form.Label>Select Timezone</Form.Label>
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
                        </Form.Select> */}
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