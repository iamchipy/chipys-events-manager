import { Navbar, Nav, Container, NavDropdown} from 'react-bootstrap';
import { FaSignInAlt } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { LinkContainer } from 'react-router-bootstrap'
import { useLogoutMutation } from '../slices/userApiSlice';
import { logout } from '../slices/authSlice';
import { useNavigate } from 'react-router-dom';

const Footer = () => {
    return (
        <footer>
            <div>
                <p className='text-center p-2 '>
                    Built & maintained by <b>chipy</b>. More info on this project on <a href="https://github.com/iamchipy/chipys-breeding-manager">GitHub</a>
                    <br />
                    Support my coding addition via <a href="https://www.paypal.com/donate/?hosted_button_id=KEYF8KWYJYSFU">Paypal</a>
                    
                </p>

            </div>
        </footer>
    );
};

export default Footer;