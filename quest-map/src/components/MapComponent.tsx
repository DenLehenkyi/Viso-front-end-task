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
  let labelIndex = 1;
  let markerCluster: MarkerClusterer | null = null;

  useEffect(() => {
    initMap();
  }, []);

  async function initMap() {
    const { Map } = (await google.maps.importLibrary(
      "maps"
    )) as google.maps.MapsLibrary;

    const map = new Map(document.getElementById("map") as HTMLElement, {
      center: { lat: 49.8397, lng: 24.0297 },
      zoom: 14,
      mapId: "4504f8b37365c3d0",
    });

    google.maps.event.addListener(
      map,
      "click",
      (event: google.maps.MapMouseEvent) => {
        if (event.latLng) {
          addMarker(event.latLng.toJSON(), map);
        }
      }
    );

    markerCluster = new MarkerClusterer({ map, markers });

    await loadMarkersFromFirestore(map);
  }

  async function loadMarkersFromFirestore(map: google.maps.Map) {
    const firestoreMarkers = await getMarkersFromFirestore();
    const loadedMarkers: google.maps.Marker[] = [];

    firestoreMarkers.forEach((markerData) => {
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

    setMarkers(loadedMarkers);
    if (markerCluster) {
      markerCluster.clearMarkers();
      markerCluster.addMarkers(loadedMarkers);
    }
  }

  function deleteMarker(marker: google.maps.Marker) {
    const docId = (marker as any).docId;

    if (docId) {
      deleteMarkerFromFirestore(docId).then(() => {
        marker.setMap(null);
        setMarkers((prevMarkers) => {
          const newMarkers = prevMarkers.filter((m) => m !== marker);
          if (markerCluster) {
            markerCluster.removeMarker(marker);
          }
          return newMarkers;
        });
      });
    }
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

      if (prevMarker) {
        const prevDocId = (prevMarker as any).docId;

        if (prevDocId && prevDocId !== newDocId) {
          try {
            await updateDoc(doc(db, "quests", prevDocId), { next: newDocId });
          } catch (error) {
            console.error(
              `Failed to update 'next' field for ${prevDocId}`,
              error
            );
          }
        }
      }
      setPrevMarker(marker);

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
      setMarkers((prevMarkers) => {
        const newMarkers = [...prevMarkers, marker];
        if (markerCluster) {
          markerCluster.addMarker(marker);
        }
        return newMarkers;
      });
    }
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
        deletemarker={deleteMarker}
      ></DisplayMarkers>
    </div>
  );
}
