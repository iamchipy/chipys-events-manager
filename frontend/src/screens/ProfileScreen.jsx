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
    let [timezone, setTimezone] = useState([userInfo.timezone]);
    let [role, setRole] = useState([userInfo.role])
    let [note, setNote] = useState([userInfo.note])
    let [guildSelection, setGuildSelection] = useState([userInfo.guild]);

    const timezoneList = [-12,-11,-10,-9,-8,-7,-6,-5,-4,-3,-2,-1,0,1,2,3,4,5,6,7,8,9,10,11,12]

    let guildNames = []
    for (let i = 0; i < userInfo.guilds.length; i++){
        guildNames.push(userInfo.guilds[i].name)
    }
    
    const handleRoleChange = async (event) => {
        setRole(event.target.value)
    }

    const handleNoteChange = async (event) => {
        setNote(event.target.value)
    }  

    const handleTimezone = async (event) => {
        setTimezone(event.target.value)
    }        

    // console.log(userInfo)
    const loadFormValues = async () => {
        // try{
        //     const user = await GetProfile(userInfo.id)
        //         .then(res => {
        //             console.warn("received user:")
        //             console.warn(res)
        //         })
        //     console.info(user)
            
        // }catch (e){
        //     console.error(e)
        // }

        // try{
        //     setRole(userInfo.role)
        //     setNote(userInfo.note)
        //     setGuildSelection(userInfo.guild)
        //     setTimezone(userInfo.timezone)
        //     toast.info("Profile loaded")
        // }catch (e) {
        //     toast.error("Failed to load profile values")
        //     console.error(e)
        // }
    }


    // const convertToUTCOffset = (timeZone) => {
    //     if (timezone === 0) {return 0}
    //     const timeZoneName = Intl.DateTimeFormat("ia", {
    //       timeZoneName: "short",
    //       timeZone,
    //     })
    //       .formatToParts()
    //       .find((i) => i.type === "timeZoneName").value;
    //     const offset = timeZoneName.slice(3);
    //     if (!offset) return 0;
      
    //     const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
    //     if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;
      
    //     const [, sign, hour, minute] = matchData;
    //     let result = parseInt(hour) * 60;
    //     if (sign === "+") result *= -1;
    //     if (minute) result += parseInt(minute);
      
    //     return result;
    // };

    const submitHandler = async (e) => {
        e.preventDefault()
        
        // unwrapping lists
        // console.log(Object.prototype.toString.call(guildSelection))
        if (guildSelection instanceof Array){
            guildSelection = guildSelection[0]
        }
        if (note instanceof Array){
            note = note[0]
        } 
        if (timezone instanceof Array){
            timezone = timezone[0]
        } 
        if (role instanceof Array){
            role = role[0]
        }                        

        try{
            await UpdateProfile({
                id: userInfo.id,
                timezone: timezone,
                role: role,
                guild: guildSelection,
                note: note,})
                .then(res => {
                    toast.info(`${res.data.global_name}'s profile has been updated`)

                    dispatch(setCredentials(res.data))
                    // SOMETHING is funky here causing AUTH Redux maybe to fail being over written
                    // console.warn("Response value")
                    // console.log(res.data)
                })
        }catch (err){
            toast.error((err?.data?.message || err.error))
        }

    }

    useEffect(()=>{
        loadFormValues()
    },[])

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
                <Form.Label>Select Tibe Discord</Form.Label>
                    <Typeahead
                        id="Dino-Selector"
                        labelKey="dinoSearch"
                        onChange={setGuildSelection}
                        highlightOnlyResult={false}
                        options={guildNames}
                        placeholder="Select Guild"
                        selected={guildSelection}
                    />
                </Form.Group>                     
            <Form.Group className='my-2' controlId="timezone">
                <Form.Label>Select Timezone</Form.Label>  
                <Form.Select 
                    onChange={(event) => handleTimezone(event)}
                    defaultValue={timezone[0]}
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
                    onChange={handleRoleChange}
                    defaultValue={role[0]}
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
                    onChange={handleNoteChange}
                    defaultValue={note}
                />                          
            </Form.Group>           
            I know there is some funk going on with refreshing this page, known bug.   
            <br/>   
            <Button type='submit' variant="primary" className="mt-3">
                Update 
            </Button>     
        </Form>
    </FormContainer>
  )
}

export default ProfileScreen