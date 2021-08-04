import React from 'react'
import Layout from '../components/layout'
import { StaticImage } from 'gatsby-plugin-image';
import BlogEntry from '../components/BlogEntry';
import Container from 'react-bootstrap/Container'
// import { useMediaQuery } from 'react-responsive';
import { Media } from '../Media';
import { graphql } from "gatsby"
import Seo from '../components/seo'

const Data = ({data}) => {
    return (
        <>
        <Seo title = "Data" lang = "en" description = "A collection of my various data and development related projects"></Seo>
        <Layout>
            <Container>
              <Media greaterThan="sm">
                <div style={{display: "flex", 
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                            flexDirection: "row"}}>
                <StaticImage src = "../../static/images/Data_Data.svg" />
                    <div style={{width: "45%"}}>
                        <h1 style={{fontSize: "4rem"}}>Data</h1>
                        <p>Here is a collection of some of my projects involving data science and development</p>
                    </div>
                </div>
                </Media>
              <Media lessThan="sm">
                <div style={{display: "flex", 
                            justifyContent: "center",
                            alignContent: "center",
                            alignItems: "center",
                            flexDirection: "column"}}>
                <StaticImage src = "../../static/images/Data_Data.svg" />
                    <div style={{width: "70%"}}>
                        <h1 style={{fontSize: "4rem"}}>Data</h1>
                        <p>Here is a collection of some of my projects involving data science and development</p>
                    </div>
                </div>
                </Media>
            </Container>
            <Container>
                {data.allMarkdownRemark.edges.map(post => (
                    // console.log(post.node.frontmatter.featuredImage.childImageSharp.fluid),
                    // <GatsbyImage image= {post.node.frontmatter.featuredImage.childImageSharp.gatsbyImageData} />
                    <BlogEntry post= {post} />
                )
                )}
            </Container>
            
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
            path
          }
        }
      }
    }
  } 
`
export default Data
