import { useState } from "react";
import { Form, Button } from "react-bootstrap";
import FormContainer from "../components/FormContainer";
import { useDispatch, useSelector} from 'react-redux'
import { toast } from "react-toastify";
import { setCredentials } from "../slices/authSlice";
import { useUpdateUserMutation } from "../slices/userApiSlice";
import TimezonePicker from 'react-bootstrap-timezone-picker';


const ProfileScreen = () => {
    const dispatch = useDispatch()
    const [UpdatProfile] = useUpdateUserMutation()
    const { userInfo } = useSelector((state) => state.auth)
    const [timezone, setTimezone] = useState('Europe/Moscow');
    const [role, setRole] = useState(userInfo.role)
    const [note, setNote] = useState(userInfo.note)


    const handleRoleChange = async (event) => {
        setRole(event.target.value)
    }

    const handleNoteChange = async (event) => {
        setNote(event.target.value)
    }    
    
    // NEED an API to request user info (not in)

    const convertToUTCOffset = (timeZone) => {
        const timeZoneName = Intl.DateTimeFormat("ia", {
          timeZoneName: "short",
          timeZone,
        })
          .formatToParts()
          .find((i) => i.type === "timeZoneName").value;
        const offset = timeZoneName.slice(3);
        if (!offset) return 0;
      
        const matchData = offset.match(/([+-])(\d+)(?::(\d+))?/);
        if (!matchData) throw `cannot parse timezone name: ${timeZoneName}`;
      
        const [, sign, hour, minute] = matchData;
        let result = parseInt(hour) * 60;
        if (sign === "+") result *= -1;
        if (minute) result += parseInt(minute);
      
        return result;
      };

    const submitHandler = async (e) => {
        e.preventDefault()
        try{
            const updatedUser = await UpdatProfile({
                id: userInfo.id,
                timezone: convertToUTCOffset(timezone),
                role: role,
                note: note,}).unwrap()
            // console.warn(updatedUser)
            toast.info(`${userInfo.global_name}'s profile has been updated`)
            dispatch(setCredentials({...updatedUser}))
            

        }catch (err){
            toast.error((err?.data?.message || err.error))
        }

    }

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
            <Form.Group className='my-2' controlId="timezone">
                <Form.Label>Select Timezone</Form.Label>  
                {/* TimezonePicker seems to be getting sunset and needs suppressed */}
                <TimezonePicker
                    absolute={false}
                    defaultValue="Europe/Moscow"
                    placeholder="Select timezone..."
                    onChange={(tz) => setTimezone(tz)}
                />   
            </Form.Group>  
            <Form.Group className='my-2' controlId="userRole">
                <Form.Label>Role</Form.Label>
                <Form.Select 
                    aria-label="Select one"
                    onChange={handleRoleChange}
                    >
                    <option value="User">User</option>
                    <option value="Breeder">Breeder</option>
                </Form.Select>                              
            </Form.Group> 
            <Form.Group className='my-2' controlId="userNote">
                <Form.Label>Note \ Comment</Form.Label>
                <Form.Control 
                    aria-label="Leave a note"
                    type="text"
                    onChange={handleNoteChange}
                />                          
            </Form.Group>                      
            <Button type='submit' variant="primary" className="mt-3">
                Update 
            </Button>     
        </Form>
    </FormContainer>
  )
}

export default ProfileScreen