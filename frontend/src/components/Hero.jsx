/* eslint-disable react/no-unescaped-entities */
import { Container, Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useSelector } from 'react-redux';

const Hero = () => {
  const { userInfo } = useSelector((state) => state.auth)
  


  return (
    <div className=' py-5'>
      <Container className='d-flex justify-content-center'>
        <Card className='p-5 d-flex flex-column align-items-center hero-card bg-light w-75'>
          <img src="https://cdn.discordapp.com/app-icons/1168939215367721021/725bdad94d7cad0a78381411d47f44bf.png" className="img-fluid" alt="logo" />
          <h1 className='text-center mb-4'>Chipy's Event Assistant</h1>  
          <p className='text-center mb-4'>
            Welcome to Chipy's event manager for ARK Survival Ascended! This tool helps leaders
            manager requests from members arranging for time and event management, notifications, and availablilities.           
          </p>
          <p className='text-center mb-4'>
          Here you can make event requests, get in queue for resources. Manage and review your requests. Manage your profile, timezone and tribe preferences.
          See the existing work-order and pending requests. View all up-coming events.
          </p>          
          <img src="https://i.imgur.com/3EWWbxW.png" className="img-fluid" alt="Multiple request options" />
          <img src="https://i.imgur.com/8tqkdma.png" className="img-fluid" alt="Creating events as a leader" style={{float: right}}/>
          
          
          
          
          {userInfo === null ? 
            <div className='d-flex'>
              <LinkContainer to='/register' >
                <Button variant='primary' className='me-3'>
                  Sign In
                </Button>
              </LinkContainer>
              {/* <LinkContainer to='/register' >
                <Button variant='secondary'>
                  Register
                </Button>
              </LinkContainer> */}
            </div>
            :
            <div className='d-flex'>
              <LinkContainer to='/request' >
                <Button variant='primary' className='me-3'>
                  Request Dinos
                </Button>
              </LinkContainer>
              {/* <LinkContainer to='/event' >
                <Button variant='secondary'>
                  Events
                </Button>
              </LinkContainer> */}
              <LinkContainer to='/profile' >
                <Button variant='secondary'>
                  Profile
                </Button>
              </LinkContainer>
              {/* <LinkContainer to='/queue' >
                <Button variant='secondary'>
                  Waiting List
                </Button>
              </LinkContainer>               */}
            </div>
          }
        </Card>
      </Container>
    </div>
  );
};

export default Hero;