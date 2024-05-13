import { Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap'

const Header = () => {
  const { userInfo } = useSelector((state)=>state.auth)

  let avatarURL = `https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg`
  try{
    avatarURL = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}`
    // displayName = userInfo.global_name
  }catch{
    console.log("Error loading user variables or avatar")
  }
  
  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <img src="./src/assets/cba_logo.png" style={{width:28, marginTop: -2, marginRight: 5}} alt="logo" />
          <LinkContainer to='/home'>
            <Navbar.Brand>{"Chipy's Breeder Assistant"}</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              {userInfo ? (
                <>            

                    <img src={avatarURL} style={{width:24, height:24, margin:5}} alt="avatar" />

                  <NavDropdown title={userInfo.global_name} id="username">
                  <LinkContainer to='/event'>
                        <NavDropdown.Item>Events</NavDropdown.Item>
                    </LinkContainer>  
                    <LinkContainer to='/'>
                        <NavDropdown.Item></NavDropdown.Item>
                    </LinkContainer>                        
                    <LinkContainer to='/request'>
                        <NavDropdown.Item>Requests</NavDropdown.Item>
                    </LinkContainer>    
                    <LinkContainer to='/queue'>
                        <NavDropdown.Item>Waiting List</NavDropdown.Item>
                    </LinkContainer>                                                          
                    <LinkContainer to='/'>
                        <NavDropdown.Item></NavDropdown.Item>
                    </LinkContainer>
                    <LinkContainer to='/profile'>
                        <NavDropdown.Item>Profile</NavDropdown.Item>
                    </LinkContainer>   
                    <LinkContainer to='/logout'>
                        <NavDropdown.Item>Logout</NavDropdown.Item>
                    </LinkContainer>   
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to='/register'>
                    <Nav.Link>
                      <img src={avatarURL} style={{width:24, height:24, marginRight:12}} alt="avatar" />
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                </>
              )}

            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>
    </header>
  );
};

export default Header;