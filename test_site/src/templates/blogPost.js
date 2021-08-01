import React from 'react'
import Layout from '../components/layout'
import { Breadcrumb } from 'react-bootstrap'
import { graphql } from 'gatsby'

const blogPost = ({data}) => {
    const post = data.markdownRemark
    return (
        <Layout>
            <Breadcrumb>
                <Breadcrumb.Item href="/data">Data</Breadcrumb.Item>
                <Breadcrumb.Item active>Post</Breadcrumb.Item>
            </Breadcrumb>
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
            }
    }
}
`

export default blogPost
