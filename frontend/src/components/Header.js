import React from 'react'
import {useDispatch, useSelector} from 'react-redux'
import Container from 'react-bootstrap/Container';
import {Nav, Navbar, NavDropdown} from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { logout } from '../actions/userActions';

function Header() {
  const userLogin = useSelector(state => state.userLogin.userInfo)
  const {userInfo} = useSelector(state => state.userLogin)
  const dispatch = useDispatch()
  const logoutHandler = () => {
    console.log("Logout")
    if (userInfo) {
      dispatch(logout())
    }
  }
  return (
    <div>
        <header>
          <Navbar bg="dark" variant="dark" expand="lg" collapseOnSelect>
            <Container>
              <LinkContainer to="/">
                <Navbar.Brand>VendorVista</Navbar.Brand>
              </LinkContainer>
              <Navbar.Toggle aria-controls="navbarScroll" />
              <Navbar.Collapse id="navbarScroll">
                <Nav
                  className="me-auto"
                  style={{ maxHeight: '100px' }}
                  navbarScroll
                >
                  {userInfo && (
                    <>
                      <LinkContainer to="/sell">
                        <Nav.Link>Sell</Nav.Link>
                      </LinkContainer>
                      <LinkContainer to="/inbox">
                        <Nav.Link>Messages</Nav.Link>
                      </LinkContainer>
                    </>
                  )}
                </Nav>

                <Nav>
                  <LinkContainer to="/cart">
                    <Nav.Link><i className='fa fa-shopping-cart'></i>Cart</Nav.Link>
                  </LinkContainer>
                  {userInfo ? (
                    <NavDropdown title={userInfo.name} id='username'>
                      <LinkContainer to='/profile'>
                        <NavDropdown.Item>Profile</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/myorders'>
                        <NavDropdown.Item>My Orders</NavDropdown.Item>
                      </LinkContainer>
                      <LinkContainer to='/mylistings'>
                        <NavDropdown.Item>My Listings</NavDropdown.Item>
                      </LinkContainer>
                      <NavDropdown.Item onClick={logoutHandler}>Logout</NavDropdown.Item>
                    </NavDropdown>)
                    : (
                      <LinkContainer to="/login">
                        <Nav.Link><i className='fa fa-user'></i>Login</Nav.Link>
                      </LinkContainer>
                    )
                  }
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>

        </header>
    </div>
  )
}

export default Header;
