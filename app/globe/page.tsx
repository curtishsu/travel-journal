"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

const Globe = dynamic(() => import("react-globe.gl"), { ssr: false });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function GlobePage() {
  const globeRef = useRef<any>();
  const router = useRouter();

  const [points, setPoints] = useState<any[]>([]);
  const [selectedPoint, setSelectedPoint] = useState<any>(null);
  const [viewMode, setViewMode] = useState<'points' | 'countries'>('points');
  const [visitedCountries, setVisitedCountries] = useState<any[]>([]);
  const [countriesData, setCountriesData] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      const { data, error } = await supabase
        .from("trip_days")
        .select("trip_id, day_number, location, country, lat, lng, date, highlight");

      if (!error && data) {
        const filtered = data
          .filter((d) => d.lat && d.lng)
          .map((d) => ({
            ...d,
            lat: parseFloat(d.lat),
            lng: parseFloat(d.lng),
            size: 0.8,
            color: "#FF4444",
          }));
        setPoints(filtered);

        // Extract unique countries for country view
        const uniqueCountries = [...new Set(data
          .filter(d => d.country)
          .map(d => d.country)
        )];
        setVisitedCountries(uniqueCountries);
          console.log("Visited countries from database:", uniqueCountries);
        console.log("Peru found in database:", uniqueCountries.includes('Peru'));
      } else {
        console.error("Error fetching globe points:", error);
      }
    };

    const fetchCountriesData = async () => {
      try {
        const response = await fetch('https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson');
        const countries = await response.json();
        setCountriesData(countries);
        
        // Debug: Find Peru in GeoJSON
        const peruCountry = countries.features?.find((f: any) => 
          f.properties?.NAME?.toLowerCase().includes('peru')
        );
        console.log("Peru in GeoJSON:", peruCountry?.properties?.NAME);
        
        // Debug: Show some country names from GeoJSON
        const countryNames = countries.features?.slice(0, 10).map((f: any) => f.properties?.NAME);
        console.log("Sample GeoJSON country names:", countryNames);
      } catch (error) {
        console.error("Error fetching countries data:", error);
      }
    };

    fetchData();
    fetchCountriesData();
  }, []);

  // Center the globe on the area with most activity
  useEffect(() => {
    if (globeRef.current && points.length > 0) {
      // Calculate the center point of all travel locations
      const avgLat = points.reduce((sum, point) => sum + point.lat, 0) / points.length;
      const avgLng = points.reduce((sum, point) => sum + point.lng, 0) / points.length;
      
      console.log(`Centering globe on: lat=${avgLat}, lng=${avgLng}`);
      
      // Point the camera to the center of your travels
      globeRef.current.pointOfView({ lat: avgLat, lng: avgLng, altitude: 2 }, 1000);
    }
  }, [points, viewMode]); // Re-center when points change or view mode changes

  const handlePointClick = (point: any) => {
    if (!selectedPoint || selectedPoint.trip_id !== point.trip_id || selectedPoint.day_number !== point.day_number) {
      setSelectedPoint(point);
    } else {
      router.push(`/trip/${point.trip_id}/day/${point.day_number}`);
    }
  };

  return (
    <div style={{ position: "relative", height: "100vh" }}>
      {/* Back button */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: "20px",
          left: "20px",
          zIndex: 10,
          padding: "8px 12px",
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        ← Back
      </button>

      {/* View Toggle */}
      <div
        style={{
          position: "absolute",
          top: "20px",
          right: "20px",
          zIndex: 10,
          display: "flex",
          backgroundColor: "rgba(0,0,0,0.6)",
          borderRadius: "8px",
          padding: "4px",
        }}
      >
        <button
          onClick={() => {
            console.log("Switching to points view");
            setViewMode('points');
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === 'points' ? "#0070f3" : "transparent",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Points
        </button>
        <button
          onClick={() => {
            console.log("Switching to countries view");
            setViewMode('countries');
          }}
          style={{
            padding: "8px 16px",
            backgroundColor: viewMode === 'countries' ? "#0070f3" : "transparent",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: "pointer",
            fontSize: "0.9rem",
          }}
        >
          Countries
        </button>
      </div>

      <Globe
        key={viewMode} // Force re-render when view mode changes
        ref={globeRef}
        globeImageUrl={viewMode === 'countries' ? "//unpkg.com/three-globe/example/img/earth-night.jpg" : "//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"}
        bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
        backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
        
        // Points view
        pointsData={(() => {
          const pointsToShow = viewMode === 'points' ? points : [];
          console.log(`Points data for ${viewMode} mode:`, pointsToShow.length, "points");
          return pointsToShow;
        })()}
        pointLat={(p: any) => p.lat}
        pointLng={(p: any) => p.lng}
        pointColor={(p: any) => p.color}
        pointAltitude={0.02}
        pointRadius={0.8}
        onPointClick={viewMode === 'points' ? handlePointClick : undefined}
        
        // Countries view - explicitly set to empty array when in points mode
        polygonsData={(() => {
          const polygonsToShow = viewMode === 'countries' ? (countriesData?.features || []) : [];
          console.log(`Polygons data for ${viewMode} mode:`, polygonsToShow.length, "countries");
          return polygonsToShow;
        })()}
        polygonCapColor={(d: any) => {
          const countryName = d.properties?.name; // Changed from NAME to name (lowercase)
          console.log(`Processing country: "${countryName}"`);
          if (!countryName || !visitedCountries.length) {
            return 'rgba(0,100,200,0.1)';
          }
          
          // Check if this country has been visited
          const isVisited = visitedCountries.some(visitedCountry => {
            if (!visitedCountry || typeof visitedCountry !== 'string') {
              return false;
            }
            const visited = visitedCountry.toLowerCase().trim();
            const country = countryName.toLowerCase().trim();
            const matches = visited.includes(country) || country.includes(visited);
            
            // Debug logging for Peru specifically
            if (country === 'peru' || visited === 'peru') {
              console.log(`Checking Peru: GeoJSON="${country}", Database="${visited}", Matches=${matches}`);
            }
            
            return matches;
          });
          
          // Debug logging for all countries
          if (countryName.toLowerCase() === 'peru') {
            console.log(`Peru result: isVisited=${isVisited}, visitedCountries:`, visitedCountries);
          }
          
          return isVisited ? '#FF4444' : 'rgba(0,100,200,0.1)';
        }}
        polygonSideColor={() => 'rgba(0,100,200,0.05)'}
        polygonStrokeColor={() => '#ffffff'}
        polygonAltitude={0.01}
        
        atmosphereColor="#87CEEB"
        atmosphereAltitude={0.15}
        enablePointerInteraction={true}
      />

      {selectedPoint && (
        <div
          style={{
            position: "absolute",
            bottom: "20px",
            left: "50%",
            transform: "translateX(-50%)",
            background: "rgba(0,0,0,0.8)",
            color: "#fff",
            padding: "12px 16px",
            borderRadius: "8px",
            minWidth: "250px",
            textAlign: "center",
          }}
        >
          <h3 style={{ margin: "0 0 6px" }}>{selectedPoint.location}</h3>
          {selectedPoint.date && (
            <p style={{ margin: "0 0 6px", fontSize: "0.9rem" }}>
              {new Date(selectedPoint.date + 'T00:00:00').toLocaleDateString('en-US', {
                year: 'numeric',
                month: '2-digit',
                day: '2-digit'
              })}
            </p>
          )}
          {selectedPoint.highlight && (
            <p style={{ margin: "0", fontSize: "0.85rem", opacity: 0.8 }}>
              {selectedPoint.highlight}
            </p>
          )}
          <small style={{ display: "block", marginTop: "8px", opacity: 0.7 }}>
            Click again to open this trip day
          </small>
        </div>
      )}
    </div>
  );
}
