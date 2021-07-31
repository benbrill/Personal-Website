/**
 * Implement Gatsby's Node APIs in this file.
 *
 * See: https://www.gatsbyjs.com/docs/node-apis/
 */
 const path = require(`path`)
 const { createFilePath } = require(`gatsby-source-filesystem`)
 
 exports.onCreateNode = ({ node, getNode, actions }) => {
   const { createNodeField } = actions
   if (node.internal.type === `MarkdownRemark`) {
     const slug = createFilePath({ node, getNode, basePath: `pages` })
     createNodeField({
       node,
       name: `slug`,
       value: slug,
     })
   }
 }
 
 exports.createPages = async ({ graphql, actions }) => {
   const { createPage } = actions
   const result = await graphql(`
     query {
       allMarkdownRemark {
         edges {
           node {
             frontmatter {
               path
             }
           }
         }
       }
     }
   `)
 
   result.data.allMarkdownRemark.edges.forEach(({ node }) => {
     createPage({
       path: node.frontmatter.path,
       component: path.resolve(`./src/templates/blogPost.js`),
       context: {
         // Data passed to context is available
         // in page queries as GraphQL variables.
         slug: node.frontmatter.path,
       },
     })
   })
 }
const { createRemoteFileNode } = require("gatsby-source-filesystem")

exports.createSchemaCustomization = ({ actions }) => {
  const { createTypes } = actions

  createTypes(`
    type MarkdownRemark implements Node {
      frontmatter: Frontmatter
      featuredImg: File @link(from: "featuredImg___NODE")
    }

    type Frontmatter {
      title: String!
      featuredImgUrl: String
      featuredImgAlt: String
    }
  `)
}

// exports.onCreateNode = async ({
//   node,
//   actions: { createNode },
//   store,
//   cache,
//   createNodeId,
// }) => {
//   // For all MarkdownRemark nodes that have a featured image url, call createRemoteFileNode
//   if (
//     node.internal.type === "MarkdownRemark" &&
//     node.frontmatter.featuredImgUrl !== null
//   ) {
//     let fileNode = await createRemoteFileNode({
//       url: node.frontmatter.featuredImgUrl, // string that points to the URL of the image
//       parentNodeId: node.id, // id of the parent node of the fileNode you are going to create
//       createNode, // helper function in gatsby-node to generate the node
//       createNodeId, // helper function in gatsby-node to generate the node id
//       cache, // Gatsby's cache
//       store, // Gatsby's Redux store
//     })

//     // if the file was created, attach the new node to the parent node
//     if (fileNode) {
//       node.featuredImg___NODE = fileNode.id
//     }
//   }
// }