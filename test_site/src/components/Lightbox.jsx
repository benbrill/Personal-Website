import React, { useState } from 'react';
import Modal from 'react-bootstrap/Modal';
import { GatsbyImage, getImage } from "gatsby-plugin-image";
import '../App.scss'; // import the CSS file

const ImageLightbox = ({ imageData }) => {
    const [show, setShow] = useState(false);

    const handleShow = () => {
        setShow(true);
        document.body.style.overflow = 'hidden'; // This will hide the scrollbar
    }

    const handleClose = () => {
        setShow(false);
        document.body.style.overflow = 'auto'; // This will show the scrollbar
    }

    const image = getImage(imageData);

    return (
        <>
            <div onClick={handleShow} style={{cursor: 'pointer'}}>
                <GatsbyImage image={image} alt="Thumbnail image" />
            </div>

            <Modal show={show} onHide={handleClose} dialogClassName="custom-modal" centered size="xl">
                <span className="close-btn" onClick={handleClose}>&times;</span>
                <Modal.Body>
                    <GatsbyImage image={image} alt="Modal content" style={{ width: '100%' }} placeholder = "blurred"/>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default ImageLightbox;
