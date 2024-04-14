import React from 'react'
import Layout from '../components/layout'
import Lightbox from '../components/Lightbox'
import { graphql } from 'gatsby';
import { FlapDisplay } from '../components/flaps/FlapDisplay';

// export const query = graphql`
//   query {
//     file(relativePath: { eq: "photo_posts/Amsterdam/_Amsterdam-01612.jpg" }) {
//       childImageSharp {
//         gatsbyImageData
//       }
//     }
//   }
// `;

const test = ({ data }) => {
    console.log(data)
  return (
    <Layout>
         {/* <Lightbox imageData={data.file.childImageSharp.gatsbyImageData}/> */}
         <FlapDisplay chars={' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ'}
      length={13}
      value={'Hello, World!'}/>
    </Layout>
  )
}

export default test