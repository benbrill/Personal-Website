import React, { useState } from 'react'
import { LineChart, Line, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from 'recharts'
import AllTickets from '../../data/dodgers_tickets.json'
import Button from 'react-bootstrap/Button'

AllTickets = AllTickets.filter(ticket => ticket.days_to_game <= 50)

const SummaryGraph = () => {
    const teams = ["all", "Los Angeles Dodgers", "San Francisco Giants", "Los Angeles Angels"]
    const [team, setteam] = useState(teams[0])
    console.log(team)
    var DodgersTickets = AllTickets.filter(ticket => ticket.team === team)
    return (
        <div>
            {teams.map(team => <Button key={team} onClick={() => setteam(team)}>{team}</Button>)}
            <ResponsiveContainer width="100%" height={250} margin={{left: 20, bottom: 20}}>
            <LineChart data={DodgersTickets}>
                <Line type="monotone" dataKey="diff_initial" stroke="#1E90FF" />
                <XAxis dataKey="days_to_game" reversed={true} label = {{value: "Days to Game", dy: 15}} type = "number" interval={5} domain={[0, 50]}/>
                <YAxis dataKey = "diff_initial" label = {{value : "Difference from initial listed Price", angle : -90, dx: 10}} tickCount = {3} type = "number"/>
                {/* <ReferenceLine y="0" stroke="green" label="Min PAGE" /> */}
                <CartesianGrid strokeDasharray="3 3"/>
                <Tooltip label="Days to Game"/>
            </LineChart>
            </ResponsiveContainer>
        </div>
    )
}

export default SummaryGraph
