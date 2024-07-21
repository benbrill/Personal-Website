import React from 'react'
// import { useState, useEffect } from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
// import Layout from '../../components/layout'
import Menu from '../../components/navbar'
// import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
// import { Container, Row, Col } from 'react-bootstrap'
import Seo from '../../components/seo'
import PhotoGallery from '../../components/PhotoGallery'
// import Lightbox from '../../components/Lightbox'

const PhotoBlogPage = ({ data }) => {
    const post  = data


    return (
        <>
        <Seo title = {`${post.photoBlogYaml.name}: Photos`} description = {post.photoBlogYaml.description}/>
            <Menu />
            <div style = {{display : "grid"}}>
                <GatsbyImage image = {post.photoBlogYaml.backgroundImage.childImageSharp.gatsbyImageData} alt = "" 
                style = {{gridArea: "1/1", width: "100%", height: "100vh", zIndex: -1, position: "fixed", opacity: "0.5", top: 0, left: 0}}
                layout = "fullWidth"/>
            <div style = {{gridArea: "1/1",
                position: "relative",
                placeItems: "center"}}>
                <h1 style = {{textAlign:"center", fontWeight:600, paddingTop: "30px"}}>{post.photoBlogYaml.name}</h1>
                <p style = {{textAlign: "center", marginBottom: "5px"}}>{post.photoBlogYaml.description}</p>
                <p style = {{textAlign: "center"}}>{post.photoBlogYaml.date}</p>
                <div style = {{padding: "0px 0em"}}>

                <PhotoGallery post = {post}/>
                {/* {post.photoBlogYaml.images.map(image => {
                    return(
                        <>
                        <Lightbox imageData = {image.childImageSharp.gatsbyImageData}/>
                        </>
                    )})} */}
                </div>
            </div>
            </div>
        </>
    )
}

export const query = graphql`
query($id: String!) {
    photoBlogYaml(id: {eq: $id}) {
        id
        name
        description
        backgroundImage {
            childImageSharp {
            gatsbyImageData
            }
            }
        date(formatString: "YYYY-MM-DD")
        images {
            publicURL
            childImageSharp {
            gatsbyImageData(formats: WEBP)
            }
          }
  }
}
`

export default PhotoBlogPage