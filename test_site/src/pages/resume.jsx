import React from 'react'
import Layout from '../components/layout'
import { StaticImage } from 'gatsby-plugin-image'
import { Container } from 'react-bootstrap'

const resume = () => {
    return (
        <div>
            <Layout>
                <Container fluid = "true" style = {{paddingTop: "20px", display: "flex"}}>
                    <StaticImage src = "../images/Washington-DC-ProfileInsta.jpg" style={{borderRadius: "50%", marginRight: "40px"}} width = {200} aspectRatio = {1}/>
                    <div style = {{flex: 1}}>
                        <h1 style = {{fontWeight: 600, fontSize: "3.5rem"}}>Ben Brill</h1>
                        <p>Data Science/Statistics</p>
                        <div style = {{display: "flex", justifyContent: "space-between"}}>
                            <div>Email</div>
                            <div>github</div>
                            <div>twitter</div>
                            <div>LinkedIn</div>
                        </div>
                    </div>
                </Container>
                
            </Layout>
            
        </div>
    )
}

export default resume
