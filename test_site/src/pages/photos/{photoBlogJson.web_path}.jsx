import React from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout'

const PhotoBlogPage = ({ data }) => {
    const post  = data
    return (
        <>
            <Layout>
                <h1 style = {{textAlign:"center"}}>{post.photoBlogJson.name}</h1>
            {post.photoBlogJson.images.map(image => (
                <GatsbyImage image = {image.childImageSharp.gatsbyImageData}/>
            ))}
            </Layout>
        </>
    )
}

export const query = graphql`
    query($id: String!) {
        photoBlogJson(id: {eq: $id}) {
            name
            web_path
            id
            description
            date
            images {
              childImageSharp {
                gatsbyImageData
              }
            }
        }
    }
    
`

export default PhotoBlogPage
