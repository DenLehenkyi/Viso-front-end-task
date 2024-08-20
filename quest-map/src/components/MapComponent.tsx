import { useEffect } from "react";

export default function MapComponent(){

    async function initMap() {
       
        const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
        const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;
      
        const map = new Map(document.getElementById('map') as HTMLElement, {
          center: { lat: 37.42, lng: -122.1 },
          zoom: 14,
          mapId: '4504f8b37365c3d0',
        });
      
        const priceTag = document.createElement('div');
        priceTag.className = 'price-tag';
        priceTag.textContent = '$2.5M';
      
        const marker = new AdvancedMarkerElement({
          map,
          position: { lat: 37.42, lng: -122.1 },
          content: priceTag,
        });
      }

     useEffect(() =>{
        initMap();
     },[])
    return (
    <>
   <div id="map" style={{ width: '100%', height: '500px' }}>

    </div>
    </> 
    )
}