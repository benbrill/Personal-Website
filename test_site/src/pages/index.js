import React from 'react'
import Layout from '../components/layout_home'
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
            <IntroCard pos = "Student" header = "UCLA"  url = "../images/Royce_Royce.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
            <IntroCard pos = "I like" header = "Research" url = "../images/design-07.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
            <IntroCard pos = "Editor" header = "Data Scientist" url = "../images/Data_Data.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
        </CardGroup>
        <Alert variant = "secondary">Check out more about me in my <Alert.Link href = "/resume">resume</Alert.Link></Alert>
        <StaticImage src = "../../static/images/LA_Night.jpg" layout="fullWidth"/>
        </Layout>
        </>
    )
}


export default HomePage
