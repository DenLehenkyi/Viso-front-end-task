import React from "react";
import DeleteMarker from "./DeleteMarkerButton";

export default function DisplayMarkers({
  markers,
  setMarkers,
  markerCluster,
  deletemarker,
  clearAllMarkers,
}: {
  markers: google.maps.Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>;
  markerCluster?: any;
  deletemarker?: any;
  clearAllMarkers?: () => void;
}) {
  return (
    <div className="showMarkers">
      <h3 className="header">Список Маркерів</h3>
      <div className="markerList">
        {markers.map((marker, index) => (
          <div key={index} className="markerItem">
            <span className="markerLabel">
              Маркер {index + 1}: {String(marker.getLabel())}
            </span>
            <DeleteMarker onDelete={() => deletemarker(marker)} />
          </div>
        ))}
      </div>
      <button className="clearButton" onClick={clearAllMarkers}>
        Очистити всі маркери
      </button>
    </div>
  );
}
