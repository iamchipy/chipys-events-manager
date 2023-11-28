import { useEffect, useState } from "react";
import { Form, Button, Badge, Modal, ListGroup } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import {
    useDispatch,
    useSelector,
} from 'react-redux'
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import {
    useUpdateUserMutation,
    useUpdateGuildMetaMutation,
    useRegisterMutation
} from "../slices/userApiSlice";
import { Typeahead } from "react-bootstrap-typeahead"
import moment from "moment";
import Loader from "../components/Loader";

const ProfileScreen = () => {

    const [show, setShow] = useState(false);
    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);
    // const navigate = useNavigate()
    const dispatch = useDispatch()
    const [updateProfile, { isUpdating }] = useUpdateUserMutation()
    const [updateGuildMeta, { isFetching }] = useUpdateGuildMetaMutation()
    const [registerUser, { isLoading }] = useRegisterMutation()
    const { userInfo } = useSelector((state) => state.auth)
    const [guildSelection, setGuildSelection] = useState([])
    const [isBreeder, setIsBreeder] = useState(false)
    const [guildsCurrentWebHook, setGuildsCurrentWebHook] = useState([userInfo.guilds[userInfo.guild]].webhook);
    const [guildsCurrentBreederRoleIDs, setGuildsCurrentBreederRoleIDs] = useState([]);  //TODO REMOVE Dulplicate var
    const [guildsBreederRoleIDsUpdated, setGuildsBreederRoleIDsUpdated] = useState([]);
    const [currentGuildRolesCache, setUsersCurrentGuildRolesCachePermissions] = useState({});
    const [formData, setFormData] = useState({
        timezone: userInfo.timezoneOffset,
        role: userInfo.role,
        note: userInfo.note,
        timeOpen: moment(userInfo.timeOpen).format("HH:mm"),
        timeClose: moment(userInfo.timeClose).format("HH:mm"),
    })
    const headers = "token" in userInfo ? { authorization: `Bearer ${userInfo.token}` } : { authorization: "Invalid" }
    let guildsList = []
    for (let tempId in userInfo.guilds) {
        guildsList.push(userInfo.guilds[tempId])

    }

    // Run once to fetch user's latest profile every time the page refreshes
    useEffect(() => {
        // disabled for now due to it cauing logouts incorrectly
        // // redirect to logout if token isn't valid
        // if (!("token" in userInfo) || userInfo.token == "" || userInfo.token == null){
        //     navigate("/logout")
        //     return
        // }

        // if token exists we hope it's valid and fetch user info
        registerUser({ id: userInfo.id })
            .then(result => {
                if ("error" in result) {
                    console.error(result)
                    return
                }
                dispatch(setCredentials(result.data))
            })
    }, [])

    // Trigger once on initial loading
    useEffect(() => {
        if (userInfo.guild != "" &&
            userInfo.guild in userInfo.guilds) {
            setGuildSelection([userInfo.guilds[userInfo.guild]])
        }
        // console.log(`Setting guildSelection to ${userInfo.guilds[userInfo.guild].name}`)
    }, [])

    // triggers when user change their Discord Server
    useEffect(() => {
        // prevent invalid checks
        if (guildSelection[0] == undefined ||
            guildSelection[0].id == undefined) {
            // Exit here cause we don't have required info 
            return
        }

        // fetch current selected guild's metadata details
        updateGuildMeta({ filter: { id: guildSelection[0].id } })
            .then(guildMetaInfo => {
                // if this guild has breeder role defined in the metadatabase
                if ("breederRoleIDs" in guildMetaInfo.data) {
                    console.log(`${guildSelection[0].name} DOES HAVE assigned breeder roles: ${guildMetaInfo.data.breederRoleIDs}`)
                    setGuildsCurrentBreederRoleIDs(guildMetaInfo.data.breederRoleIDs)
                    setGuildsBreederRoleIDsUpdated(guildMetaInfo.data.breederRoleIDs)
                    setGuildsCurrentWebHook(guildMetaInfo.data.webhook)

                } else {
                    console.log(`${guildSelection[0].name} does NOT have any assigned breeder roles`)
                    setGuildsCurrentBreederRoleIDs([])
                    setGuildsCurrentWebHook([])
                }


                console.log(`Fetching user's roles in "${guildSelection[0].name}"`)
                // Check if we've cached this fetch to avoid spam
                if (currentGuildRolesCache[guildSelection[0].id] != undefined &&
                    currentGuildRolesCache[guildSelection[0].id].roles != undefined) {
                    console.warn("Using cached guild info:")
                    console.log(currentGuildRolesCache[guildSelection[0].id])

                    setIsBreeder(isGuildBreeder(guildMetaInfo.data.breederRoleIDs, currentGuildRolesCache[guildSelection[0].id].roles))

                } else {
                    console.warn("Fetching fresh discord role info for user")
                    fetch(`https://discord.com/api/users/@me/guilds/${guildSelection[0].id}/member`, { headers })
                        .then(function (response) {
                            //this step is only needed when a CORS object is returned from fetch
                            return response.json()
                        })
                        .then(result => {
                            if ("error" in result) {
                                console.warn("Error fetching guild member info")
                                console.log(result.error)
                            } else if ("roles" in result) {
                                // now cache the date for later use
                                currentGuildRolesCache[guildSelection[0].id] = result
                                console.warn("caching...")
                                console.log(`User's roles in current guild: ${result.roles}`)
                                setIsBreeder(isGuildBreeder(guildMetaInfo.data.breederRoleIDs, currentGuildRolesCache[guildSelection[0].id].roles))
                            } else {
                                console.error("Something fails with fetching user's roles indiscord server")
                            }
                        })
                }
            })
    }, [guildSelection])

    // Triggers we've updated the isBreeder status for user in current server selection
    useEffect(() => {
        console.log(`isBreeder status changed => ${isBreeder}`)
    }, [isBreeder])


    // check for and update isAdmin status
    const isGuildBreeder = (guildsBreederRoleIDsList, usersRoleIDsList) => {

        // standardize incoming value types
        if (!(Array.isArray(guildsBreederRoleIDsList)) && guildsBreederRoleIDsList != undefined) {
            guildsBreederRoleIDsList = [guildsBreederRoleIDsList]
        }
        if (!(Array.isArray(usersRoleIDsList)) && usersRoleIDsList != undefined) {
            usersRoleIDsList = [usersRoleIDsList]
        }

        // break if we don't have the needed info
        if (guildsBreederRoleIDsList == undefined ||
            guildsBreederRoleIDsList[0] == undefined) {
            // cancel because we don't have the data to determine breeder status
            console.warn("Ivalid input for guildsBreederRoleIDsList (UNDEFINED)")
            return false
        }
        if (usersRoleIDsList == undefined ||
            usersRoleIDsList[0] == undefined) {
            // cancel because we don't have the data to determine breeder status
            console.warn("Ivalid input for usersRoleIDsList (UNDEFINED)")
            return false
        }

        // since we expect this to be short list O(n^2) is acceptible
        function doesHaveBreederRole(approvedBreederRoles, usersRoleList) {
            // console.log("Checking breeder permissions...")
            // console.log(approvedBreederRoles)
            // console.log(usersRoleList)

            for (let i = 0; i < approvedBreederRoles.length; i++) {
                if (usersRoleList.includes(approvedBreederRoles[i])) {
                    return true;
                }
            }
            return false;
        }


        if (doesHaveBreederRole(guildsBreederRoleIDsList, usersRoleIDsList)) {
            console.log("Breeder detected")
            return true
        }
        return false
    }

    // check for and update isAdmin status
    const isGuildAdmin = () => {
        if (guildSelection[0] == undefined) {
            return false
        }
        // console.log("Checking Admin")
        if ("guildAdmins" in userInfo) {
            if (userInfo.guildAdmins.includes(guildSelection[0].id ||
                userInfo.guildAdmins == guildSelection[0].id)) {
                console.log("guild ADMIN detected")
                return true
            }
        }
        return false
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
                        <Badge bg="primary" pill>1</Badge>
                    </div>
                    {`Breeder Role: ${guildsCurrentBreederRoleIDs}`}
                    <br />
                    {`Webhook: ${guildsCurrentWebHook != "" ? "Enabled" : "Disabled"}`}
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

        // new Date(Date.UTC(1970, 0, 1, 1, 25, 0, 0))
        // console.warn(new Date(0, 0, 0, formData.timeOpen.substr(0,2), formData.timeOpen.substr(3,5), 0, 0))

        // submit formData for upser update
        try {
            // verbose way to overwite user when admin has been revoked and breeder was selected
            let newValues = {
                ...formData,
                id: userInfo.id,
                guild: guildSelection[0].id,
                guildRoles: currentGuildRolesCache[guildSelection[0].id].roles,
                token: userInfo.token,
                timeOpen: new Date(0, 0, 0, formData.timeOpen.substring(0, 2), formData.timeOpen.substring(3, 5), 0, 0).valueOf(),
                timeClose: new Date(0, 0, 0, formData.timeClose.substring(0, 2), formData.timeClose.substring(3, 5), 0, 0).valueOf(),
                timezoneOffset: new Date().getTimezoneOffset()
            }
            if (!isBreeder && !isGuildAdmin()) {
                newValues = { ...newValues, role: "user" }
            }

            console.warn("newValues for updateProfile()")
            console.log(newValues)

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
        } else {
            handleShow()
        }
    }

    const handleSave = async () => {
        const filter = {
            id: guildSelection[0].id
        }
        const updatedValues = {
            breederRoleIDs: guildsBreederRoleIDsUpdated,
            webhook: guildsCurrentWebHook
        }
        console.warn("guildsBreederRoleIDsUpdated")
        console.log(guildsBreederRoleIDsUpdated)
        const result = await updateGuildMeta({ filter: filter, updatedValues: updatedValues })
        toast(result.name)

        handleClose()
    }

    return (
        <>
            <FormContainer>
                {isLoading && <Loader />}
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
                    {/* <Form.Group className='my-4'>
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
                    </Form.Group> */}
                    <Form.Group className='my-2' controlId="userRole">
                        <Form.Label>Role</Form.Label>
                        <Form.Select
                            aria-label="Select one"
                            name="role"
                            onChange={handleChangeEvents}
                            defaultValue={formData.role}
                            disabled={!isBreeder && !isGuildAdmin()}
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
                    {`Server Name: ${guildSelection[0] != undefined ? guildSelection[0].name : "Invalid"}`}
                    <br />
                    {`RoleID: `}
                    <Form.Control id="new-breeder-id" type="text" onChange={event => setGuildsBreederRoleIDsUpdated(event.target.value)} defaultValue={guildsCurrentBreederRoleIDs} />
                    {`WebHook: `}
                    <Form.Control id="new-webhook" type="text" onChange={event => setGuildsCurrentWebHook(event.target.value)} defaultValue={guildsCurrentWebHook} />
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