import React from 'react'
import Layout from '../components/layout'
import IntroCard from '../components/IntroCard'
import Button from 'react-bootstrap/Button';
import CardGroup from 'react-bootstrap/CardGroup'
import { StaticImage } from 'gatsby-plugin-image'

const AboutPage =  function about() {
    return (
        <>
        <StaticImage src="../images/JTree_Day.jpg" placeholder="blured" layout="fullWidth" />
        <Layout>
        <div>
            <h1>About</h1>
            <p>Lorem ipsum dolor sit amet, consectetur adipisicing elit. Qui, in voluptates praesentium animi sed, deserunt ducimus quasi delectus suscipit dolorem sint adipisci ipsum facilis enim beatae voluptatem dolor soluta fugit, veniam doloribus? Neque autem commodi itaque provident. Sequi, voluptatum eius?</p>
        </div>
        <CardGroup>
            <IntroCard header = "Welcome to UCLA"  url = "../images/Royce_Royce.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
            <IntroCard header = "I am a Data Scientist" url = "../images/Data_Data.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
            <IntroCard header = "Research and stuff" url = "../images/design-07.svg" body = "Lorem ipsum dolor sit amet, consectetur adipisicing elit"/>
        </CardGroup>
        <div className="hi" style = {{height: '100vh'}}></div>
        <Button>Hello</Button>
        </Layout>
        </>
    )
}

export default AboutPage
