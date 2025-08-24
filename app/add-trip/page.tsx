"use client";

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import HomeButton from "@/components/HomeButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AddTripPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [tripType, setTripType] = useState<string[]>([]);

  async function createTrip() {
    const { data, error } = await supabase.from("trips").insert([
      {
        name,
        start_date: startDate,
        end_date: endDate,
        trip_type: tripType,
      },
    ]).select();

    if (error) {
      console.error("Error creating trip:", error);
      alert("Error creating trip");
      return;
    }

    // Redirect to the first day of the trip
    if (data && data[0]) {
      router.push(`/trip/${data[0].id}/day/1`);
    } else {
      router.push("/journal");
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Home Button */}
      <HomeButton />

      <h1 style={{ marginTop: "20px" }}>Add New Trip</h1>

      <label>Trip Name</label>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <label>Start Date</label>
      <input
        type="date"
        value={startDate}
        onChange={(e) => setStartDate(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <label>End Date</label>
      <input
        type="date"
        value={endDate}
        onChange={(e) => setEndDate(e.target.value)}
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <label>Trip Type (hashtags)</label>
      <input
        type="text"
        placeholder="#Vacation #Work"
        value={tripType.join(" ")}
        onChange={(e) =>
          setTripType(e.target.value.split(" ").filter(Boolean))
        }
        style={{ width: "100%", marginBottom: "10px", padding: "8px" }}
      />

      <button
        onClick={createTrip}
        style={{
          padding: "10px 15px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Save Trip
      </button>
    </div>
  );
}
