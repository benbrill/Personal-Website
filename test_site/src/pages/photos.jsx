import React from 'react'
// import Layout from '../components/layout_home'
import { CardGroup } from 'react-bootstrap'
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
                {data.allPhotoBlogJson.nodes.map(node => (
                    <PhotoBlogCard props = {node}/>
                ))}
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
      }
    }
  }
`

export default photos
