import React from 'react'
import Layout from '../components/layout'
import { Breadcrumb } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'
import { graphql } from 'gatsby'
import { MDXProvider } from "@mdx-js/react"
import { MDXRenderer } from "gatsby-plugin-mdx"
import {Link} from "gatsby"


const shortcodes = { Link }

const blogPost = ({data : { mdx }}) => {
    console.log(mdx)
    return (
        <MDXProvider components = {shortcodes}> 
        
        <Layout>
            <Breadcrumb style = {{marginLeft: "0px"}}>
                <Breadcrumb.Item href="/data">Data</Breadcrumb.Item>
                <Breadcrumb.Item active>{mdx.frontmatter.name}</Breadcrumb.Item>
            </Breadcrumb>
            <GatsbyImage image={mdx.frontmatter.featuredImage.childImageSharp.gatsbyImageData} alt = ""/>
            <h2>{mdx.frontmatter.name}</h2>
            <MDXRenderer frontmatter={mdx.frontmatter}>{mdx.body}</MDXRenderer>
        </Layout>
        </MDXProvider>
    )
}

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
      body
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
