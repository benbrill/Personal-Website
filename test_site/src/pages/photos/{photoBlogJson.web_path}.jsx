import React from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout'

const PhotoBlogPage = ({ data }) => {
    const post  = data
    return (
        <>
            <Layout>
                <h1 style = {{textAlign:"center", fontWeight:600, paddingTop: "30px"}}>{post.photoBlogJson.name}</h1>
                <p style = {{textAlign: "center", marginBottom: "5px"}}>{post.photoBlogJson.description}</p>
                <p style = {{textAlign: "center"}}><em>{post.photoBlogJson.date}</em></p>
            {post.photoBlogJson.images.map(image => (
                <GatsbyImage image = {image.childImageSharp.gatsbyImageData} placeholder = "blurred"/>
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
