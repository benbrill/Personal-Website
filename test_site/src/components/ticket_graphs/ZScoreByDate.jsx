import React from 'react';
import CalendarHeatmap from 'reactjs-calendar-heatmap'
import AllTickets from '../../data/dodgers_tickets.json'

const data = AllTickets['date_z-score']
console.log(data)
const ZScoreByDate = () => {
  return <div>
      <CalendarHeatmap data = {data} overview = "year"/>

  </div>;
};

export default ZScoreByDate;
