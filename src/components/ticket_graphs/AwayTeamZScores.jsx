import React, { useState } from 'react'
import { BarChart, Bar, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Cell } from 'recharts'
import AllTickets from '../../data/dodgers_tickets.json'
import { ToggleButtonGroup, ToggleButton }  from 'react-bootstrap'


const AwayTeamZScores = () => {
    var OrigData = AllTickets.away_z_scores


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
    const teams = ["All Tracked Prices", "Gametime Prices"]
    const [team, setteam] = useState(teams[0])
    const handleChange = (val) => setteam(val);
    if (team === "All Tracked Prices") {
        var data = OrigData.normal
    }
    else if (team === "Gametime Prices") {
        var data = OrigData.gametime
        console.log({data})
    }

    return (
        <div>
            <h4>Normalized Ticket Prices by Visiting Team</h4>
            <ToggleButtonGroup type = "radio" name = "teams" value = {team} onChange = {handleChange}>
                <ToggleButton key = "All Tracked Prices" onClick={() => setteam("All Tracked Prices")}> All Tracked Prices </ToggleButton>
                <ToggleButton key = {teams[1]} onClick={() => setteam(teams[1])}> Gametime Prices </ToggleButton>
            </ToggleButtonGroup>
            <ResponsiveContainer width="100%" height={350} margin={{left: 20, bottom: 20}}>
            <BarChart data={data}>
                <Bar dataKey="z-score" >
                    {data.map((entry, index) => <Cell key={index} fill={teamStyles[entry.awayTeam].color} />)}
                    {/* {data.map((entry, index) => {console.log(entry, index)})} */}
                </Bar>
                <XAxis dataKey="awayTeam" label = {{value: "Teams", dy: 15, fontFamily: 'halyard-display, sans-serif'}} height = {50} fontFamily = {'halyard-display, sans-serif'} ticks = {[0]}/>
                <YAxis dataKey = "z-score" label = {{value : "Z-score", angle : -90, dx: -20, fontFamily: 'halyard-display, sans-serif'}} width = {60}/>
                {/* <ReferenceBar y="0" stroke="green" label="Min PAGE" /> */}
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip label="Days to Game"/>
            </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default AwayTeamZScores
