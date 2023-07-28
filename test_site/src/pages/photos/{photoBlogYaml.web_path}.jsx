import React from 'react'
import { graphql } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image'
import Layout from '../../components/layout'
import Menu from '../../components/navbar'
import Masonry, {ResponsiveMasonry} from "react-responsive-masonry"
import Seo from '../../components/seo'
import Lightbox from '../../components/Lightbox'

const PhotoBlogPage = ({ data }) => {
    const post  = data
    return (
        <>
        <Seo title = {`${post.photoBlogYaml.name}: Photos`} description = {post.photoBlogYaml.description}/>
            <Menu />
                <h1 style = {{textAlign:"center", fontWeight:600, paddingTop: "30px"}}>{post.photoBlogYaml.name}</h1>
                <p style = {{textAlign: "center", marginBottom: "5px"}}>{post.photoBlogYaml.description}</p>
                <p style = {{textAlign: "center"}}><em>{post.photoBlogYaml.date}</em></p>
                <ResponsiveMasonry columnsCountBreakPoints={{350: 1, 750: 2, 900: 3}}>
                <Masonry gutter = "10px">
                    {post.photoBlogYaml.images.map(image => (

                            <Lightbox imageData = {image.childImageSharp.gatsbyImageData}/>

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
        date(formatString: "MMMM DD, YYYY")
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