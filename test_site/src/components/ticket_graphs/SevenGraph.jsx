import React, { useState } from 'react'
import { LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import AllTickets from '../../data/dodgers_tickets.json'
import { ToggleButtonGroup, ToggleButton }  from 'react-bootstrap'


const InitialFinalGraph = () => {
    var OrigData = AllTickets.seven_days

    const teams = ["all", "Los Angeles Dodgers", "San Francisco Giants", "Los Angeles Angels"]
    const [team, setteam] = useState(teams[0])
    const handleChange = (val) => setteam(val);


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
        "all": {
            color: "#000000",
            textColor: "#FFFFFF"
        }
    }

    var data = OrigData.filter(ticket => ticket.homeTeam === team)
    return (
        <div>
            <h4>Percent change in price from 7 days prior to gametime</h4>
            <ToggleButtonGroup type = "radio" name = "teams" value = {team} onChange = {handleChange}>
            {teams.map(cteam => <ToggleButton key={cteam} onClick={() => setteam(cteam)} style={{backgroundColor: teamStyles[cteam].color, color: teamStyles[cteam].textColor, borderColor: "#000000"}}>{cteam}</ToggleButton>)}
            </ToggleButtonGroup>
            <ResponsiveContainer width="100%" height={350} margin={{left: 20, bottom: 20}}>
            <LineChart data={data}>
                <Line type="monotone" dataKey="diff_7" stroke={teamStyles[team].color} name = "% difference"/>
                <XAxis dataKey="days_to_game" reversed={true} label = {{value: "Days to Game", dy: 15, fontFamily: 'halyard-display, sans-serif'}} type = "number" tickCount={8} domain={[0, 7]} height = {50} fontFamily = {'halyard-display, sans-serif'} />
                <YAxis dataKey = "diff_7" label = {{value : "Difference from price 7 days before game", angle : -90, dx: -20, fontFamily: 'halyard-display, sans-serif'}} width = {60} tickCount = {3} type = "number" fontSize = {15} fontFamily = {'halyard-display, sans-serif'} ticks = {[-50, 0, 50]}/>
                {/* <ReferenceLine y="0" stroke="green" label="Min PAGE" /> */}
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip label="Days to Game"/>
            </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default InitialFinalGraph
