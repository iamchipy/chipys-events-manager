import { Container, Card, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';

const Hero = () => {
  return (
    <div className=' py-5'>
      <Container className='d-flex justify-content-center'>
        <Card className='p-5 d-flex flex-column align-items-center hero-card bg-light w-75'>
          <img src="https://chipy.dev/res/c3_logo.png" className="img-fluid" alt="logo" />
          <h1 className='text-center mb-4'>Chipy's Breeder Assistant</h1>
          <p className='text-center mb-4'>
            Welcome to Chipy's event manager for ARK Survival Ascended! This tool helps breeders
            manager their requests from tribe members for new tames, arrange hatching events, and 
            notification announcements for members and people on the request list.
          </p>
          <div className='d-flex'>
            <LinkContainer to='/login' >
              <Button variant='primary' className='me-3'>
                Sign In
              </Button>
            </LinkContainer>
            <LinkContainer to='/register' >
              <Button variant='secondary'>
                Register
              </Button>
            </LinkContainer>
          </div>
        </Card>
      </Container>
    </div>
  );
};

export default Hero;