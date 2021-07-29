import React from 'react'
import desktopImage from "..//images/JTree_Day.jpg"
import mobileImage from "..//images/JTree_Day_Mobile.jpg"
import { StaticImage } from 'gatsby-plugin-image';
import { useState, useEffect } from 'react';
import Image from 'react-bootstrap/Image'
import { Container } from 'react-bootstrap';
import MediaQuery from 'react-responsive'
import '../static/card.scss'



const HeroLanding = () => {
    // const imageUrl = useWindowWidth() >= 650 ? desktopImage : mobileImage
    return (
        <>
            <MediaQuery minWidth={650}>
            <StaticImage src="../images/JTree_Day.jpg" layout="fullWidth" />
                <Container id = "desktop">
                    <span style = {{fontFamily : "Halyard-Display", fontSize : "5rem", fontWeight: 600, lineHeight: "5rem"}}>Ben-Ohr Brill</span>
                    <p>Welcome to my site</p>
                </Container>
            </MediaQuery>
            <MediaQuery maxWidth={650}>
                <StaticImage src="../images/JTree_Day_Mobile.jpg" layout="fullWidth" />
                <Container id = "mobile">
                    <span style = {{fontFamily : "Halyard-Display", fontSize : "5rem", fontWeight: 600, lineHeight: "5rem"}}>Ben-Ohr Brill</span>
                    <p>Welcome to my site</p>
                </Container>
            </MediaQuery>
        </>
    )
}

// const useWindowWidth = () => {
//     const [windowWidth, setWindowWidth ] = useState(window.innerWidth);
//     // https://itnext.io/responsive-background-images-using-react-hooks-941af365ea1f
//     useEffect(() => {
//         const handleWindowResize = () => {
//             setWindowWidth(window.innerWidth);
//         };

//         window.addEventListener('resize', handleWindowResize);
//         return () => window.removeEventListener('resize', handleWindowResize);
//     },[]);

//     return windowWidth;
// };


export default HeroLanding
