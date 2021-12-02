import React from 'react'
import Layout from '../components/layout'
import { StaticImage } from 'gatsby-plugin-image'
import { Container } from 'react-bootstrap'
import { graphql } from "gatsby"
import Seo from '../components/seo'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const resume = ({data}) => {
    return (

        <div>
            <Seo title="Resume" />
            <Layout>
              <Container fluid = "true">
                <Row>
                  <Col lg={4}>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                    <StaticImage src = "../images/Washington-DC-ProfileInsta.jpg" style={{borderRadius: "50%", marginRight: "40px"}} width = {250} aspectRatio = {1}/>
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
                </div>
                </Col>
                <Col lg = {4}>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                <h1>Education</h1>
                {data.allDataYaml.nodes[0].Education.map(element => (
                    <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                        <h2 style = {{fontWeight: 4}}>{element.Name}</h2>
                        <p>{element.Details}</p>
                    </div>
                ))}
                </div>
                </Col>
                </Row>
                </Container>
            </Layout>
        </div>
    )
}

export const pageQuery = graphql`
query resumeQuery {
  allDataYaml {
    nodes {
      Education {
        Details
        Name
      }
      Experience {
        Description
        Employer
      }
    }
  }
}
  
`
export default resume

