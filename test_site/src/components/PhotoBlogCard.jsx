import React from 'react'
import { Card } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'

const PhotoBlogCard = ({props}) => {
    return (
        <Card id = "introCard">
            <Card.Title>{props.name}</Card.Title>
            <GatsbyImage image = {props.featuredImage.childImageSharp.gatsbyImageData}/>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Consectetur, minus?
        </Card>
    )
}

export default PhotoBlogCard
