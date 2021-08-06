import React from 'react'
import { Card } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby'
import'../static/card.scss'

const PhotoBlogCard = ({props}) => {
    return (
        
        <Card id = "photoCard">
            <Link to = {props.web_path}><Card.Title className = "title">{props.name}</Card.Title></Link>
            <Link to = {props.web_path}><GatsbyImage image = {props.featuredImage.childImageSharp.gatsbyImageData}/></Link>
            <Card.Text class="text">{props.description}</Card.Text>
            <Card.Footer class="footer">{props.date}</Card.Footer>
        </Card>
        
    )
}

export default PhotoBlogCard
