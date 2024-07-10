import React from 'react'
import { StaticImage } from 'gatsby-plugin-image';
// import Image from 'react-bootstrap/Image'
import { Container } from 'react-bootstrap';
import { Media, MediaContextProvider } from "../Media"
import '../static/card.scss'



const HeroLanding = () => {
    // const imageUrl = useWindowWidth() >= 650 ? desktopImage : mobileImage
    return (
        <>
            <MediaContextProvider>
            <Media greaterThan="sm">
            <StaticImage src='../../static/images/JTree_Day.jpg' layout="fullWidth" placeholder = "blurred" alt=""/>
                <Container id = "desktop">
                    <span style = {{fontFamily : "Halyard-Display", fontSize : "5rem", fontWeight: 600, lineHeight: "5rem"}}>Ben-Ohr Brill</span>
                    <p>Welcome to my site</p>
                </Container>
            </Media>
            <Media lessThan="sm">
                <StaticImage src='../../static/images/JTree_Day_Mobile.jpg' layout="fullWidth" placeholder = "blurred" alt=""/>
                <Container id = "mobile">
                    <span style = {{fontFamily : "Halyard-Display", fontSize : "5rem", fontWeight: 600, lineHeight: "5rem"}}>Ben-Ohr Brill</span>
                    <p>Welcome to my site</p>
                </Container>
            </Media>
            </MediaContextProvider>
        </>
    )
}



export default HeroLanding
