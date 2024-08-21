import { useEffect, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import DisplayMarkers from "./DisplayMarkers";
import useMarkerManager from "./MarkManager";

export default function MapComponent() {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(
    null
  );
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);

  const markerManager = useMarkerManager({
    map,
    markerCluster,
    onMarkersChange: setMarkers,
  });

  useEffect(() => {
    initMap();
  }, []);

  async function initMap() {
    const { Map } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;

    const mapInstance = new Map(document.getElementById("map") as HTMLElement, {
      center: { lat: 49.8397, lng: 24.0297 },
      zoom: 14,
      mapId: "4504f8b37365c3d0",
    });

    setMap(mapInstance);

    const clusterInstance = new MarkerClusterer({
      map: mapInstance,
      markers: [],
    });
    setMarkerCluster(clusterInstance);
  }

  return (
    <div id="container">
      <div id="map"></div>
      <DisplayMarkers
        markers={markers}
        setMarkers={setMarkers}
        clearAllMarkers={markerManager.clearAllMarkers}
        deleteMarker={markerManager.deleteMarker}
        markerCluster={markerCluster}
      />
    </div>
  );
}
