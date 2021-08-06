import React from 'react'
// import Layout from '../components/layout_home'
import { Row, Col, CardGroup } from 'react-bootstrap'
import Menu from '../components/navbar'
import PhotoHero from '../components/PhotoHero'
import PhotoBlogCard from '../components/PhotoBlogCard'
import { graphql } from 'gatsby'


const photos = ({data}) => {
    return (
        <div>
            <Menu />
            <PhotoHero />
            <CardGroup>
            <Row xs={1} md={3}>
                {data.allPhotoBlogJson.nodes.map(node => (
                    <Col id = "photoCol">
                    <PhotoBlogCard props = {node}/>
                    </Col>
                ))}
            </Row>
            </CardGroup>
            

            
        </div>
    )
}


export const query = graphql`
query MyQuery {
    allPhotoBlogJson {
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
