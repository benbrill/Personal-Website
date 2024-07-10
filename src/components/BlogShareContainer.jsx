import React from 'react'
import Container from 'react-bootstrap/Container'
import {Row, Col } from 'react-bootstrap'
import { StaticImage } from 'gatsby-plugin-image';

const BlogShareContainer = ({ github, website, attachment }) => {
    console.log(github)
    return (
        <Container style = {{paddingBottom: "20px", display: "flex", alignItems: "center", gap: "50px"}}>
        
            {github &&
            <div style = {{display: "flex", flexDirection: "column", alignItems: "center"}}>
             <a href={github} target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Github.svg" placeholder= "blurred"/></a>
             <a href={github} target="_blank" rel="noreferrer" style={{paddingTop: "10px"}}>Github</a>
             </div>
             }
            {website && 
            <div style = {{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <a href={website} target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Website.svg" placeholder= "blurred" /></a>
            <a href={website} target="_blank" rel="noreferrer">Website</a>
            </div>}
            {attachment && 
            <div style = {{display: "flex", flexDirection: "column", alignItems: "center"}}>
            <a href={attachment} target="_blank" rel="noreferrer"><StaticImage src = "../../static/images/Attachment.svg" placeholder= "blurred" /></a>
            <a href={attachment} target="_blank" rel="noreferrer">Document</a>
            </div>}
        </Container>
    )
}

export default BlogShareContainer
