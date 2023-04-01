import React from 'react'
import Layout from '../components/layout'
import {Link} from "gatsby"
import { Breadcrumb } from 'react-bootstrap'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import { MDXProvider } from "@mdx-js/react"


const shortcodes = { Link }

export default function BlogPost({data, children}){

    return (
        <Layout>
            <Breadcrumb style = {{marginLeft: "0px"}}>
                <Breadcrumb.Item style = {{marginLeft: "0px"}} href="/data">Data</Breadcrumb.Item>
                <Breadcrumb.Item active>{data.mdx.frontmatter.name}</Breadcrumb.Item>
            </Breadcrumb>
            <GatsbyImage image={data.mdx.frontmatter.featuredImage.childImageSharp.gatsbyImageData} alt = ""/>
            <h1>{data.mdx.frontmatter.name}</h1>
            <div style = {{paddingBottom: "20px"}}>
                <em>{data.mdx.frontmatter.description}</em>
            </div>
            <MDXProvider components = {shortcodes}>
                {children}
            </MDXProvider>
        </Layout>
    )
}

export const pageQuery = graphql`
  query BlogPostQuery($id: String) {
    mdx(id: { eq: $id }) {
      id
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

