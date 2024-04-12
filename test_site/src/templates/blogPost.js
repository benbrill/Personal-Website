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

    return (
        <MDXProvider components = {shortcodes}> 
        
        <Layout>
            <Breadcrumb style = {{marginLeft: "0px"}}>
                <Breadcrumb.Item style = {{marginLeft: "0px"}} href="/data">Data</Breadcrumb.Item>
                <Breadcrumb.Item active>{mdx.frontmatter.name}</Breadcrumb.Item>
            </Breadcrumb>
            <GatsbyImage image={mdx.frontmatter.featuredImage.childImageSharp.gatsbyImageData} alt = ""/>
            <h1 style = {{fontWeight: 600}}>{mdx.frontmatter.name}</h1>
            <div style = {{paddingBottom: "20px"}}>
                <em>{mdx.frontmatter.description}</em>
            </div>
            
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
        description
        featuredImage {
            childImageSharp {
              id
              gatsbyImageData
            }
          }
      }
    }
  }
`

export default blogPost
