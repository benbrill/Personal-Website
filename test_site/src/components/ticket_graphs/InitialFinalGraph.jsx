import React from 'react'
import {LineChart, Line, ResponsiveContainer, YAxis, XAxis, Tooltip} from 'recharts'

const InitialFinalGraph = () => {
    const data = [
        {name: "Dodgers", di: 41.09},
        {name: "Dodgers", di: 38.55},
        {name: "Giants", gi: 50.15},
        {name: "Giants", gi: 36.21},
        {name: "Angels", an: 25.50},
        {name: "Angels", an: 19.11}
    ]
    // const data = [
    //     {type: "initial", dodgers: 41.09, giants: 50.15, angels: 25.50},
    //     {type: "final", dodgers: 38.55, giants: 36.21, angels: 19.11}
    // ]
    return (
        <div>
            <ResponsiveContainer height = {300} width = '25%'>
                <LineChart data={data} >
                    <Line type = 'monotone' dataKey = 'di' stroke = '#8884d8' />
                    <Line type = 'monotone' dataKey = 'gi' stroke = '#8884d8' />
                    <Line type = 'monotone' dataKey = 'an' stroke = '#8884d8' />
                    <YAxis dataKey = 'name' domain={[0,60]}/>
                    <Tooltip />
                </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default InitialFinalGraph
