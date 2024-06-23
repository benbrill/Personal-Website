import React from 'react';
import { graphql, StaticQuery } from 'gatsby'
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import PhotoSlide from '../components/PhotoSlide';

const VintageSlideshow = () => {

  const [current, setCurrent] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setCurrent((prevState) => prevState === 5 - 1 ? 0 : prevState + 1);
    }, 7000);

    return () => clearInterval(interval);
  }, [current]);

  
  return (

    <Container className = "hero-landing">

      <Container className='whole-thing'>
        <div className='title'>
          <span className='kodak-text-tweaks title-glow grid-title'>Photos</span>
          <span className='grid-title kodak-text-tweaks'>Photos</span>
        </div>
        <StaticQuery
                query= {graphql`
                query photoTestQuery {
                    allImagesJson {
                      nodes {
                        img {
                          childImageSharp {
                            gatsbyImageData(aspectRatio : 1.5, transformOptions: {cropFocus: CENTER})
                          }
                        }
                        description
                        name
                      }
                    }
                  }
                  
                `}
                render={data => (
                <div className='carousel'>
                {data.allImagesJson.nodes.map((image, idx) =>  (
                    <PhotoSlide image={image.img.childImageSharp.gatsbyImageData} current = {current} idx={idx}/>
                ))}
                </div>
                )}/>
        </Container>
    </Container>
  );
};

export default VintageSlideshow;
