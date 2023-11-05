import { useEffect, useState } from "react";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import { Typeahead } from "react-bootstrap-typeahead"


const ProfileScreen = () => {
    const dispatch = useDispatch()
    const [UpdateProfile] = useUpdateUserMutation()
    const { userInfo } = useSelector((state) => state.auth)
    const timezoneList = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]

    const [guildSelection,setGuildSelection] = useState([userInfo.guilds[userInfo.guild]])
    const [formData, setFormData] = useState({
        timezone:userInfo.timezone,
        role:userInfo.role,
        note:userInfo.note
    })

    let guildsList = []
    for (let tempId in userInfo.guilds) {
        guildsList.push(userInfo.guilds[tempId])

    }
    // console.warn(guildsList)
    // console.warn(typeof guildsList)
 
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
        console.log(`Event value: ${event.target.value}`)
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
        try{
            await UpdateProfile({
                id: userInfo.id,
                guild: guildSelection[0].id,
                ...formData,})
                .then(res => {
                    toast.info(`${res.data.global_name}'s profile has been updated`)

                    dispatch(setCredentials(res.data))
                    // SOMETHING is funky here causing AUTH Redux maybe to fail being over written
                    console.warn("Response value")
                    console.log(res.data)
                })
        }catch (err){
            toast.error((err?.data?.message || err.error))
        }
    }

    // useEffect(()=>{
    //     if (!hasRun) {
    //         loadFormValues()
    //     }
    //     console.log(`useEffect>> ${guildSelection}`)


    // },[hasRun, guildSelection])

    return (
    <FormContainer>
        <h1>Update Profile</h1>
        <Form onSubmit={submitHandler}>
            <Form.Group className='my-2' controlId="discordGlobalName">
                <Form.Label>Discord Name</Form.Label>
                <Form.Control 
                    type="text"
                    disabled={true}
                    value={userInfo.global_name}
                ></Form.Control>
            </Form.Group>
            <Form.Group className='my-2' controlId="discordId">
                <Form.Label>Discord ID</Form.Label>
                <Form.Control 
                    type="text"
                    disabled={true}
                    value={userInfo.id}
                ></Form.Control>
            </Form.Group>     
            <Form.Group className="mt-3">
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
            <Form.Group className='my-2' controlId="timezone">
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
            I know there is some funk going on with refreshing this page, known bug. 
            <br/> 
            <b>PLEASE double click the Update button</b>  
              
            <Button type='submit' variant="primary" className="mt-3">
                Update 
            </Button>     
        </Form>
    </FormContainer>
  )
}

export default ProfileScreen