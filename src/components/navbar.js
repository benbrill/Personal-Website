import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'

function Menu() {

    return (
        <Navbar expand = "sm" sticky = "top" style={{ transition: '1s ease', backgroundColor:  '#222831'}} variant="dark">
        <Container>
        <Navbar.Brand href="/" style={{ transition: '0.5s ease', color: "white", fontFamily : "Halyard-Display", fontSize : "2rem", fontWeight: 600}}>Ben-Ohr Brill</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="justify-content flex-end" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content flex-end">
        <Nav className="justify-content right" >
          <Nav.Link href="/resume" style={{ transition: '1s ease', color: 'white'}}>Resume</Nav.Link>
          <Nav.Link href="/data" style={{ transition: '1s ease', color: 'white'}}>Data</Nav.Link>
          {/* <Nav.Link href="https://benbrill.myportfolio.com/" target = "_blank" style={{ transition: '1s ease', color: 'white'}}>Design</Nav.Link> */}
          <Nav.Link href="/photos" style={{ transition: '1s ease', color: 'white'}}>Photos</Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}

export default Menu
