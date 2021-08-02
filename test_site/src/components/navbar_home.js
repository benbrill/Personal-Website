import React from 'react'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import { useState, useEffect, useRef } from 'react'
import { useMediaQuery } from 'react-responsive'

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
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 750px)' })

    return (
        <Navbar expand = "sm" fixed = "top" style={{ transition: '1s ease', backgroundColor: isTabletOrMobile ? '#2b2b2b' : navBackground ?  'transparent' : '#2b2b2b'}}>
        <Container>
        <Navbar.Brand href="/" style={{ transition: '0.5s ease', color: "white", opacity: isTabletOrMobile ? '100%' : navBackground ? '0%' : '100%', fontFamily : "Halyard-Display", fontSize : "2rem", fontWeight: 600}}>Ben-Ohr Brill</Navbar.Brand>
        <Navbar.Toggle aria-controls="responsive-navbar-nav" className="justify-content flex-end" />
        <Navbar.Collapse id="responsive-navbar-nav" className="justify-content flex-end">
        <Nav className="justify-content right" >
          <Nav.Link href="/resume" style={{ transition: '1s ease', color: isTabletOrMobile ? 'white' : navBackground ? '#2b2b2b' : 'white'}}>Resume</Nav.Link>
          <Nav.Link href="/data" style={{ transition: '1s ease', color: isTabletOrMobile ? 'white' : navBackground ? '#2b2b2b' : 'white'}}>Data</Nav.Link>
          <Nav.Link href="/design" style={{ transition: '1s ease', color: isTabletOrMobile ? 'white' : navBackground ? '#2b2b2b' : 'white'}}>Design</Nav.Link>
          <Nav.Link href="/photos" style={{ transition: '1s ease', color: isTabletOrMobile ? 'white' : navBackground ? '#2b2b2b' : 'white'}}>Photos</Nav.Link>
        </Nav>
        </Navbar.Collapse>
        </Container>
      </Navbar>
    )
}

export default Menu
