import React from 'react'
import Layout from '../components/layout'
import { Breadcrumb } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'
import { graphql } from 'gatsby'

const blogPost = ({data}) => {
    const post = data.markdownRemark
    // console.log(post.frontmatter.featuredImage.childImageSharp.gatsbyImageData)
    return (
        <Layout>
            <Breadcrumb style = {{marginLeft: "0px"}}>
                <Breadcrumb.Item href="/data">Data</Breadcrumb.Item>
                <Breadcrumb.Item active>{post.frontmatter.name}</Breadcrumb.Item>
            </Breadcrumb>
            <GatsbyImage image={post.frontmatter.featuredImage.childImageSharp.gatsbyImageData} alt = ""/>
            <h2>{post.frontmatter.name}</h2>
            <div dangerouslySetInnerHTML={{__html: post.html}} />
        </Layout>
    )
}

export const blogPostQuery = graphql`
    query blogPostByPath($path: String!) {
        markdownRemark(frontmatter: { path: { eq: $path } }) {
            html
            frontmatter {
                name
                featuredImage {
                    childImageSharp {
                      fluid(maxWidth: 800) {
                        ...GatsbyImageSharpFluid
                      }
                      id
                      gatsbyImageData
                    }
                  }
            }
    }
}
`

export default blogPost
