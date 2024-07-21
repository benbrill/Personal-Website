import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { useState, useEffect, useRef } from 'react'
// import { useMediaQuery } from 'react-responsive'
import { Media, MediaContextProvider } from "../Media"

function Menu() {
    const [navBackground, setNavBackground] = useState(true)
    const navRef = useRef()
    navRef.current = navBackground
    useEffect(() => {
      const handleScroll = () => {
        const show = window.scrollY < 100
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
      <MediaContextProvider>
        <Media lessThan = "sm">
        <Navbar expand = "sm" fixed = "top" style={{ transition: '1s ease', backgroundColor: '#2b2b2b'}}>
        <Container>
        <Navbar.Brand href="/" style={{ transition: '0.5s ease', color: "white", opacity: '100%' , fontFamily : "Halyard-Display", fontSize : "2rem", fontWeight: 600}}>Ben-Ohr Brill</Navbar.Brand>
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
      </Media>
        <Media greaterThan = "sm">
        <Navbar expand = "sm" fixed = "top" style={{ transition: '1s ease', backgroundColor: navBackground ?  'transparent' : '#2b2b2b'}}>
        <Container>
        <Navbar.Brand href="/" style={{ transition: '0.5s ease', color: "white", opacity: navBackground ? '0%' : '100%', fontFamily : "Halyard-Display", fontSize : "2rem", fontWeight: 600}}>Ben-Ohr Brill</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="justify-content flex-end" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content flex-end">
        <Nav className="justify-content right" >
          <Nav.Link href="/resume" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Resume</Nav.Link>
          <Nav.Link href="/data" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Data</Nav.Link>
          {/* <Nav.Link href="https://benbrill.myportfolio.com/" target = "_blank" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Design</Nav.Link> */}
          <Nav.Link href="/photos" style={{ transition: '1s ease', color: navBackground ? '#2b2b2b' : 'white'}}>Photos</Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
      </Media>
      </MediaContextProvider>
    )
}

export default Menu
