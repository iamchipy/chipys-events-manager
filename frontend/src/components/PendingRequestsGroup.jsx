import {useEffect, useState} from "react"
import { ListGroup, Badge, Form } from "react-bootstrap"
import { useSelector} from 'react-redux'
import { useFetchPendingMutation } from "../slices/userApiSlice";

const PendingDinoRequestsGroup = () => {

    // fetech user info
    const { userInfo } = useSelector((state) => state.auth)

    // define the state tracker
    const [listItems, setItems] = useState([])

    const [fetchPending] = useFetchPendingMutation()     
    
    // build the fetching effect thing
    useEffect(()=>{
        async function fetchData(userInfo) {
            const response = await fetchPending({ userInfo })
            const items  = response.data
            console.log("response.data ===?")
            console.info(JSON.stringify(items))
            setItems(items => items)
            console.warn(listItems)
        }
        try{
            fetchData(userInfo)
        }catch (err){
            console.warn("Trouble fetching pending dino request history:")
            console.warn(err)
        }
    }, [userInfo, fetchPending])


    return (
        <ListGroup>
            <Form.Label>Pending Requests</Form.Label>
            {listItems.map((item) => {
                <ListGroup.Item key={item.id} as="li" className="d-flex justify-content-between align-items-start">
                    <div className="ms-2 me-auto">
                    <div className="fw-bold">
                        <img width="55" src="https://www.dododex.com/media/creature/archaeopteryx.png" />
                        item.dino
                    </div>
                    Reqested on 10-30-2023
                    </div>
                    <Badge bg="primary" pill>
                    1
                    </Badge>
                </ListGroup.Item>    
            })}
        </ListGroup>
    )      
}


export default PendingDinoRequestsGroup