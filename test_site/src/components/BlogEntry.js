import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby'
import { Container } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useMediaQuery } from 'react-responsive'
import { Badge } from 'react-bootstrap'

const BlogEntry = ({ post }) => {
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    console.log(post.node.frontmatter.path)
    return (
        <div key={ post.node.id }>
            <Container>
                <Row style = {{flexDirection: isTabletOrMobile ? "column" : "row", paddingBottom: "20px"}}>
                    <Col>
                        <Link to={post.node.frontmatter.path}><GatsbyImage image={post.node.frontmatter.featuredImage.childImageSharp.gatsbyImageData} placeholder = "blurred" alt=""/></Link>
                    </Col>
                    <Col>
                        {post.node.frontmatter.tags.map(tag => (<Badge pill bg = "primary">{tag}</Badge>))}
                        <Link to={post.node.frontmatter.path}><h3>{post.node.frontmatter.name}</h3></Link>
                        <p>{post.node.frontmatter.description} <Link to={post.node.frontmatter.path} style ={{color:'blue'}}><em>Read More</em></Link></p>
                    </Col>
                
                </Row>
            </Container>
        </div>
    )
}

export default BlogEntry
