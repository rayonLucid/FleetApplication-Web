import { Injectable } from '@angular/core';
import { MapSearchResult } from '../Data/data-interface';
import * as L from 'leaflet';
@Injectable({
  providedIn: 'root',
})
export class MapService {

 public  options: L.MapOptions = {
      layers: [
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 18,
          attribution: '© Rayon Solutions 2026',


        })
      ],
      zoom: 13,
      center: L.latLng(6.5244, 3.3792) // Lagos, Nigeria coordinates
    };
 public icon: L.Icon<L.IconOptions> = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

   public DestIcon: L.Icon<L.IconOptions> = L.icon({
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],

  });
  public DeliveryIcon: L.Icon<L.IconOptions> = L.icon({
  // Swapped to the red marker image URL
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34], // Ensures the popup points cleanly to the top of the pin
  shadowSize: [41, 41]
});

 async performSearch(searchQuery: string): Promise<MapSearchResult> {
  let searchResult: MapSearchResult = {
    lat: 0,
    lon: 0,
    display_name: "",
    message: ""
  };

  if (!searchQuery) {
    searchResult.message = "Search Cannot be Empty";
    return searchResult;
  }

  // FIX 1: Assign the result of the regex replacements to a new variable
  const cleanedQuery = searchQuery
    // Remove "off [Street Name]" phrasing
    .replace(/\boff\s+[^,]+,/gi, '')
    // Remove "by [Landmark]" phrasing entirely up to the next comma
    .replace(/\bby\s+[^,]+,/gi, '')
    .trim();
//console.log(cleanedQuery)
  try {
    // FIX 2: Fixed the viewbox coordinate order for Lagos (min_lon, max_lat, max_lon, min_lat)
  //  const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedQuery)}&viewbox=3.3,6.7,3.4,6.5&bounded=1`;
// Cleanest way to search anywhere inside Nigeria
const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(cleanedQuery)}&countrycodes=ng`;
    const response = await fetch(url);
    const results = await response.json();

    if (results.length > 0) {
      const topResult = results[0];
      searchResult = {
        lat: topResult.lat,
        lon: topResult.lon,
        display_name: topResult.display_name,
        message: "Success"
      };
    } else {
      searchResult.message = "Location not found in this area.";
    }
  } catch (error) {
    console.error("Search failed", error);
    searchResult.message = "An error occurred during search.";
  }

  return searchResult;
}
}
