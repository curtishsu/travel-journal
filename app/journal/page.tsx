"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

// Create Supabase client
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Trip = {
  id: string;
  name: string;
  start_date: string;
  end_date: string;
};

export default function JournalPage() {
  const router = useRouter();
  const [trips, setTrips] = useState<Trip[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  useEffect(() => {
    fetchTrips();
  }, []);

  async function fetchTrips() {
    const { data, error } = await supabase
      .from("trips")
      .select("id, name, start_date, end_date")
      .order("start_date", { ascending: false });

    if (error) {
      console.error("Error fetching trips:", error);
    } else {
      setTrips(data || []);
    }
    setLoading(false);
  }

  async function handleDelete(tripId: string) {
    const confirmDelete = window.confirm(
      "Are you sure you want to delete this trip and all its days? This cannot be undone."
    );
    if (!confirmDelete) return;

    // Delete trip_days first
    const { error: daysError } = await supabase
      .from("trip_days")
      .delete()
      .eq("trip_id", tripId);

    if (daysError) {
      console.error("Error deleting trip days:", daysError);
      alert("Failed to delete trip days");
      return;
    }

    // Delete trip
    const { error: tripError } = await supabase
      .from("trips")
      .delete()
      .eq("id", tripId);

    if (tripError) {
      console.error("Error deleting trip:", tripError);
      alert("Failed to delete trip");
      return;
    }

    // Update local state
    setTrips((prev) => prev.filter((t) => t.id !== tripId));
  }

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading trips...</p>;
  }

  return (
    <div style={{ padding: "20px" }}>
      {/* Home Button */}
      <button
        style={{
          padding: "0.5rem 1rem",
          marginBottom: "20px",
          cursor: "pointer",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
        }}
        onClick={() => router.push("/")}
      >
        🏠 Home
      </button>

      <h1 style={{ marginBottom: "20px" }}>📓 My Trips</h1>

      {trips.length === 0 ? (
        <p>No trips yet. Go to Add Trip to create one!</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {trips.map((trip) => (
            <li
  key={trip.id}
  style={{
    position: "relative", // ✅ So we can absolutely position the dots
    border: "1px solid #ddd",
    borderRadius: "8px",
    padding: "15px",
    marginBottom: "10px",
    background: "#f9f9f9",
    transition: "background 0.2s",
    display: "block", // ✅ No flex — we’ll position the dots ourselves
  }}
  onMouseEnter={(e) => (e.currentTarget.style.background = "#eee")}
  onMouseLeave={(e) => (e.currentTarget.style.background = "#f9f9f9")}
>
  {/* Trip details */}
  <div
    style={{ cursor: "pointer", paddingRight: "2rem" }}
    onClick={() => router.push(`/trip/${trip.id}/day/1`)}
  >
    <h2 style={{ margin: "0 0 5px 0" }}>{trip.name}</h2>
    <p style={{ margin: 0, color: "#555" }}>
      {new Date(trip.start_date).toLocaleDateString()} –{" "}
      {new Date(trip.end_date).toLocaleDateString()}
    </p>
  </div>

  {/* Three-dot menu */}
  <div style={{ position: "absolute", top: "10px", right: "10px" }}>
    <button
      onClick={(e) => {
        e.stopPropagation();
        setOpenMenuId(openMenuId === trip.id ? null : trip.id);
      }}
      style={{
        background: "none",
        border: "none",
        fontSize: "1.5rem",
        cursor: "pointer",
        padding: 0,
        lineHeight: 1,
      }}
    >
      ⋮
    </button>

    {openMenuId === trip.id && (
      <div
        style={{
          position: "absolute",
          right: 0,
          top: "2rem",
          background: "#fff",
          border: "1px solid #ccc",
          borderRadius: "4px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.15)",
          zIndex: 10,
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete(trip.id);
            setOpenMenuId(null);
          }}
          style={{
            display: "block",
            padding: "0.5rem 1rem",
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Delete
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            console.log("Navigating to edit trip:", `/edit-trip/${trip.id}`);
            router.push(`/edit-trip/${trip.id}`);
            setOpenMenuId(null);
          }}
          style={{
            display: "block",
            padding: "0.5rem 1rem",
            width: "100%",
            textAlign: "left",
            background: "none",
            border: "none",
            cursor: "pointer",
          }}
        >
          Edit Trip
        </button>
      </div>
    )}
  </div>
</li>

          ))}
        </ul>
      )}
    </div>
  );
}
