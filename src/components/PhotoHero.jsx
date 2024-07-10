import React from 'react';
import { graphql, StaticQuery } from 'gatsby'
import { useState } from 'react';
import { Container } from 'react-bootstrap';
import PhotoSlide from '../components/PhotoSlide';

const VintageSlideshow = () => {

  const [current, setCurrent] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setCurrent((prevState) => prevState === 12 - 1 ? 0 : prevState + 1);
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
                query photoQuery {
                  allHomeImagesYaml {
                    nodes {
                      img {
                        childImageSharp {
                          gatsbyImageData(aspectRatio: 1.5, transformOptions: {cropFocus: CENTER})
                        }
                        name
                        birthTime(formatString: "YYYY-MM-DD HH:mm:ss")
                      }
                    }
                  }
                }
                  
                `}
                render={data => (
                <div className='carousel'>
                {data.allHomeImagesYaml.nodes.map((image, idx) =>  (
                    <PhotoSlide image={image.img.childImageSharp.gatsbyImageData} 
                    current = {current} idx={idx} 
                    name = {image.img.name}
                    date = {image.img.birthTime}/>
                ))}
                </div>
                )}/>
        </Container>
    </Container>
  );
};

export default VintageSlideshow;
