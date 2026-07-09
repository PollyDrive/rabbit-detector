import React from "react";
import { useFarm } from "../context/FarmContext";

export const EventLog: React.FC = () => {
  const { state } = useFarm();
  const { events } = state;

  return (
    <div className="event-log-panel" style={{ padding: "10px", maxHeight: "300px", overflowY: "auto" }}>
      <h3>Лог событий</h3>
      <table style={{ width: "100%", borderCollapse: "collapse", color: "white" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.2)" }}>
            <th style={{ textAlign: "left", padding: "5px" }}>ID</th>
            <th style={{ textAlign: "left", padding: "5px" }}>Локация</th>
            <th style={{ textAlign: "left", padding: "5px" }}>Тип события</th>
            <th style={{ textAlign: "left", padding: "5px" }}>Интенсивность</th>
            <th style={{ textAlign: "left", padding: "5px" }}>Время</th>
            <th style={{ textAlign: "left", padding: "5px" }}>Источник</th>
          </tr>
        </thead>
        <tbody>
          {events.map((event) => (
            <tr key={event.id} style={{ borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
              <td style={{ padding: "5px" }}>#{event.id}</td>
              <td style={{ padding: "5px" }}>{event.location}</td>
              <td style={{ padding: "5px" }}>{event.event_type}</td>
              <td style={{ padding: "5px" }}>{event.intensity}</td>
              <td style={{ padding: "5px" }}>{event.time}s</td>
              <td style={{ padding: "5px" }}>{event.source}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
