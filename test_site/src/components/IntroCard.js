import React from 'react'
import { Card } from 'react-bootstrap'
import '../static/card.scss'
// import { StaticImage } from 'gatsby-plugin-image'


const styles = {
    h2: {
        fontFamily: "halyard-display, sans-serif",
        fontStyle: "normal",
        fontWeight: 600,
        fontSize: "2rem",
        textAlign: "center"
    },
    p: {
        fontFamily: "halyard-display, sans-serif",
        fontStyle: "normal",
        fontWeight: 300,
        textAlign: "center"
    }
}
const IntroCard = ({ header, url, body}) => {
    console.log(url)
    return (
        <Card id = "introCard">
            <Card.Header id = "introCardHeader"> <h2 style = {styles.h2}>{header}</h2> </Card.Header>
            <Card.Img id = "introCardImg" src={url}  />
            <Card.Body style = {styles.p}> {body} </Card.Body>
        </Card>
    )
}

export default IntroCard
