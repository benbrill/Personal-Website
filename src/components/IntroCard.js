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
        fontFamily: "halyard-text, sans-serif",
        fontStyle: "normal",
        fontWeight: 300,
        textAlign: "center",
        lineHeight: 1.2,
    }
}
const IntroCard = ({ pos, header, url, body}) => {
    return (
        <Card id = "introCard">
            <Card.Body>
                <Card.Subtitle className = "introSub">{pos}</Card.Subtitle>
                <Card.Title id = "introCardHeader"> <h2 style = {styles.h2}>{header}</h2> </Card.Title>
                <Card.Img id = "introCardImg" src={url}  />
                <Card.Text style = {styles.p}> {body} </Card.Text>
            </Card.Body>
        </Card>
    )
}

export default IntroCard
