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
                  <Col lg={5}>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                    <StaticImage src = "../images/Washington-DC-ProfileInsta.jpg" style={{borderRadius: "50%", marginRight: "40px"}} width = {500} aspectRatio = {1}/>
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
                    <div>
                      <h2>Skills and Tools</h2>
                      <h3>Data Science</h3>
                      <h6>Python, R, Excel, SQL, Machine Learning, Tensorflow, Data Visualization, Tableau, NLP</h6>
                    </div>
                </div>
                </Col>
                <Col lg = {7}>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column", paddingLeft: "30px"}}>
                <h1>Education</h1>
                {data.allDataYaml.nodes[0].Education.map(element => (
                    <div style = {{paddingTop: "20px"}}>
                        <h3 style = {{fontWeight: 400}}>{element.Name}</h3> 
                        <h6 style = {{color: "#666666"}}>{element.Date}</h6>
                        <ul style = {{marginLeft: "0.5px", paddingLeft: "0.5rem"}}>
                        {element.Details.map(detail => (
                          <li style = {{marginBottom: "0.2rem"}}>{detail}</li>
                        ))}
                        </ul>
                    </div>
                ))}
                <h1>Experience</h1>
                {data.allDataYaml.nodes[0].Experience.map(element => (
                    <div style = {{paddingTop: "20px"}}>
                        <h3 style = {{fontWeight: 400}}>{element.Position}</h3> 
                        <h6 style = {{color: "#666666"}}>{element.Employer} | {element.Date}</h6>
                        <ul style = {{marginLeft: "0.5px", paddingLeft: "0.5rem"}}>
                        {element.Description.map(detail => (
                          <li style = {{marginBottom: "0.2rem"}}>{detail}</li>
                        ))}
                        </ul>
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
        Date
      }
      Experience {
        Description
        Position
        Employer
        Date
      }
    }
  }
}
  
`
export default resume

