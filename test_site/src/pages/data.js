import React from 'react'
import Layout from '../components/layout'
import Container from 'react-bootstrap/Container'
import  Col  from 'react-bootstrap/Col'
import { StaticImage } from 'gatsby-plugin-image';

const Data = () => {
    return (
        <>
        <Layout>
            <Container fluid = "true">
                <Col>
                <StaticImage src = "../../static/images/Data_Data.svg" />
                </Col>
                <Col>
                    <h1>Data</h1>
                    <p>Here is a collection of some of my projects involving data science and development</p>
                </Col>
            </Container>
            
        </Layout>
            
        </>
    )
}

export default Data
