import { useEffect, useState } from "react";
import { Form, Button, Badge, Modal, ListGroup } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector } from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import {
    useUpdateUserMutation,
    useUpdateGuildMetaMutation
} from "../slices/userApiSlice";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";
import Loader from "../components/Loader";

const ProfileScreen = () => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    const dispatch = useDispatch()
    const [updateProfile, { isUpdating }] = useUpdateUserMutation()
    const [updateGuildMeta, { isFetching }] = useUpdateGuildMetaMutation()
    const { userInfo } = useSelector((state) => state.auth)
    const timezoneList = [-12, -11, -10, -9, -8, -7, -6, -5, -4, -3, -2, -1, 0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    const [guildSelection, setGuildSelection] = useState([])
    const [isBreeder, setIsBreeder] = useState()
    const [guildBreederRole, setGuildBreederRole] = useState([]);
    const [guildBreederRoleChange, setGuildBreederRoleChange] = useState([]);
    const [guildRoleIDs, setGuildRoleIDs] = useState([]);
    const [cachedPermissions, setCachedPermissions] = useState({});
    const [formData, setFormData] = useState({
        timezone:   userInfo.timezone,
        role:       userInfo.role,
        note:       userInfo.note,
        timeOpen:   userInfo.timeOpen,
        timeClose:  userInfo.timeClose,
    })
    const headers = { authorization: `Bearer ${userInfo.token}` }
    let guildsList = []
    for (let tempId in userInfo.guilds) {
        guildsList.push(userInfo.guilds[tempId])

    }

    // Triggers once on initial load to help form load data
    useEffect(() => {
        setGuildSelection([userInfo.guilds[userInfo.guild]])
        // console.log(`Setting guildSelection to ${userInfo.guilds[userInfo.guild].name}`)
    }, [])

    // triggers when user change their Discord Server
    useEffect(() => {
        // prevent invalid checks
        if (guildSelection[0] == undefined) {
            // console.log("guildSelection[0] still undefined")
            return
        }
        // fetch current selected guild's details
        updateGuildDetails()
        getUsersDiscordRoleIDs()
    }, [guildSelection])

    // Triggers when we update the server's details and user info
    useEffect(() => {
        // break if we don't have the needed info
        if (guildBreederRole[0] == undefined || userInfo.guildRoles == undefined) {
            // console.log("guildSelection[0] || userInfo.guildRoleIDs still undefined")
            return
        }
        // console.warn("Checking Admin...")
        // console.info(userInfo.guildRoles)
        // console.info(guildBreederRole)
        if (userInfo.guildRoles.includes(guildBreederRole[0]) ||
            userInfo.guildRoles.includes(guildBreederRole)) {
            setIsBreeder(true)
            console.log("Breeder detected")
        }
    }, [guildBreederRole])

    // check for and update isAdmin status
    const isGuildAdmin = () => {
        console.log("Checking Admin")
        if ("guildAdmins" in userInfo) {
            if (userInfo.guildAdmins.includes(guildSelection[0].id ||
                userInfo.guildAdmins == guildSelection[0].id)) 
                {
                console.log("ADMIN detected")
                return true
            }
        } 
        return false
    }

    // 
    const getUsersDiscordRoleIDs = async () => {

        console.log(`fetching server role ids from discord...`)
        // Check if we've done this fetch before
        // console.warn(cachedPermissions)
        if (guildSelection[0].id in cachedPermissions &&
            cachedPermissions[guildSelection[0].id] != undefined) {
            setGuildRoleIDs(cachedPermissions[guildSelection[0].id].roles)
            console.warn("using cache")
            console.log(cachedPermissions)
            return
        }
        // fetch user's roles in current guild
        // console.log(headers)
        fetch(`https://discord.com/api/users/@me/guilds/${guildSelection[0].id}/member`, { headers })
            .then(function (response) {
                //this step is only needed when a CORS object is returned from fetch
                return response.json()
            })
            .then(result => {
                if ("error" in result) {
                    console.warn("Error fetching guild member info")
                    console.log(result.error)
                    return
                }
                cachedPermissions[guildSelection[0].id] = result.roles
                // setCachedPermissions(previousCache =>({...previousCache, result}))
                console.log("caching...")
                // console.warn(cachedPermissions)
                // console.log("guild roles")
                // console.log(result)
                console.log(`setGuildRoleIDs ${result.roles}`)
                setGuildRoleIDs(result.roles)
            })
    }

    // Fetch info about other users for admins
    const updateGuildDetails = () => {
        // console.log(`Checking guildMeta data for admin grant RoleIDs`)
        updateGuildMeta({ filter: { id: guildSelection[0].id } })
            .then(result => {
                // console.warn( result.data )
                if ("breederRoleIDs" in result.data) {
                    console.log(`setGuildBreederRoles ${result.data.breederRoleIDs}`)
                    setGuildBreederRole(result.data.breederRoleIDs)
                    setGuildBreederRoleChange(result.data.breederRoleIDs)
                } else {
                    setGuildBreederRole([])
                }
            })
    }

    // build the Guild Permissions block after form loading has completed, via a subsequent tick 
    const buildGuildDetails = () => {
        if (guildSelection[0] === undefined) {
            // return blank html for unloaded data
            return
        }

        return (
            <ListGroup.Item action onClick={(event) => optionsHandler(event, guildSelection[0])} >
                <div className="ms-2 me-auto" >
                    <div className="fw-bold" >
                        <img width="55" src={`https://cdn.discordapp.com/icons/${guildSelection[0].id}/${guildSelection[0].icon}.webp`} />

                        {guildSelection[0].name}
                        <Badge bg="primary" pill>
                            1
                        </Badge>
                    </div>
                    {`Breeder Role: ${guildBreederRole}`}
                    <br />
                    {/* {`Ranks: ${guildSelection[0].name}`} */}
                </div>
            </ListGroup.Item>
        )
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

    const submitHandler = async (e) => {
        e.preventDefault()

        console.warn("FORM DATA")
        console.log(formData)
        console.log(guildSelection[0].name)

        // submit formData for upser update
        try {
            // verbose way to overwite user when admin has been revoked and breeder was selected
            const newValues = isBreeder ? {
                ...formData,
                id: userInfo.id,
                guild: guildSelection[0].id,
                guildRoles: guildRoleIDs,
                token: userInfo.token,
                // timeOpen: moment(formData.timeOpen, 'HH:mm').valueOf(),
                // timeClose: moment(formData.timeClose, 'HH:mm').valueOf(),
                timeOpen: formData.timeOpen,
                timeClose: formData.timeClose,                
            } : {
                ...formData,
                id: userInfo.id,
                guild: guildSelection[0].id,
                guildRoles: guildRoleIDs,
                token: userInfo.token,
                // timeOpen: moment(formData.timeOpen, 'HH:mm').valueOf(),
                // timeClose: moment(formData.timeClose, 'HH:mm').valueOf(),
                timeOpen: formData.timeOpen,
                timeClose: formData.timeClose,                 
                role: "user",
            }

            await updateProfile(newValues)
                .then(result => {
                    // console.warn(result)
                    if ("error" in result) {
                        console.error((result.error?.data?.message || result.error.error))
                    } else {
                        const profile = result.data
                        console.warn("Modified profile:")
                        console.log(profile)
                        toast.info(`${profile.global_name}'s profile has been updated`)

                        dispatch(setCredentials(profile))
                        // SOMETHING is funky here causing AUTH Redux maybe to fail being over written                        
                    }
                })
        } catch (err) {
            toast.error((err?.data?.message || err.error))
            console.error((err?.data?.message || err.error))
        }
    }

    // Click options 
    const optionsHandler = async (event) => {
        event.preventDefault()
        if (!isGuildAdmin()) {
            toast.warn("You do not have permissions to change that.")
            return
        }else{
            handleShow()
        }        
    }

    const handleSave = async () => {
        const filter = {
            id: guildSelection[0].id
        }
        const updatedValues = {
            breederRoleIDs: guildBreederRoleChange
        }
        console.warn(guildBreederRoleChange)
        const result = await updateGuildMeta({ filter: filter, updatedValues: updatedValues })
        toast(result.name)
        
        updateGuildDetails()
        handleClose()
    }

    return (
        <>
            <FormContainer>
                <h1>Update Profile</h1>
                <Form onSubmit={submitHandler}>
                    <Form.Group className='my-2' controlId="discordGlobalName">
                        <Form.Label>Discord Name (linked to Discord)</Form.Label>
                        <Form.Control
                            type="text"
                            disabled={true}
                            value={userInfo.global_name}
                        ></Form.Control>
                    </Form.Group>
                    <Form.Group className="mt-4">
                        <Form.Label>Select Discord Server</Form.Label>
                        <Typeahead
                            id="guild-selector"
                            labelKey="name"
                            onChange={setGuildSelection}
                            highlightOnlyResult={false}
                            options={guildsList}
                            placeholder="Select Discord Server"
                            // defaultSelected={[guildSelection]}
                            selected={guildSelection}
                            clearButton
                        />
                    </Form.Group>
                    <Form.Group className='my-2' >
                        <Form.Label>Available Hours</Form.Label>
                        <Form.Control
                            name="timeOpen"
                            type="time"
                            onChange={handleChangeEvents}
                            defaultValue={formData.timeOpen}
                        />
                    </Form.Group>
                    <Form.Label>to</Form.Label>
                    <Form.Group className='my-0' >
                        <Form.Control
                            name="timeClose"
                            type="time"
                            onChange={handleChangeEvents}
                            defaultValue={formData.timeClose}
                        />
                    </Form.Group>
                    <Form.Group className='my-4'>
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
                    </Form.Group>
                    <Form.Group className='my-2' controlId="userRole">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            aria-label="Select one"
                            name="role"
                            onChange={handleChangeEvents}
                            defaultValue={formData.role}
                            disabled={!isBreeder}
                        >
                            <option value="user">User</option>
                            <option value="breeder">Breeder</option>
                        </Form.Select>
                    </Form.Group>
                    <Form.Group className='my-2' controlId="userNote">
                        <Form.Label>Note \ Comment</Form.Label>
                        <Form.Control
                            aria-label="Leave a note"
                            type="text"
                            name="note"
                            onChange={handleChangeEvents}
                            defaultValue={formData.note}
                        />
                    </Form.Group>
                    Known bug.
                    <br />
                    <b>PLEASE double click the Update button to SAVE</b>

                    {isUpdating && <Loader />}
                    <br />
                    <Button type='submit' variant="primary" className="mt-3">
                        Update
                    </Button>
                </Form>
            </FormContainer>

            <Modal show={show} onHide={handleClose}>
                <Modal.Header closeButton>
                    <Modal.Title>Change Breeder Role ID</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {`Server Name: ${guildSelection.name}`}
                    <br />
                    {`RoleID: `}
                    <Form.Control id="new-breeder-id" type="text" onChange={e => setGuildBreederRoleChange(e.target.value)} defaultValue={guildBreederRole} />
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={handleClose}>
                        Cancel
                    </Button>
                    <Button variant="success" onClick={handleSave}>
                        Save
                    </Button>

                </Modal.Footer>
            </Modal>

            <FormContainer>
                <h2>Server Permissions</h2>
                <Form >
                    <Form.Group className='my-2' controlId="previously-requested">
                        <ListGroup>
                            {buildGuildDetails()}
                        </ListGroup>
                    </Form.Group>
                    {isUpdating && <Loader />}
                </Form>
            </FormContainer>
        </>
    )
}

export default ProfileScreen