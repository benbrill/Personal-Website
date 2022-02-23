import React, { useState } from 'react'
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell, Legend, ScatterChart, Scatter} from 'recharts'
import AllTickets from '../../data/dodgers_tickets.json'
import { ToggleButtonGroup, ToggleButton }  from 'react-bootstrap'


const SupplyDemandZScores = () => {
    var data = AllTickets.supply_demand_z_scores


    const teamStyles = {
        "Los Angeles Dodgers": {
            color: "#005A9C",
            textColor: "#ffffff"
        },
        "San Francisco Giants": {
            color: "#FD5A1E",
            textColor: "#27251F"
        },
        "Los Angeles Angels": {
            color: "#BA0021",
            textColor: "#ffffff"
        },
        "Arizona Diamondbacks": {
            color: "#A71930",
            textColor: "#E3D4AD"
        },
        "Milwaukee Brewers": {
            color: "#12284B",
            textColor: "#FFC52F"
        },
        "St. Louis Cardinals": {
            color: "#C41E3A",
            textColor: "#ffffff"
        },
        "Colorado Rockies": {
            color: "#33006F",
            textColor: "#ffffff"
        },
        "Baltimore Orioles": {
            color: "#DF4601",
            textColor: "#ffffff"
        },
        "New York Mets": {
            color: "#003087",
            textColor: "#ffffff"
        },
        "Seattle Mariners": {
            color: "#0C2340",
            textColor: "#ffffff"
        },
        "Detroit Tigers": {
            color: "#0C2C56",
            textColor: "#ffffff"
        },
        "Texas Rangers": {
            color: "#002B5C",
            textColor: "#ffffff"
        },
        "Atlanta Braves": {
            color: "#CE1141",
            textColor: "#ffffff"
        },
        "Toronto Blue Jays": {
            color: "#003DA5",
            textColor: "#ffffff"
        },
        "Oakland Athletics": {
            color: "#003831",
            textColor: "#ffffff"
        },
        "Chicago Cubs": {
            color: "#0C2C56",
            textColor: "#ffffff"
        },
        "Pittsburgh Pirates": {
            color: "#FFC72C",
            textColor: "#27251F"
        },
        "Boston Red Sox": {
            color: "#C8102E",
            textColor: "#ffffff"
        },
        "Washington Nationals": {
            color: "#002B5C",
            textColor: "#ffffff"
        },
        "Philadelphia Phillies": {
            color: "#E31837",
            textColor: "#ffffff"
        },
        "San Diego Padres": {
            color: "#2F241D",
            textColor: "#ffffff"
        },
        "Houston Astros": {
            color: "#EB6E1F",
            textColor: "#ffffff"
        },
        "New York Yankees": {
            color: "#0C2340",
            textColor: "#ffffff"
        },
    }

    return (
        <div>
            <h4>Ticket stock by team at gametime</h4>
            <ResponsiveContainer width="100%" height={350} margin={{left: 20, bottom: 20}}>
            <BarChart data={data}>
                <Bar dataKey="last_remaining_tickets" name = "Remaining Tickets z-score">
                    {data.map((entry, index) => <Cell key={index} fill={teamStyles[entry.awayTeam].color} />)}
                    {/* {data.map((entry, index) => {console.log(entry, index)})} */}
                </Bar>
                <XAxis dataKey="awayTeam" label = {{value: "Teams", dy: 15, fontFamily: 'halyard-display, sans-serif'}} height = {50} fontFamily = {'halyard-display, sans-serif'} ticks = {[0]}/>
                <YAxis dataKey = "z-score" label = {{value : "Z-score", angle : -90, dx: -20, fontFamily: 'halyard-display, sans-serif'}} width = {60}/>
                {/* <ReferenceLine y="0" stroke="green" label="Min PAGE" /> */}
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip label="Days to Game"/>
            </BarChart>
            </ResponsiveContainer>
            <h4>Supply vs Demand?</h4>
            <ResponsiveContainer width="100%" height={350} margin={{left: 20, bottom: 20}}>
            <ScatterChart data={data}>
                <Legend></Legend>
                <Scatter dataKey="awayTeam">
                {data.map((entry, index) => <Cell key={index} fill={teamStyles[entry.awayTeam].color} />)}
                    {/* {data.map((entry, index) => {console.log(entry, index)})} */}
                </Scatter>
                <XAxis dataKey="last_remaining_tickets" label = {{value: "Remaining Tickets at gametime z-score", dy: 15, fontFamily: 'halyard-display, sans-serif'}} height = {50} fontFamily = {'halyard-display, sans-serif'} ticks = {[-1, 0, 1, 2]}/>
                <YAxis dataKey = "z-score" label = {{value : "Ticket price at gametime z-score", angle : -90, dx: -20, fontFamily: 'halyard-display, sans-serif'}} width = {60} tickCount = {8}/>
                {/* <ReferenceLine y="0" stroke="green" label="Min PAGE" /> */}
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip label="Days to Game"/>
            </ScatterChart>
            </ResponsiveContainer>
        </div>
    )
}

export default SupplyDemandZScores
