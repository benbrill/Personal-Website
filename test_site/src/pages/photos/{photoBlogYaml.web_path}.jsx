import React from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout'
import Menu from '../../components/navbar'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
// import Lightbox from "yet-another-react-lightbox";
// import "yet-another-react-lightbox/styles.css";
// import SimpleReactLightbox, { SRLWrapper } from "simple-react-lightbox";

const PhotoBlogPage = ({ data }) => {
    const post  = data
    console.log(data)
    return (
        <>
            <Menu />
                <h1 style = {{textAlign:"center", fontWeight:600, paddingTop: "30px"}}>{post.photoBlogYaml.name}</h1>
                <p style = {{textAlign: "center", marginBottom: "5px"}}>{post.photoBlogYaml.description}</p>
                <p style = {{textAlign: "center"}}><em>{post.photoBlogYaml.date}</em></p>
                <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}>
                <Masonry gutter = "10px">
                    {post.photoBlogYaml.images.map(image => (
                        <a href={image.publicURL}>
                        <GatsbyImage image = {image.childImageSharp.gatsbyImageData} placeholder = "blurred"/>
                        {/* <Lightbox open={true} slides={[{ src: image.childImageSharp.gatsbyImageData }]}/> */}
                        </a>
                    ))}
                </Masonry>
            </ResponsiveMasonry>
        </>
    )
}

export const query = graphql`
query($id: String!) {
    photoBlogYaml(id: {eq: $id}) {
        id
        name
        description
        date
        images {
            publicURL
            childImageSharp {
              gatsbyImageData
            }
          }
  }
}
`

export default PhotoBlogPage