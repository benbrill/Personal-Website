import React from 'react'
import Layout from '../components/LayoutHome'
import IntroCard from '../components/IntroCard'
import HeroLanding from '../components/HeroLanding';
import CardGroup from 'react-bootstrap/CardGroup';
import { Alert } from 'react-bootstrap';
import {StaticImage} from 'gatsby-plugin-image'
import Seo from '../components/seo'
import '../App.scss'
// import { StaticImage } from 'gatsby-plugin-image'


const HomePage =  function HomePage() {
    // const imageUrl = useWindowWidth() >= 650 ? "../images/JTree_Day.jpg" : "../images/JTree_Day_Mobile.jpg";
    return (
        <>
        <Seo description = "Ben Brill's personal webpage" title = "Welcome" lang= "en" />
        <HeroLanding />
        <Layout>
        <div>
            <div className="homeAbout">About</div>
        </div>
        <CardGroup>
            <IntroCard pos = "Career" header = "Data Science" url = "../images/Data_Data.svg" body = "I am interested in finding a role in the Data Science and analytics!"/>
            <IntroCard pos = "Graduate from" header = "UCLA"  url = "../images/Royce_Royce.svg" body = "I graduated in 2023 from UCLA with a degree in Statistics and Data Science! I also was a tour guide there, so feel free to ask me about the building in the icon."/>
            <IntroCard pos = "Interested in" header = "Frontend Dev" url = "../images/design-07.svg" body = "I also like to dabble in Frontend Web Development. I have experience as a graphic designer and I'm hoping to translate those visual skills to the web."/>
        </CardGroup>
        <Alert variant = "secondary">Check out more about me in my <Alert.Link href = "/resume">resume</Alert.Link></Alert>
        <StaticImage src = "../../static/images/LA_Night.jpg" layout="fullWidth"/>
        </Layout>
        </>
    )
}


export default HomePage
