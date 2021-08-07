import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { graphql, StaticQuery } from 'gatsby'
import { Carousel, Container } from 'react-bootstrap'

const PhotoHero = () => {
    return (
        <>
            <StaticQuery
            query= {graphql`
            query photoHomeQuery {
                allImagesJson {
                  nodes {
                    img {
                      childImageSharp {
                        gatsbyImageData(layout: FULL_WIDTH, aspectRatio: 2.5)
                      }
                    }
                    description
                    name
                  }
                }
              }
              
            `}
            render={data => (
                <Carousel fade="true" controls="false" indicators="false">
                    {data.allImagesJson.nodes.map(image => (<Carousel.Item><GatsbyImage image={image.img.childImageSharp.gatsbyImageData} alt="" placeholder = "blurred"/></Carousel.Item>))}
                </Carousel>
            )}/>
            <Container className = "photoIntroContainer" fluid="true">
                <div className="photoIntro">
                    <div>
                        <h1>photos</h1>
                        <span></span>
                    </div>

                </div>
            </Container>
        </>
    )
}

export default PhotoHero
