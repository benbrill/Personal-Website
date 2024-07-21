import React from 'react'
import { useState, useEffect } from 'react'
import { Container, Row, Col } from 'react-bootstrap';
import { GatsbyImage } from 'gatsby-plugin-image';
import Lightbox from '../components/Lightbox'

const PhotoGallery = ({post}) => {

    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        // Function to check screen size
        const checkScreenSize = () => {
          if (typeof window !== 'undefined') {
            setIsMobile(window.innerWidth <= 768);
          }
        };
    
        // Initial check
        checkScreenSize();
    
        // Add event listener for window resize
        window.addEventListener('resize', checkScreenSize);
    
        // Clean up the event listener
        return () => window.removeEventListener('resize', checkScreenSize);
      }, []);

    const sorted_images = post.photoBlogYaml.images.map(image => {
        const width = image.childImageSharp.gatsbyImageData.width;
        const height = image.childImageSharp.gatsbyImageData.height;
        const aspectRatio = width / height;
        return { ...image, aspectRatio };
      })
    
    const verticalPhotos = sorted_images.filter(image => image.aspectRatio <= 1);
    const horizontalPhotos = sorted_images.filter(image => image.aspectRatio > 1);

    const rows = [];
    let verticalIndex = 0;
    let horizontalIndex = 0;
    let verticalRowLength = 3;
    let horizontalRowLength = 2;

    while (verticalIndex < verticalPhotos.length || horizontalIndex < horizontalPhotos.length) {
        // Add a row of vertical photos
        const verticalRow = verticalPhotos.slice(verticalIndex, verticalIndex + verticalRowLength);
        if (verticalRow.length > 0) {
        rows.push({ type: 'vertical', photos: verticalRow });
        verticalIndex += verticalRowLength;
        }

        // Add a row of horizontal photos
        const horizontalRow = horizontalPhotos.slice(horizontalIndex, horizontalIndex + horizontalRowLength);
        if (horizontalRow.length > 0) {
        rows.push({ type: 'horizontal', photos: horizontalRow });
        horizontalIndex += horizontalRowLength;
        }
    }

  return (
    <Container>
                {rows.map((row, index) => {
                    return(
                        <Row key = {index}>
                            {row.photos.map((photo, index) => {
                                return(
                                    <Col key = {index} lg={row.type === "vertical" ? 4 : 6} xs={row.type === "vertical" ? 6 : 12}>
                                        <Lightbox imageData = {photo.childImageSharp.gatsbyImageData}/>
                                    </Col>
                                )
                            })}
                        </Row>
                )})}
    </Container>
  )
}

export default PhotoGallery