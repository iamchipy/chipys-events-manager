import { Navbar, Nav, Container, NavDropdown, Badge, NavbarBrand, NavItem} from 'react-bootstrap';
import { FaSignInAlt, FaSignOutAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap'
import { useLogoutMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

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
                    <img src="https://www.freepnglogos.com/uploads/discord-logo-png/discord-logo-vector-download-0.png" style={{width:24, height:24, margin:5}} alt="avatar" />
                  {/* </LinkContainer> */}
                  <NavDropdown title={userInfo.discord} id="username">
                  <LinkContainer to='/request'>
                      <NavDropdown.Item>Requests</NavDropdown.Item>
                  </LinkContainer>                       
                  <LinkContainer to='/profile'>
                      <NavDropdown.Item>Profile</NavDropdown.Item>
                  </LinkContainer>
                  <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                  </NavDropdown>
                </>
              ) : (
                <>
                  <LinkContainer to='/login'>
                    <Nav.Link>
                      <FaSignInAlt /> Sign In
                    </Nav.Link>
                  </LinkContainer>
                  <LinkContainer to='/register'>
                    <Nav.Link>
                      <FaSignOutAlt /> Sign Up
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