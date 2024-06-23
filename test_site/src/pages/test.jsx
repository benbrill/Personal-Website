import React from 'react';
import { motion, useInView } from 'framer-motion';
import { graphql, StaticQuery } from 'gatsby'
import { GatsbyImage } from 'gatsby-plugin-image';
import { useState } from 'react';
import PhotoSlide from '../components/PhotoSlide';

const VintageSlideshow = ({ slides }) => {

  const [current, setCurrent] = useState(0);

  useState(() => {
    const interval = setInterval(() => {
      setCurrent((prevState) => prevState === 5 - 1 ? 0 : prevState + 1);
    }, 6000);

    return () => clearInterval(interval);
  }, [current]);



  
  return (

    <div className = "hero-landing">
    <div className='title'>
      Photos
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
    
    </div>
  );
};

export default VintageSlideshow;
