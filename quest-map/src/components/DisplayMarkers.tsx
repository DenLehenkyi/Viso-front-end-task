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
      {markers.map((marker, index) => (
        <div key={index} className="marker">
          Маркер: {String(marker.getLabel())}
          <DeleteMarker onDelete={() => deletemarker(marker)} />
        </div>
      ))}
      <button onClick={clearAllMarkers}>Очистити всі маркери</button>
    </div>
  );
}
