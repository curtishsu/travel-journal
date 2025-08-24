"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type TripData = {
  id: string;
  name: string;
  photo_url?: string;
  highlight?: string;
  start_date: string;
};

type NavButtonProps = {
  label: string;
  emoji: string;
  color: string;
  route: string;
};

function NavButton({ label, emoji, color, route, isLast = false }: NavButtonProps & { isLast?: boolean }) {
  const router = useRouter();
  return (
    <button
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem 0.5rem",
        cursor: "pointer",
        backgroundColor: "transparent",
        color: color,
        border: "none",
        borderRight: isLast ? "none" : "1px solid #e9ecef",
        borderRadius: "0",
        flex: 1,
        gap: "0.5rem",
        transition: "background-color 0.2s ease",
        position: "relative",
      }}
      onClick={() => router.push(route)}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.05)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "transparent";
      }}
    >
      <div style={{ fontSize: "2rem" }}>{emoji}</div>
      <span style={{ 
        fontSize: "0.85rem", 
        fontWeight: "500",
        textAlign: "center",
        lineHeight: "1.2",
      }}>
        {label}
      </span>
    </button>
  );
}

export default function Home() {
  const [randomTrip, setRandomTrip] = useState<TripData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRandomTrip();
  }, []);

  const fetchRandomTrip = async () => {
    try {
      const { data: trips, error } = await supabase
        .from("trips")
        .select("id, name, photo_url, start_date");

      if (error) {
        console.error("Error fetching trips:", error);
        setLoading(false);
        return;
      }

      if (trips && trips.length > 0) {
        // Get a random trip
        const randomIndex = Math.floor(Math.random() * trips.length);
        const selectedTrip = trips[randomIndex];

        // Try to get a highlight from one of the trip days
        const { data: tripDays } = await supabase
          .from("trip_days")
          .select("highlight")
          .eq("trip_id", selectedTrip.id)
          .not("highlight", "is", null)
          .limit(1);

        setRandomTrip({
          ...selectedTrip,
          highlight: tripDays?.[0]?.highlight || "No highlights recorded yet"
        });
      }
    } catch (error) {
      console.error("Error fetching random trip:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      {/* Welcome Section */}
      <div
        style={{
          padding: "2rem",
          textAlign: "center",
          backgroundColor: "white",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h1 style={{ 
          fontSize: "2.5rem", 
          fontWeight: "bold", 
          color: "#333",
          margin: "0",
        }}>
          Welcome, Curtis! ✈️
        </h1>
      </div>

      {/* Main Content - Trip Highlight */}
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          gap: "1.5rem",
        }}
      >
        {loading ? (
          <div style={{ fontSize: "1.2rem", color: "#666" }}>Loading your memories...</div>
        ) : randomTrip ? (
          <>
            {/* Trip Photo */}
            <div
              style={{
                width: "300px",
                height: "200px",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                backgroundColor: "#e9ecef",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {randomTrip.photo_url ? (
                <img
                  src={randomTrip.photo_url}
                  alt={randomTrip.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <div style={{
                  textAlign: "center",
                  color: "#6c757d",
                  fontSize: "3rem",
                }}>
                  📸
                  <div style={{ fontSize: "1rem", marginTop: "0.5rem" }}>
                    No photo yet
                  </div>
                </div>
              )}
            </div>

            {/* Trip Info */}
            <div style={{ textAlign: "center", maxWidth: "400px" }}>
              <h2 style={{ 
                fontSize: "1.8rem", 
                fontWeight: "600", 
                color: "#333", 
                marginBottom: "0.5rem" 
              }}>
                {randomTrip.name}
              </h2>
              <p style={{ 
                fontSize: "1rem", 
                color: "#666", 
                fontStyle: "italic",
                lineHeight: "1.5",
                margin: "0",
              }}>
                "{randomTrip.highlight}"
              </p>
            </div>
          </>
        ) : (
          <div style={{ textAlign: "center", color: "#666" }}>
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🗺️</div>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "0.5rem" }}>Ready for your first adventure?</h2>
            <p style={{ fontSize: "1rem" }}>Start by adding your first trip!</p>
          </div>
        )}
      </div>

      {/* Navigation Section */}
      <div
        style={{
          padding: "1rem 0",
          backgroundColor: "white",
          boxShadow: "0 -2px 4px rgba(0,0,0,0.1)",
          borderTop: "1px solid #e9ecef",
        }}
      >
        <div
          style={{
            display: "flex",
            width: "100%",
            maxWidth: "600px",
            margin: "0 auto",
          }}
        >
          <NavButton label="See Globe" emoji="🌍" color="#0070f3" route="/globe" />
          <NavButton label="Journal" emoji="📓" color="#34c759" route="/journal" />
          <NavButton label="Add Trip" emoji="➕" color="#ff9500" route="/add-trip" />
          <NavButton label="My Stats" emoji="📊" color="#28a745" route="/my-stats" isLast={true} />
        </div>
      </div>
    </main>
  );
}
