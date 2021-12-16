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
    return (
        <div key={ post.id }>
            <Container>
                <Row style = {{flexDirection: isTabletOrMobile ? "column" : "row", paddingBottom: "20px"}}>
                    <Col>
                        <Link to={`/data/${post.frontmatter.url}`}><GatsbyImage image={post.frontmatter.featuredImage.childImageSharp.gatsbyImageData} placeholder = "blurred" alt=""/></Link>
                    </Col>
                    <Col>
                        {post.frontmatter.tags.map(tag => (<Badge pill bg = "primary">{tag}</Badge>))}
                        <Link to={`/data/${post.frontmatter.url}`}><h3>{post.frontmatter.name}</h3></Link>
                        <p>{post.frontmatter.description} <Link to={`/data/${post.frontmatter.url}`} style ={{color:'blue'}}><em>Read More</em></Link></p>
                    </Col>
                
                </Row>
            </Container>
        </div>
    )
}

export default BlogEntry
