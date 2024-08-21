import { useState, useEffect } from "react";
import {
  getMarkersFromFirestore,
  addMarkerToFirestore,
  deleteMarkerFromFirestore,
  updateMarkerInFirestore,
} from "../firebase/FirebaseService";

import { MarkerClusterer } from "@googlemaps/markerclusterer";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase/FirebaseConfig";

interface MarkerManagerProps {
  map: google.maps.Map | null;
  markerCluster: MarkerClusterer | null;
  onMarkersChange: (markers: google.maps.Marker[]) => void;
}

export default function useMarkerManager({
  map,
  markerCluster,
  onMarkersChange,
}: MarkerManagerProps) {
  const [markers, setMarkers] = useState<google.maps.Marker[]>([]);
  const [prevMarker, setPrevMarker] = useState<google.maps.Marker | null>(null);
  const [deletedMarkerIds, setDeletedMarkerIds] = useState<string[]>([]);
  let labelIndex = 1;

  useEffect(() => {
    if (map) {
      loadMarkersFromFirestore(map);
      google.maps.event.addListener(
        map,
        "click",
        (event: google.maps.MapMouseEvent) => {
          if (event.latLng) {
            addMarker(event.latLng.toJSON(), map);
          }
        }
      );
    }
  }, [map]);

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
      onMarkersChange(newMarkers);
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

      onMarkersChange(newMarkers);
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
      onMarkersChange(newMarkers);
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
    onMarkersChange([]);
  }

  return {
    addMarker,
    deleteMarker,
    updateMarkerPosition,
    clearAllMarkers,
    loadMarkersFromFirestore,
  };
}
