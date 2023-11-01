import { Navbar, Nav, Container, NavDropdown, Badge, NavbarBrand, NavItem} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap'
import { useLogoutMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const Header = () => {
  const { userInfo } = useSelector((state)=>state.auth)

  const dispatch = useDispatch()
  const navigate = useNavigate
  const [logoutApiCall] = useLogoutMutation()

  const logoutHandler = async () => {
    try {
      await logoutApiCall().unwrap()
      dispatch(logout())
      navigate('/')
    }catch (err) {
      console.log(err)
    }
  }

  let avatarURL = `https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6ca814282eca7172c6_icon_clyde_white_RGB.svg`
  // let displayName = "Sign In"
  try{
    avatarURL = `https://cdn.discordapp.com/avatars/${userInfo.id}/${userInfo.avatar}`
    // displayName = userInfo.global_name
  }catch{
    toast.warn("Error loading user variables")
  }
  
  return (
    <header>
      <Navbar bg='dark' variant='dark' expand='lg' collapseOnSelect>
        <Container>
          <img src="https://chipy.dev/res/c3_logo.png" style={{width:28, marginTop: -2, marginRight: 5}} alt="logo" />
          <LinkContainer to='/home'>
            <Navbar.Brand>Chipy's Breeder Assistant</Navbar.Brand>
          </LinkContainer>
          <Navbar.Toggle aria-controls='basic-navbar-nav' />
          <Navbar.Collapse id='basic-navbar-nav'>
            <Nav className='ms-auto'>
              {userInfo ? (
                <>            
                  {/* <LinkContainer to='/profile'> */}
                    <img src={avatarURL} style={{width:24, height:24, margin:5}} alt="avatar" />
                  {/* </LinkContainer> */}
                  <NavDropdown title={userInfo.global_name} id="username">
                  <LinkContainer to='/event'>
                      <NavDropdown.Item>Events</NavDropdown.Item>
                  </LinkContainer>    
                  <LinkContainer to='/request'>
                      <NavDropdown.Item>Requests</NavDropdown.Item>
                  </LinkContainer>                                         
                  {/* <LinkContainer to='/profile'>
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer> */}
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to='/login'>
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