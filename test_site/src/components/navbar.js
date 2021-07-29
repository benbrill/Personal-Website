import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { useState, useEffect, useRef } from 'react'

function Menu() {
    const [navBackground, setNavBackground] = useState(true)
    const navRef = useRef()
    navRef.current = navBackground
    useEffect(() => {
      const handleScroll = () => {
        const show = window.scrollY < 50
        if (navRef.current !== show) {
          setNavBackground(show)
        }
      }
      document.addEventListener('scroll', handleScroll)
      return () => {
        document.removeEventListener('scroll', handleScroll)
      }
    }, [])

    return (
        <Navbar expand = "sm" fixed = "top" style={{ transition: '1s ease', backgroundColor: navBackground ?  'transparent' : '#2b2b2b'}}>
        <Container>
        <Navbar.Brand href="/" style={{ transition: '0.5s ease', color: navBackground ? '#2b2b2b' : 'white', fontFamily : "Halyard-Display", fontSize : "1.5rem"}}>Ben Brill</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="justify-content flex-end" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content flex-end">
        <Nav className="justify-content right" >
          <Nav.Link href="/about" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>About</Nav.Link>
          <Nav.Link href="#features" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Design</Nav.Link>
          <Nav.Link href="#pricing" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Pricing</Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}

export default Menu
