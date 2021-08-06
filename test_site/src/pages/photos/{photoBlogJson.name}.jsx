import React from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'

const PhotoBlogPage = ({ data }) => {
    const post  = data
    console.log(post)
    return (
        <>
            {post.photoBlogJson.images.map(image => (
                <GatsbyImage image = {image.childImageSharp.gatsbyImageData}/>
            ))}
            <GatsbyImage />
        </>
    )
}

export const query = graphql`
    query($id: String!) {
        photoBlogJson(id: {eq: $id}) {
            name
            id
            images {
              childImageSharp {
                gatsbyImageData
              }
            }
        }
    }
    
`

export default PhotoBlogPage
