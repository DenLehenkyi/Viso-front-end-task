import { useEffect, useState } from "react";
import { MarkerClusterer } from "@googlemaps/markerclusterer";
import DisplayMarkers from "./DisplayMarkers";
import {
  getMarkersFromFirestore,
  addMarkerToFirestore,
  deleteMarkerFromFirestore,
  updateMarkerInFirestore,
} from "../firebase/FirebaseService";
import { db } from "../firebase/FirebaseConfig";
import { doc, updateDoc } from "firebase/firestore";

export default function MapComponent() {
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [prevMarker, setPrevMarker] = useState<google.maps.Marker | null>(null);
  const [deletedMarkerIds, setDeletedMarkerIds] = useState<string[]>([]);
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [markerCluster, setMarkerCluster] = useState<MarkerClusterer | null>(
    null
  );
  let labelIndex = 1;

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

    google.maps.event.addListener(
      mapInstance,
      "click",
      (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          addMarker(event.latLng.toJSON(), mapInstance);
        }
      }
    );

    const clusterInstance = new MarkerClusterer({
      map: mapInstance,
      markers: [],
    });
    setMarkerCluster(clusterInstance);

    loadMarkersFromFirestore(mapInstance);
  }

  async function loadMarkersFromFirestore(map: google.maps.Map) {
    const firestoreMarkers = await getMarkersFromFirestore();
    const loadedMarkers: google.maps.Marker[] = [];

    firestoreMarkers.forEach((markerData) => {
      if (deletedMarkerIds.includes(markerData.docId)) {
        return;
      }

      const marker = new google.maps.Marker({
        position: markerData.location,
        label: `${labelIndex}`,
        map: map,
        draggable: true,
      });

      (marker as any).docId = markerData.docId;

      marker.addListener(
        "dragend",
        async (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            const newLocation = event.latLng.toJSON();
            updateMarkerPosition(marker, newLocation);
          }
        }
      );

      marker.addListener("click", () => {
        deleteMarker(marker);
      });

      labelIndex++;
      loadedMarkers.push(marker);
    });

    setMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, ...loadedMarkers];
      if (markerCluster) {
        markerCluster.addMarkers(loadedMarkers);
      }
      return newMarkers;
    });
  }

  function deleteMarker(marker: google.maps.Marker) {
    const docId = (marker as any).docId;

    if (docId) {
      deleteMarkerFromFirestore(docId);
      setDeletedMarkerIds((prevIds) => [...prevIds, docId]);
    }

    marker.setMap(null);

    setMarkers((prevMarkers) => {
      const newMarkers = prevMarkers.filter((m) => m !== marker);

      if (markerCluster) {
        markerCluster.removeMarker(marker);
      }

      return newMarkers;
    });
  }

  function updateMarkerPosition(
    marker: google.maps.Marker,
    location: google.maps.LatLngLiteral
  ) {
    marker.setPosition(location);

    const docId = (marker as any).docId;
    if (docId) {
      updateMarkerInFirestore(docId, { location });
    }
  }

  async function addMarker(
    location: google.maps.LatLngLiteral,
    map: google.maps.Map
  ) {
    const marker = new google.maps.Marker({
      position: location,
      label: `${labelIndex}`,
      map: map,
      draggable: true,
    });

    const newDocId = await addMarkerToFirestore(location);

    if (newDocId) {
      (marker as any).docId = newDocId;

      setPrevMarker((prevMarker) => {
        if (prevMarker) {
          const prevDocId = (prevMarker as any).docId;
          console.log(prevDocId);

          if (prevDocId && prevDocId !== newDocId) {
            try {
              updateDoc(doc(db, "quests", prevDocId), { next: newDocId });
              console.log(
                `Updated 'next' field of document ID ${prevDocId} to ${newDocId}`
              );
            } catch (error) {
              console.error(
                `Failed to update 'next' field for ${prevDocId}`,
                error
              );
            }
          }
        }
        console.log(prevMarker);
        return marker;
      });
    }

    marker.addListener("dragend", async (event: google.maps.MapMouseEvent) => {
      if (event.latLng) {
        const newLocation = event.latLng.toJSON();
        updateMarkerPosition(marker, newLocation);
      }
    });

    marker.addListener("click", () => {
      deleteMarker(marker);
    });

    labelIndex++;
    setMarkers((prevMarkers) => {
      const newMarkers = [...prevMarkers, marker];
      if (markerCluster) {
        markerCluster.addMarker(marker);
      }
      return newMarkers;
    });
  }

  async function clearAllMarkers() {
    markers.forEach((marker) => {
      deleteMarker(marker);
    });

    if (markerCluster) {
      markerCluster.clearMarkers();
    }

    setMarkers([]);
  }

  return (
    <div id="container">
      <div id="map"></div>
      <DisplayMarkers
        markers={markers}
        setMarkers={setMarkers}
        clearAllMarkers={clearAllMarkers}
        deleteMarker={deleteMarker}
        markerCluster={markerCluster}
      ></DisplayMarkers>
    </div>
  );
}
