import React from 'react'
// import Layout from '../components/layout_home'
import { Row, Col, CardGroup } from 'react-bootstrap'
import Menu from '../components/navbar'
import PhotoHero from '../components/PhotoHero'
import PhotoBlogCard from '../components/PhotoBlogCard'
import Seo from '../components/seo'
import { graphql } from 'gatsby'


const photos = ({data}) => {
    return (
        <>
            <Seo title="Photos" description="A collection of my photography" />
            <Menu />
            <PhotoHero />
            <div style={{
              margin: `0 auto`,
              maxWidth: 1580,
              padding: `0 2.5875rem 2.45rem`,
            }}
          >
            <CardGroup>
            <Row xs={1} md={3}>
                {data.allPhotoBlogYaml.nodes.map(node => (
                    <Col id = "photoCol">
                    <PhotoBlogCard props = {node}/>
                    </Col>
                ))}
            </Row>
            </CardGroup>   
            </div>         
        </>
    )
}


export const query = graphql`
query MyQuery {
    allPhotoBlogYaml {
      nodes {
        featuredImage {
          childImageSharp {
            gatsbyImageData
          }
        }
        name
        web_path
        description
        date
      }
    }
  }
`

export default photos
