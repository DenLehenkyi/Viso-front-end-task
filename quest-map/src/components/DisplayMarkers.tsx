import React from "react";
import DeleteMarker from "./DeleteMarkerButton";

export default function DisplayMarkers({
  markers,
  setMarkers,
  markerCluster,
  deletemarker,
}: {
  markers: google.maps.Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>;
  markerCluster?: any;
  deletemarker?: any;
}) {
  return (
    <div className="showMarkers">
      {markers.map((marker, index) => (
        <div key={index} className="marker">
          Маркер: {String(marker.getLabel())}
          <DeleteMarker onDelete={() => deletemarker(marker)} />
        </div>
      ))}
    </div>
  );
}
