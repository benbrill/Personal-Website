import React from 'react'
import Layout from '../components/layout'
import Button from 'react-bootstrap/Button';
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
        <div className="hi" style = {{height: '100vh'}}></div>
        <Button>Hello</Button>
        </Layout>
        </>
    )
}

export default AboutPage
