"use client";

import React, { useEffect, useRef } from "react";
import { MapMarker, HotspotCluster } from "@/types";

interface MapViewProps {
  markers?: MapMarker[];
  hotspots?: HotspotCluster[];
  selectedLocation?: { lat: number; lng: number } | null;
  onLocationSelect?: (lat: number, lng: number) => void;
  interactiveSelect?: boolean;
  height?: string;
  zoom?: number;
  center?: [number, number];
}

// Default Freetown Western Area Urban coordinates
const FREETOWN_CENTER: [number, number] = [8.4840, -13.2450];

export default function MapView({
  markers = [],
  hotspots = [],
  selectedLocation = null,
  onLocationSelect,
  interactiveSelect = false,
  height = "500px",
  zoom = 13,
  center = FREETOWN_CENTER,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerGroupRef = useRef<any>(null);
  const hotspotGroupRef = useRef<any>(null);
  const selectMarkerRef = useRef<any>(null);

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    let isMounted = true;

    // Load Leaflet dynamically
    const initMap = async () => {
      const L = (await import("leaflet")).default;

      // Ensure leaflet styles are injected
      if (!document.getElementById("leaflet-css")) {
        const link = document.createElement("link");
        link.id = "leaflet-css";
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        document.head.appendChild(link);
      }

      if (!mapContainerRef.current || mapInstanceRef.current) return;

      const map = L.map(mapContainerRef.current).setView(center, zoom);
      mapInstanceRef.current = map;

      // Base tile layer from OpenStreetMap
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | FIMMS Freetown',
        maxZoom: 19,
      }).addTo(map);

      const markerGroup = L.layerGroup().addTo(map);
      markerGroupRef.current = markerGroup;

      const hotspotGroup = L.layerGroup().addTo(map);
      hotspotGroupRef.current = hotspotGroup;

      // Handle map clicks for selecting coordinates
      if (interactiveSelect) {
        map.on("click", (e: any) => {
          const { lat, lng } = e.latlng;
          if (onLocationSelect) {
            onLocationSelect(lat, lng);
          }
        });
      }
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Spatial Hotspots
  useEffect(() => {
    if (!mapInstanceRef.current || !hotspotGroupRef.current) return;

    const updateHotspots = async () => {
      const L = (await import("leaflet")).default;
      hotspotGroupRef.current.clearLayers();

      hotspots.forEach((h) => {
        const strokeColor =
          h.risk_level === "Critical"
            ? "#DC2626"
            : h.risk_level === "High"
            ? "#EA580C"
            : "#CA8A04";
        const fillColor =
          h.risk_level === "Critical"
            ? "#F87171"
            : h.risk_level === "High"
            ? "#FB923C"
            : "#FDE047";

        // Draw intensity radius circle
        const circle = L.circle([h.centroid_lat, h.centroid_lng], {
          color: strokeColor,
          fillColor: fillColor,
          fillOpacity: 0.35,
          weight: 2,
          radius: h.radius_meters,
        });

        const popup = `
          <div style="font-family: inherit; min-width: 180px; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; color: ${strokeColor}; text-transform: uppercase;">
              ⚠️ ${h.risk_level} Risk Hotspot
            </div>
            <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin: 2px 0;">
              ${h.community} Cluster
            </div>
            <div style="font-size: 11px; color: #475569;">
              Active Faults: <strong>${h.fault_count}</strong> (${h.critical_count} critical)
            </div>
            <div style="font-size: 11px; color: #475569; margin-top: 2px;">
              Primary Issue: <strong>${h.predominant_category}</strong>
            </div>
          </div>
        `;
        circle.bindPopup(popup);
        hotspotGroupRef.current.addLayer(circle);

        // Add centroid marker
        const centerPin = L.divIcon({
          className: "hotspot-pin",
          html: `
            <div style="background-color: ${strokeColor}; width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3); color: white; font-weight: bold; font-size: 10px;">
              ${h.fault_count}
            </div>
          `,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });
        const centerMarker = L.marker([h.centroid_lat, h.centroid_lng], { icon: centerPin }).bindPopup(popup);
        hotspotGroupRef.current.addLayer(centerMarker);
      });
    };

    updateHotspots();
  }, [hotspots]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || !markerGroupRef.current) return;

    const updateMarkers = async () => {
      const L = (await import("leaflet")).default;
      markerGroupRef.current.clearLayers();

      const getCategoryColor = (category: string) => {
        switch (category) {
          case "Road damage":
            return "#EA580C"; // Orange
          case "Streetlights":
            return "#CA8A04"; // Yellow/Gold
          case "Drainage systems":
            return "#0284C7"; // Light Blue
          case "Water infrastructure":
            return "#0D9488"; // Teal
          case "Public walkways":
            return "#7C3AED"; // Purple
          case "Waste facilities":
            return "#E11D48"; // Rose
          default:
            return "#4B5563"; // Gray
        }
      };

      markers.forEach((m) => {
        const color = getCategoryColor(m.category_name);
        const customIcon = L.divIcon({
          className: "custom-map-pin",
          html: `
            <div style="background-color: ${color}; width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 3px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); color: white; font-weight: bold; font-size: 11px;">
              📍
            </div>
          `,
          iconSize: [34, 34],
          iconAnchor: [17, 34],
          popupAnchor: [0, -32],
        });

        const popupContent = `
          <div style="font-family: inherit; min-width: 200px; padding: 4px;">
            <div style="font-size: 10px; font-weight: bold; text-transform: uppercase; color: ${color}; margin-bottom: 2px;">
              ${m.category_name}
            </div>
            <div style="font-weight: 700; font-size: 13px; color: #0f172a; line-height: 1.3; margin-bottom: 6px;">
              ${m.title}
            </div>
            <div style="font-size: 11px; color: #475569; margin-bottom: 4px;">
              📍 <strong>${m.community}</strong> ${m.location_name ? `• ${m.location_name}` : ""}
            </div>
            <div style="display: flex; gap: 4px; margin-top: 6px;">
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #e2e8f0; color: #334155; font-weight: 600;">
                ${m.status}
              </span>
              <span style="font-size: 10px; padding: 2px 6px; border-radius: 4px; background: #fee2e2; color: #991b1b; font-weight: 600;">
                ${m.severity.toUpperCase()}
              </span>
            </div>
            <div style="margin-top: 8px; text-align: right;">
              <a href="/track-report?tracking=${m.tracking_number}" style="font-size: 11px; font-weight: 600; color: #0284c7; text-decoration: none;">
                Track Report (${m.tracking_number}) &rarr;
              </a>
            </div>
          </div>
        `;

        const marker = L.marker([m.latitude, m.longitude], { icon: customIcon }).bindPopup(popupContent);
        markerGroupRef.current.addLayer(marker);
      });
    };

    updateMarkers();
  }, [markers]);

  // Update selected location pin (when user clicks on map or captures GPS)
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    const updateSelectedPin = async () => {
      const L = (await import("leaflet")).default;

      if (selectMarkerRef.current) {
        mapInstanceRef.current.removeLayer(selectMarkerRef.current);
        selectMarkerRef.current = null;
      }

      if (selectedLocation) {
        const pinIcon = L.divIcon({
          className: "selected-pin",
          html: `
            <div style="background-color: #10B981; width: 38px; height: 38px; border-radius: 50%; display: flex; align-items: center; justify-content: center; border: 4px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.4); color: white; font-weight: bold; font-size: 16px;">
              🎯
            </div>
          `,
          iconSize: [38, 38],
          iconAnchor: [19, 38],
        });

        const newMarker = L.marker([selectedLocation.lat, selectedLocation.lng], {
          icon: pinIcon,
          draggable: interactiveSelect,
        }).addTo(mapInstanceRef.current);

        if (interactiveSelect) {
          newMarker.on("dragend", (e: any) => {
            const { lat, lng } = e.target.getLatLng();
            if (onLocationSelect) onLocationSelect(lat, lng);
          });
        }

        selectMarkerRef.current = newMarker;
        mapInstanceRef.current.panTo([selectedLocation.lat, selectedLocation.lng]);
      }
    };

    updateSelectedPin();
  }, [selectedLocation, interactiveSelect]);

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border border-slate-200 shadow-md">
      <div ref={mapContainerRef} style={{ height }} className="w-full bg-slate-100" />
      {interactiveSelect && (
        <div className="absolute top-3 right-3 z-[1000] bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 shadow-sm pointer-events-none">
          Click anywhere or drag marker to set exact location
        </div>
      )}
    </div>
  );
}
