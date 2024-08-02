import React from 'react'
import Layout from '../components/layout'
import { StaticImage } from 'gatsby-plugin-image'
import { Container } from 'react-bootstrap'
import { graphql } from "gatsby"
import Seo from '../components/seo'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'

const basicsStyling = {display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end"}

const resume = ({data}) => {
    return (

        <div>
            <Seo title="Resume" />
            <Layout>
              <Container fluid = "true">
                <Row>
                  <Col lg={5}>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                    <StaticImage src = "../images/LACMA-1.jpg" style={{borderRadius: "50%", marginRight: "40px"}} width = {500 } aspectRatio = {1}/>
                    
                    
                </div>
                </Col>
                <Col lg = {7}>
                <div style = {{display: "flex", height: "100%", justifyContent: "center", flexDirection: "column", alignItems: "flex-start"}}>
                  <div style = {{width: "100%"}}>
                          <h1 style = {{fontWeight: 600, fontSize: "3.5rem"}}>Ben Brill</h1>
                          <p>Data Science/Statistics</p>
                          <div style = {{display: "flex", justifyContent: "space-between", width: "100%"}}>
                            <div style = {basicsStyling}>
                              <a href="https://github.com/benbrill" target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Github.svg" placeholder= "blurred"/></a>
                              <a href="https://github.com/benbrill" target="_blank" rel="noreferrer" style={{paddingTop: "10px"}}>Github</a>
                            </div>
                            <div style = {basicsStyling}>
                              <a href="https://twitter.com/benzbrill" target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Twitter.svg" placeholder= "blurred"/></a>
                              <a href="https://twitter.com/benzbrill" target="_blank" rel="noreferrer" style={{paddingTop: "10px"}}>Twitter</a>
                            </div>
                            <div style = {basicsStyling}>
                              <a href="https://www.linkedin.com/in/benohrbrill/" target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/LinkedIn.svg" placeholder= "blurred"/></a>
                              <a href="https://www.linkedin.com/in/benohrbrill/" target="_blank" rel="noreferrer" style={{paddingTop: "10px"}}>LinkedIn</a>
                            </div>
                            <div style = {basicsStyling}>
                              <a href="/../../static/Brill_BenOhr_Resume.pdf"  target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Attachment.svg" placeholder= "blurred"/></a>
                              <a href="/../../static/Brill_BenOhr_Resume.pdf" style={{paddingTop: "10px"}}>PDF Resume</a>
                            </div>
                          </div>
                  </div>
                </div>
                
                </Col>
                </Row>
                </Container>
                <div style = {{paddingTop: "20px", display: "flex", flexDirection: "column"}}>
                <h1>Experience</h1>
                {data.allDataYaml.nodes[0].Experience.map(element => (
                    <div>
                        <h3 style = {{fontWeight: 400}}>{element.Position}</h3> 
                        <h6 style = {{color: "#666666"}}>{element.Employer} | {element.Date}</h6>
                        <ul style = {{marginLeft: "0.5px", paddingLeft: "0.5rem"}}>
                        {element.Description.map(detail => (
                          <li style = {{marginBottom: "0.2rem"}} className = "resumeItem">{detail}</li>
                        ))}
                        </ul>
                    </div>
                ))}
                <h1>Education</h1>
                {data.allDataYaml.nodes[0].Education.map(element => (
                    <>
                        <h3 style = {{fontWeight: 400}}>{element.Name}</h3> 
                        <h6 style = {{color: "#666666"}}>{element.Date}</h6>
                        <ul style = {{marginLeft: "0.5px", paddingLeft: "0.5rem"}}>
                        {element.Details.map(detail => (
                          <li style = {{marginBottom: "0.2rem"}} className = "resumeItem">{detail}</li>
                        ))}
                        </ul>
                    </>
                ))}
                <div>
                      <h1>Skills and Tools</h1>
                      <h3>Data Science</h3>
                      <h6>Python, R, Excel, SQL, Machine Learning, Tensorflow, Data Visualization, Tableau, NLP</h6>
                </div>
                </div>
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

