import React from 'react'
// import Layout from '../components/layout_home'
import { Row, Col, CardGroup } from 'react-bootstrap'
import Menu from '../components/navbar'
import PhotoHero from '../components/PhotoHero'
import PhotoBlogCard from '../components/PhotoBlogCard'
import Seo from '../components/seo'
import { graphql } from 'gatsby'


const photos = ({data}) => {

  var count = 0;
    return (
        <div style={{background: "#080A0C"}}>
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
                {data.allPhotoBlogYaml.nodes.map(node => {
                  count++
                return(
                    <Col id = "photoCol">
                    <PhotoBlogCard props = {node} count = {String(count).padStart(2,'0')}/>
                    </Col>
                )})}
            </Row>
            </CardGroup>   
            </div>         
        </div>
    )
}


export const query = graphql`
query MyQuery {
    allPhotoBlogYaml(sort: { date: DESC }) {
      nodes {
        featuredImage {
          childImageSharp {
            gatsbyImageData
          }
          birthTime(formatString: "YYYY-DD-MM")
          name
        }
        name
        web_path
        description
        date(formatString: "YYYY-MM-DD")
      }
    }
  }
`

export default photos
