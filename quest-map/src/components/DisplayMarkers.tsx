import React, { useEffect } from "react";
import DeleteMarker from "./DeleteMarkerButton";

export default function DisplayMarkers({
  markers,
  setMarkers,
  markerCluster,
  clearAllMarkers,
  deleteMarker,
}: {
  markers: google.maps.Marker[];
  setMarkers: React.Dispatch<React.SetStateAction<google.maps.Marker[]>>;
  markerCluster?: any;
  deleteMarker?: (marker: google.maps.Marker) => void;
  clearAllMarkers?: () => void;
}) {
  useEffect(() => {
    console.log(markers);
  }, [markers]);

  return (
    <div className="showMarkers">
      <h3 className="header">Список Маркерів</h3>
      <div className="markerList">
        {markers.map((marker, index) => (
          <div key={index} className="markerItem">
            <span className="markerLabel">
              Маркер : {String(marker.getTitle())}
            </span>
            <DeleteMarker onDelete={() => deleteMarker?.(marker)} />
          </div>
        ))}
      </div>
      <button className="clearButton" onClick={clearAllMarkers}>
        Очистити всі маркери
      </button>
    </div>
  );
}
