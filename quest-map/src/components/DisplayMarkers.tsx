import React, { useEffect, useState } from "react";
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
  const [addresses, setAddresses] = useState<string[]>([]);

  useEffect(() => {
    markers.forEach((marker, index) => {
      getMarkerLocationName(marker, index);

      // Додаємо слухача на зміну позиції маркера
      marker.addListener("dragend", () => {
        // Оновлюємо адресу після перетягування
        getMarkerLocationName(marker, index);
      });
    });
  }, [markers]);

  const getMarkerLocationName = (marker: google.maps.Marker, index: number) => {
    const geocoder = new google.maps.Geocoder();
    const position = marker.getPosition();

    if (position) {
      geocoder.geocode({ location: position }, (results, status) => {
        if (status === "OK" && results && results.length > 0) {
          setAddresses((prevAddresses) => {
            const newAddresses = [...prevAddresses];
            newAddresses[index] = results[0].formatted_address;
            return newAddresses;
          });
        } else {
          console.error("Не вдалося знайти адресу для цієї локації.");
        }
      });
    } else {
      console.error("Позиція маркера не доступна.");
    }
  };

  return (
    <div className="showMarkers">
      <h3 className="header">Список Маркерів</h3>
      <div className="markerList">
        {markers.map((marker, index) => (
          <div key={index} className="markerItem">
            <div>
              <span className="markerLabel">
                {`Маркер ${marker.getLabel()} `}
              </span>
              <span>
                {`: ${
                  addresses[index] ? addresses[index] : "Отримання адреси..."
                } `}
              </span>
            </div>

            <DeleteMarker onDelete={() => deleteMarker?.(marker)} />
          </div>
        ))}
      </div>
      {markers.length > 0 && (
        <button className="clearButton" onClick={clearAllMarkers}>
          Очистити всі маркери
        </button>
      )}
    </div>
  );
}
