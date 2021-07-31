import React from 'react'
import Layout from '../components/layout'
import { StaticImage, GatsbyImage, getImage } from 'gatsby-plugin-image';
import BlogEntry from '../components/BlogEntry';
import Container from 'react-bootstrap/Container'
import { useMediaQuery } from 'react-responsive';
import { graphql } from "gatsby"

const Data = ({data}) => {
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    return (
        <>
        <Layout>
            <Container>
                <div style={{display: "flex", 
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                            flexDirection: isTabletOrMobile ? "column" : "row"}}>
                <StaticImage src = "../../static/images/Data_Data.svg" />
                    <div style={{width: isTabletOrMobile ? "70%" : "45%"}}>
                        <h1 style={{fontSize: "4rem"}}>Data</h1>
                        <p>Here is a collection of some of my projects involving data science and development</p>
                    </div>
                </div>
            </Container>
            <div>
                {data.allMarkdownRemark.edges.map(post => (
                    // console.log(post.node.frontmatter.featuredImage.childImageSharp.fluid),
                    // <GatsbyImage image= {post.node.frontmatter.featuredImage.childImageSharp.gatsbyImageData} />
                    <BlogEntry id = {post.node.id} name = {post.node.frontmatter.name} header = {post.node.frontmatter.featuredImage.childImageSharp.gatsbyImageData} description = {post.node.frontmatter.description}/>
                )
                )}
            </div>
            
        </Layout>
            
        </>
    )
}
export const pageQuery = graphql`
query dataPostQuery {
    allMarkdownRemark {
      edges {
        node {
          frontmatter {
            featuredImage {
              childImageSharp {
                fluid(maxWidth: 800) {
                  ...GatsbyImageSharpFluid
                }
                id
                gatsbyImageData
              }
            }
            description
            title
            tags
            name
          }
        }
      }
    }
  } 
`
export default Data
