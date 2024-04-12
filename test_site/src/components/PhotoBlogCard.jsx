import React from 'react'
import { Card } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby'
import'../static/card.scss'

const PhotoBlogCard = ({props}) => {
    return (
        
        <Card id = "photoCard" style = {{background:"#222831"}}>
            <Link to = {props.web_path}><Card.Title className = "title" style={{color:"#EEEEEE"}}>{props.name}</Card.Title></Link>
            <Link to = {props.web_path}><GatsbyImage image = {props.featuredImage.childImageSharp.gatsbyImageData}/></Link>
            <Card.Text class="text" style={{color:"#EEEEEE"}}>{props.description}  </Card.Text>
            <Card.Text class="footer" style={{color: "#76ABAE"}}>{props.date}</Card.Text>
        </Card>
        
    )
}

export default PhotoBlogCard
