import React from 'react'
import Layout from '../components/layout'
import { StaticImage } from 'gatsby-plugin-image';

const Data = () => {
    return (
        <>
        <Layout>
            <div style = {{display: "flex"}}>
                <StaticImage src = "../../static/images/Data_Data.svg" />
                <div>
                    <h1>Data</h1>
                    <p>Here is a collection of some of my projects involving data science and development</p>
                </div>
            </div>
            
        </Layout>
            
        </>
    )
}

export default Data
