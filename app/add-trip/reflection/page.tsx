"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter, useSearchParams } from "next/navigation";
import HomeButton from "@/components/HomeButton";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function ReflectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const tripId = searchParams.get('tripId');
  
  const [finalReflection, setFinalReflection] = useState("");
  const [whatToDoNextTime, setWhatToDoNextTime] = useState("");
  const [hashtags, setHashtags] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Trip editing state
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [showEditMenu, setShowEditMenu] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  // Store original values for cancel functionality
  const [originalTripName, setOriginalTripName] = useState("");
  const [originalStartDate, setOriginalStartDate] = useState("");
  const [originalEndDate, setOriginalEndDate] = useState("");

  useEffect(() => {
    if (tripId) {
      fetchTripData();
    }
  }, [tripId]);

  async function fetchTripData() {
    if (!tripId) return;
    
    try {
      const { data, error } = await supabase
        .from("trips")
        .select("name, start_date, end_date, trip_type, final_reflection, what_to_do_next_time")
        .eq("id", tripId)
        .single();

      if (data && !error) {
        setTripName(data.name || "");
        setStartDate(data.start_date || "");
        setEndDate(data.end_date || "");
        // Store original values for cancel functionality
        setOriginalTripName(data.name || "");
        setOriginalStartDate(data.start_date || "");
        setOriginalEndDate(data.end_date || "");
        setHashtags(data.trip_type || []);
        setFinalReflection(data.final_reflection || "");
        setWhatToDoNextTime(data.what_to_do_next_time || "");
      }
    } catch (err) {
      console.error("Error fetching trip data:", err);
      // If the columns don't exist yet, we'll just use empty values
    }
  }

  async function saveReflection() {
    if (!tripId) return;
    
    setLoading(true);
    
    try {
      const { error } = await supabase
        .from("trips")
        .update({
          name: tripName,
          start_date: startDate,
          end_date: endDate,
          trip_type: hashtags,
          final_reflection: finalReflection,
          what_to_do_next_time: whatToDoNextTime,
        })
        .eq("id", tripId);

      if (error) {
        console.error("Error saving reflection:", error);
        alert("Error saving reflection. Make sure you've run the database migration.");
        setLoading(false);
        return;
      }

      setLoading(false);
      setEditMode(false);
      router.push("/journal");
    } catch (err) {
      console.error("Error saving reflection:", err);
      alert("Error saving reflection. Make sure you've run the database migration.");
      setLoading(false);
    }
  }

  async function saveTripEdit() {
    if (!tripId) return;
    
    setLoading(true);
    
    try {
      console.log("Saving trip edit:", { tripId, tripName, startDate, endDate });
      
      // Build update object with only fields that have values
      const updateData: any = {};
      
      if (tripName.trim()) {
        updateData.name = tripName.trim();
      }
      if (startDate) {
        updateData.start_date = startDate;
      }
      if (endDate) {
        updateData.end_date = endDate;
      }
      
      // Check if there are any changes to save
      if (Object.keys(updateData).length === 0) {
        alert("No changes to save.");
        setLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from("trips")
        .update(updateData)
        .eq("id", tripId)
        .select();

      if (error) {
        console.error("Error saving trip edit:", error);
        alert(`Error saving trip details: ${error.message}`);
        setLoading(false);
        return;
      }

      console.log("Trip edit saved successfully:", data);
      
      // Update original values to reflect the saved changes
      if (data && data[0]) {
        setOriginalTripName(data[0].name || originalTripName);
        setOriginalStartDate(data[0].start_date || originalStartDate);
        setOriginalEndDate(data[0].end_date || originalEndDate);
      }
      
      setLoading(false);
      setEditMode(false);
      setShowEditMenu(false);
    } catch (err) {
      console.error("Error saving trip edit:", err);
      alert(`Error saving trip details: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
      {/* Home Button */}
      <HomeButton />

      {/* Header with three-dot menu */}
      <div style={{ position: "relative", marginBottom: "20px" }}>
        <h1 style={{ marginTop: "20px", marginRight: "40px" }}>Trip Reflection</h1>
        
        {/* Three-dot menu */}
        <div style={{ position: "absolute", top: "20px", right: "0" }}>
          <button
            onClick={() => setShowEditMenu(!showEditMenu)}
            style={{
              background: "none",
              border: "none",
              fontSize: "1.5rem",
              cursor: "pointer",
              padding: "5px",
            }}
          >
            ⋮
          </button>

          {showEditMenu && (
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
                minWidth: "150px",
              }}
            >
              <button
                onClick={() => {
                  setEditMode(true);
                  setShowEditMenu(false);
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
                Edit Trip Details
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Trip details in edit mode */}
      {editMode && (
        <div style={{ 
          background: "#f8f9fa", 
          padding: "20px", 
          borderRadius: "8px", 
          marginBottom: "30px",
          border: "1px solid #dee2e6"
        }}>
          <h3 style={{ marginTop: 0, marginBottom: "15px" }}>Edit Trip Details</h3>
          
          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Trip Name
            </label>
            <input
              type="text"
              value={tripName}
              onChange={(e) => setTripName(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "15px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              Start Date
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
              End Date
            </label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              style={{
                width: "100%",
                padding: "8px",
                border: "1px solid #ddd",
                borderRadius: "4px",
              }}
            />
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <button
              onClick={() => {
                // Reset to original values when canceling
                setTripName(originalTripName);
                setStartDate(originalStartDate);
                setEndDate(originalEndDate);
                setEditMode(false);
              }}
              style={{
                padding: "8px 16px",
                backgroundColor: "#6c757d",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={saveTripEdit}
              disabled={loading}
              style={{
                padding: "8px 16px",
                backgroundColor: "#28a745",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: loading ? "not-allowed" : "pointer",
                opacity: loading ? 0.7 : 1,
              }}
            >
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      )}



      <p style={{ color: "#666", marginBottom: "30px" }}>
        Take a moment to reflect on your trip and plan for future adventures.
      </p>

      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Final Reflection
        </label>
        <textarea
          value={finalReflection}
          onChange={(e) => setFinalReflection(e.target.value)}
          placeholder="What were your overall thoughts about this trip? What made it special?"
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          What to Do Next Time
        </label>
        <textarea
          value={whatToDoNextTime}
          onChange={(e) => setWhatToDoNextTime(e.target.value)}
          placeholder="What would you do differently next time? Any tips for future trips?"
          style={{
            width: "100%",
            minHeight: "120px",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            resize: "vertical",
            fontFamily: "inherit",
          }}
        />
      </div>

      <div style={{ marginBottom: "30px" }}>
        <label style={{ display: "block", marginBottom: "8px", fontWeight: "bold" }}>
          Trip Hashtags
        </label>
        <input
          type="text"
          placeholder="#Vacation #Work #Adventure"
          value={hashtags.join(" ")}
          onChange={(e) =>
            setHashtags(e.target.value.split(" ").filter(Boolean))
          }
          style={{
            width: "100%",
            padding: "12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
          }}
        />
        <p style={{ fontSize: "14px", color: "#666", marginTop: "4px" }}>
          Separate hashtags with spaces
        </p>
      </div>

      <div style={{ display: "flex", gap: "15px" }}>
        <button
          onClick={() => router.push("/journal")}
          style={{
            padding: "12px 20px",
            backgroundColor: "#6c757d",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            flex: 1,
          }}
        >
          Back to Journal
        </button>
        <button
          onClick={saveReflection}
          disabled={loading}
          style={{
            padding: "12px 20px",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: loading ? "not-allowed" : "pointer",
            opacity: loading ? 0.7 : 1,
            flex: 1,
          }}
        >
          {loading ? "Saving..." : "Save Reflection"}
        </button>
      </div>
    </div>
  );
}
