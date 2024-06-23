import React from 'react'
import { Card } from 'react-bootstrap'
import { GatsbyImage } from 'gatsby-plugin-image'
import { Link } from 'gatsby'
import'../static/card.scss'

const PhotoBlogCard = ({props, count}) => {
    return (

        
        <Card id = "photoCard" style = {{background:"#080A0C"}}>
            <Link to = {props.web_path}>
            <span class="film-wrapper">
                <span className="gi-num kodak-text-tweaks">{count}</span>
                    <span class="grid-title title-glow kodak-text-tweaks">
                        <span style={{fontWeight: "bold", marginRight: "4%"}}>{props.name}</span>
                    </span>
                    <span class="grid-title kodak-text-tweaks" style={{transform: "translate3d(0px, 0%, 0px) scale(1.05, 0.975)"}}>
                        <span style={{fontWeight: "bold", marginRight: "4%"}}>{props.name}</span>
                    </span>    
                 </span>
            </Link>
            <Link to = {props.web_path}><GatsbyImage image = {props.featuredImage.childImageSharp.gatsbyImageData}/></Link>
            {/* <Card.Text class="text" style={{color:"#EEEEEE"}}>{props.description}  </Card.Text>
            <Card.Text class="footer" style={{color: "#76ABAE"}}>{props.date}</Card.Text> */}
        </Card>
        
    )
}

export default PhotoBlogCard
