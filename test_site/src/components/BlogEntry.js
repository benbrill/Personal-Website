import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Container } from 'react-bootstrap'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import { useMediaQuery } from 'react-responsive'

const BlogEntry = ({ id, name, header, description }) => {
    const isTabletOrMobile = useMediaQuery({ query: '(max-width: 1224px)' })
    return (
        <div key={ id }>
            <Container>
                <Row style = {{flexDirection: isTabletOrMobile ? "column" : "row"}}>
                    <Col>
                        <GatsbyImage image={header} alt=""/>
                    </Col>
                    <Col>
                        <h3>{name}</h3>
                        <p>{description}</p>
                    </Col>
                
                </Row>
            </Container>
        </div>
    )
}

export default BlogEntry
