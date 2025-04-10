import React from 'react'
// import { useState, useEffect } from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
// import Layout from '../../components/layout'
import Menu from '../../components/navbar'
// import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
// import { Container, Row, Col } from 'react-bootstrap'
import Seo from '../../components/seo'
import PhotoGallery from '../../components/PhotoGallery'
import { Accordion } from 'react-bootstrap'
// import Lightbox from '../../components/Lightbox'

const PhotoBlogPage = ({ data }) => {
    const post  = data
    return (
        <>
        <Seo title = {`${post.photoBlogYaml.name}: Photos`} description = {post.photoBlogYaml.description}/>
            <Menu />
            <div style = {{display : "grid"}}>
                <GatsbyImage image = {post.photoBlogYaml.backgroundImage.childImageSharp.gatsbyImageData} alt = "" 
                style = {{gridArea: "1/1", width: "100%", height: "100vh", zIndex: -1, position: "fixed", opacity: "0.5", top: 0, left: 0}}
                layout = "fullWidth"/>
            <div style = {{gridArea: "1/1",
                position: "relative",
                placeItems: "center"}}>
                <h1 style = {{textAlign:"center", fontWeight:600, paddingTop: "30px"}}>{post.photoBlogYaml.name}</h1>
                <p style = {{textAlign: "center", marginBottom: "5px"}}>{post.photoBlogYaml.description}</p>
                <p style = {{textAlign: "center"}}>{post.photoBlogYaml.date}</p>
                {post.photoBlogYaml.name == "Grad Photos" ? 
                    <div style={{backgroundColor: 'rgba(34,40,49,0.8)', borderRadius: "10px", maxWidth:"550px", padding: "5px", margin: "15px"}}>
                        <h4 style={{fontFamily:'Halyard-Display', fontWeight: 600, color: "white", paddingTop: "5px", textAlign: "center"}}>2025 Grad Bookings</h4>
                        <p style = {{textAlign: "center", color: 'white', fontSize: "16px", fontWeight: 200}}>
                            Please fill out the form below or use this <a href="https://calendar.app.google/5aZ3X6hMtxnkhT2V9" style={{"textDecoration": "underline", color: "skyblue"}}>link</a> to book a session.
                            Hopefully it will be pretty chill and fun.
                            <br/>
                            <span style={{fontWeight:600, textAlign: "left", lineHeight:"2"}}>Booking with me includes</span>
                            <em>
                            <ul style = {{paddingLeft: "0px", textAlign: "left", lineHeight: "1.15"}}> 
                                <li>Flexible 1-1.5 hour photo shoot</li>
                                <li>Solo and/or group pics</li>
                                <li>Locations of your choice (within reason)</li>
                                <li>Proofs of raw photos</li>
                                <li>Editing in the style of your choice</li>
                                <li>A really sick photographer</li>
                            </ul>
                            </em>
                            <br/>
                            I accept payment in the form of money, food, or friendship -- depending on who you are. I'll work with your budget to determine pricing,
                            but estimate around $75-$100 for a 1ish hour session for one person. I will charge a flat rate that includes the shoot, proofs, and edits depending on your requests and group size,
                            so don't feel rushed to keep the hourly rate in mind.
                        </p>
                        <Accordion>
                            <Accordion.Item eventKey="0">
                                <Accordion.Header>Book a shoot with me!</Accordion.Header>
                                <Accordion.Body>
                                <iframe src="https://calendar.google.com/calendar/appointments/schedules/AcZssZ1gmPus5J5yLhg9HHiEHCg_-1cVEUvizQh1k5wX-EptiA1MnBrarD_VT4D3XRHvM_mlUHfL-X7O?gv=true" style={{backgroundColor: "white"}} width="100%" height="1000"></iframe>
                                Thanks for your interest in booking a grad shoot with me!

                                Please fill out the form below to book a slot with me. Be sure to include any special requests --outfit changes, specific locations other than Royce Quad (engineering, TFT, etc.), editing styles/inspiration -- and I'll do my best to accommodate them. 

                                Based on your input, I'll reach out via text to confirm your appointment and determine pricing.
                                </Accordion.Body>
                            </Accordion.Item>
                            </Accordion>
                    </div>
                : <p style = {{textAlign: "center"}}></p>}
                <div style = {{padding: "0px 0em"}}>


                <PhotoGallery post = {post}/>
                {/* {post.photoBlogYaml.images.map(image => {
                    return(
                        <>
                        <Lightbox imageData = {image.childImageSharp.gatsbyImageData}/>
                        </>
                    )})} */}
                </div>
            </div>
            </div>
        </>
    )
}

export const query = graphql`
query($id: String!) {
    photoBlogYaml(id: {eq: $id}) {
        id
        name
        description
        backgroundImage {
            childImageSharp {
            gatsbyImageData
            }
            }
        date(formatString: "YYYY-MM-DD")
        images {
            publicURL
            childImageSharp {
            gatsbyImageData(formats: WEBP)
            }
          }
  }
}
`

export default PhotoBlogPage