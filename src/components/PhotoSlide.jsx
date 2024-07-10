import React from 'react'
import { GatsbyImage } from 'gatsby-plugin-image';
import { motion } from 'framer-motion'
import'../static/slideshow.scss'

const PhotoSlide = ({ image, current, idx, name, date }) => {

  const hiddenMask = [`polygon(0 0, 100% 0, 100% 100%, 0% 100%)`,
                        `polygon(0% 0%, 0% 0%, 0% 0%, 0% 100%)`]
  const visibleMask = [`polygon(0% 0%, 0% 0%, 0% 0%, 0% 100%)`,
                        `polygon(0 0, 100% 0, 100% 100%, 0% 100%)`
                    ];
  
console.log(name)
  return (
    <>


    <motion.div className='image-container'
    animate={{ 
        // clipPath: idx === current ? visibleMask : (idx === current - 1 || (current === 0 && idx === 5)) ? hiddenMask : `polygon(0% 0%, 0% 0%, 0% 0%, 0% 100%)`,
        clipPath: idx === current ?  visibleMask : hiddenMask,
        y: -100 * current + '%',
        x: idx === current ? 0 : -25 + '%',
        // opacity: idx === current ? 1 : 0,
        filter: idx === current ? 'blur(0)' : 'blur(5px)',
        // transform: idx === current ? 'rotate(0)' : 'rotate(-35deg)',
        rotate: idx === current ? '0' : 35*((idx<current) ? -1 : 1) + 'deg',
     }}
     transition={{ type: "spring", 
     clipPath: {duration: 0.5, delay: idx === current ? 0.5 : 0}, 
     y: {duration: 1, delay: idx === current ? 0 : -0.2},
     rotate: {duration: 1, delay: idx === current ? 0 : -0.2},
     x: {duration: 1, delay: idx === current ? 0 : -0.3},
     opacity: {delay: idx === current ? 0 : 1},
     filter: {delay: idx === current ? .5 : -.5}    
     }}>

        <div className='overlay'>
            <div className='border'>
            </div>

            <div className="photo-title">
                <span className="grid-title">Ben-Ohr Brill</span>
            </div>
            <div className='photo-label'>
                <span className='grid-title'>{name}</span>
                <span className='grid-title'>{date}</span>
            </div>
        </div>
        <GatsbyImage image={image} className='image' alt="" placeholder = "blurred"/>
    </motion.div>
    </>
  )     
}

export default PhotoSlide