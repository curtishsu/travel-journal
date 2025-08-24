"use client";

import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";
import HomeButton from "@/components/HomeButton";
import LocationAutocomplete from "@/components/LocationAutocomplete";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function DayClientPage({ tripId, dayNumber }: { tripId: string; dayNumber: string }) {
  const router = useRouter();

  // Trip info
  const [tripName, setTripName] = useState("");
  const [tripDates, setTripDates] = useState<{ day: number; date: string }[]>([]);
  const [tripDate, setTripDate] = useState("");

  // Travel day toggle
  const [isTravelDay, setIsTravelDay] = useState(false);

  // Regular day location
  const [location, setLocation] = useState("");
  const [country, setCountry] = useState("");
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  // Travel day locations
  const [leavingCity, setLeavingCity] = useState("");
  const [leavingCountry, setLeavingCountry] = useState("");
  const [leavingLat, setLeavingLat] = useState<number | null>(null);
  const [leavingLng, setLeavingLng] = useState<number | null>(null);

  const [arrivingCity, setArrivingCity] = useState("");
  const [arrivingCountry, setArrivingCountry] = useState("");
  const [arrivingLat, setArrivingLat] = useState<number | null>(null);
  const [arrivingLng, setArrivingLng] = useState<number | null>(null);

  // New fields
  const [highlight, setHighlight] = useState("");
  const [journalEntry, setJournalEntry] = useState("");
  const [notableThings, setNotableThings] = useState("");
  // Photo functionality temporarily disabled
  // const [photos, setPhotos] = useState<string[]>([]);
  // const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  // Fetch trip + day
  useEffect(() => {
    fetchTrip();
    fetchDay();
  }, [tripId, dayNumber]);

  async function fetchTrip() {
    const { data } = await supabase
      .from("trips")
      .select("name, start_date, end_date")
      .eq("id", tripId)
      .single();

    if (data) {
      setTripName(data.name);
      
      // Fix timezone issues by parsing dates as local dates
      const startDate = new Date(data.start_date + 'T00:00:00');
      const endDate = new Date(data.end_date + 'T00:00:00');
      
      const days: { day: number; date: string }[] = [];
      let current = new Date(startDate);
      let dayCounter = 1;
      
      while (current <= endDate) {
        days.push({ 
          day: dayCounter, 
          date: current.toLocaleDateString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
          })
        });
        current.setDate(current.getDate() + 1);
        dayCounter++;
      }
      
      setTripDates(days);
      const offset = parseInt(dayNumber) - 1;
      if (days[offset]) setTripDate(days[offset].date);
    }
  }

  async function fetchDay() {
    try {
      const { data, error } = await supabase
        .from("trip_days")
        .select("trip_id, day_number, date, location, country, lat, lng, is_travel_day, leaving_city, leaving_country, leaving_lat, leaving_lng, arriving_city, arriving_country, arriving_lat, arriving_lng, highlight, journal_entry, notable_things")
        .eq("trip_id", tripId)
        .eq("day_number", parseInt(dayNumber))
        .maybeSingle(); // Use maybeSingle instead of single to handle no data gracefully

      if (error) {
        console.error("Error fetching day:", error);
        return;
      }

      if (data) {
        setLocation(data.location || "");
        setCountry(data.country || "");
        setLat(data.lat || null);
        setLng(data.lng || null);

        setLeavingCity(data.leaving_city || "");
        setLeavingCountry(data.leaving_country || "");
        setLeavingLat(data.leaving_lat || null);
        setLeavingLng(data.leaving_lng || null);

        setArrivingCity(data.arriving_city || "");
        setArrivingCountry(data.arriving_country || "");
        setArrivingLat(data.arriving_lat || null);
        setArrivingLng(data.arriving_lng || null);

        setIsTravelDay(data.is_travel_day || false);
        setHighlight(data.highlight || "");
        setJournalEntry(data.journal_entry || "");
        setNotableThings(data.notable_things || "");
        // setPhotos(Array.isArray(data.photos) ? data.photos : []);
        // console.log("Loaded photos:", data.photos);
      }
      // If no data exists, the form will remain empty (which is correct for a new day)
    } catch (err) {
      console.error("Error in fetchDay:", err);
      // Continue with empty form if there's an error
    }
  }

  // Photo upload - temporarily disabled
  /*
  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    console.log("Photo upload triggered");
    if (!e.target.files || e.target.files.length === 0) {
      console.log("No files selected");
      return;
    }
    
    try {
      const file = e.target.files[0];
      console.log("File selected:", file.name, "Type:", file.type, "Size:", file.size);
      
      // Check file type
      const isHeic = file.type === 'image/heic' || file.type === 'image/heif' || file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
      
      if (isHeic) {
        // Offer conversion options for HEIC files
        const convertChoice = confirm(
          `HEIC file detected. Would you like to:\n\n` +
          `✅ OK - Convert this HEIC file online (opens converter)\n` +
          `❌ Cancel - Use camera to take a new JPG photo instead\n\n` +
          `Note: Online conversion is secure and doesn't store your photos.`
        );
        
        if (convertChoice) {
          // Open online HEIC converter in new tab
          window.open('https://heictojpg.com/', '_blank');
          alert('After converting your HEIC to JPG online, come back and upload the converted file.');
        } else {
          alert('Tip: Use the "📷 Take Photo" button above to capture photos in JPG format directly.');
        }
        return;
      }
      
      if (!allowedTypes.includes(file.type)) {
        alert(`File type "${file.type}" is not supported. Please use JPG, PNG, GIF, or WebP files.`);
        return;
      }
      
      // Check file size (limit to 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File is too large. Please use files smaller than 10MB.");
        return;
      }
      
      // File is already validated and ready to process
      let fileToProcess = file;
      
      const fileName = `${tripId}-${dayNumber}-${Date.now()}-${fileToProcess.name}`;
      console.log("Processing file:", fileName);
      
      // Convert image to base64 and store directly
      const reader = new FileReader();
      reader.onload = function(e) {
        const base64String = e.target?.result as string;
        console.log("Photo converted to base64, length:", base64String.length);
        setPhotos((prev) => [...prev, base64String]);
        alert("Photo uploaded successfully!");
      };
      reader.onerror = function() {
        console.error("Error reading file");
        alert("Error reading file. Please try again.");
      };
      reader.readAsDataURL(fileToProcess);
    } catch (err) {
      console.error("Upload error:", err);
      alert("Failed to upload photo. Please try again.");
    }
  }
  */

  // Save day
  async function saveDay() {
      // Photo debugging commented out
      // console.log("Saving day with photos:", photos.length, "photos");
      // console.log("Photos array type:", typeof photos);
      // console.log("Photos array:", photos);
      // console.log("Photos array is array:", Array.isArray(photos));
      // console.log("Photos value being sent:", photos.length > 0 ? photos : []);
    try {
      // Build the data object (photos field completely excluded)
      const dayData = {
        trip_id: tripId,
        day_number: parseInt(dayNumber),
        date: tripDate,
        location: !isTravelDay ? location : null,
        country: !isTravelDay ? country : null,
        lat,
        lng,
        is_travel_day: isTravelDay,
        leaving_city: isTravelDay ? leavingCity : null,
        leaving_country: isTravelDay ? leavingCountry : null,
        leaving_lat: isTravelDay ? leavingLat : null,
        leaving_lng: isTravelDay ? leavingLng : null,
        arriving_city: isTravelDay ? arrivingCity : null,
        arriving_country: isTravelDay ? arrivingCountry : null,
        arriving_lat: isTravelDay ? arrivingLat : null,
        arriving_lng: isTravelDay ? arrivingLng : null,
        highlight,
        journal_entry: journalEntry,
        notable_things: notableThings,
      };
      
      // Photos field commented out
      // dayData.photos = Array.isArray(photos) && photos.length > 0 ? photos : [];
      
      // console.log("Final photos value:", dayData.photos);
      // console.log("Final photos type:", typeof dayData.photos);
      // console.log("Final photos is array:", Array.isArray(dayData.photos));
      
      // Try deleting and reinserting to completely avoid any existing malformed data
      console.log("Attempting to save day data:", dayData);
      console.log("notable_things value:", notableThings);
      console.log("notable_things type:", typeof notableThings);
      
      // First delete any existing record
      await supabase
        .from("trip_days")
        .delete()
        .eq("trip_id", tripId)
        .eq("day_number", parseInt(dayNumber));
      
      // Then insert fresh data (this completely avoids any existing malformed photos data)
      const { error } = await supabase
        .from("trip_days")
        .insert([dayData]);

      // console.log("Saving photos:", photos);
      if (error) {
        console.error("Error saving day:", error);
        console.error("Full error details:", JSON.stringify(error, null, 2));
        alert(`Error saving day: ${error.message}. Check console for details.`);
        return;
      } else {
        // console.log("Day saved successfully!");
        alert("Day saved successfully!");
      }

      const currentDay = parseInt(dayNumber);
      if (currentDay < tripDates.length) {
        router.push(`/trip/${tripId}/day/${currentDay + 1}`);
      } else {
        // Redirect to reflection page as the final step
        router.push(`/add-trip/reflection?tripId=${tripId}`);
      }
    } catch (err) {
      console.error("Error in saveDay:", err);
      alert("Error saving day. Please check your database setup.");
    }
  }

  return (
    <div style={{ padding: "20px", maxWidth: "900px", margin: "0 auto" }}>
      <HomeButton />

      {/* Day navigation */}
      <div style={{ display: "flex", overflowX: "auto", whiteSpace: "nowrap", marginBottom: "20px" }}>
        {tripDates.map((d) => (
          <button
            key={d.day}
            style={{
              padding: "10px 15px",
              marginRight: "10px",
              background: d.day.toString() === dayNumber ? "#0070f3" : "#f0f0f0",
              color: d.day.toString() === dayNumber ? "white" : "black",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
            }}
            onClick={() => router.push(`/trip/${tripId}/day/${d.day}`)}
          >
            Day {d.day}
          </button>
        ))}
        <button
          style={{
            padding: "10px 15px",
            marginRight: "10px",
            background: "#28a745",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
          }}
          onClick={() => router.push(`/add-trip/reflection?tripId=${tripId}`)}
        >
          Reflection
        </button>
      </div>

      <h1>Day {dayNumber} – {tripName}</h1>
      <p>Date: {tripDate}</p>

      {/* Location(s) */}
      {!isTravelDay ? (
        <div style={{ marginBottom: "20px" }}>
          <label>Location</label>
          <LocationAutocomplete
            onSelect={(place) => {
              setLocation(place.name);
              setCountry(place.country);
              setLat(place.lat);
              setLng(place.lng);
            }}
            placeholder={location || "Search for a location"}
          />
        </div>
      ) : (
        <>
          <div style={{ marginBottom: "20px" }}>
            <label>Leaving City</label>
            <LocationAutocomplete
              onSelect={(place) => {
                setLeavingCity(place.name);
                setLeavingCountry(place.country);
                setLeavingLat(place.lat);
                setLeavingLng(place.lng);
              }}
              placeholder={leavingCity || "Search for a leaving city"}
            />
          </div>
          <div style={{ marginBottom: "20px" }}>
            <label>Arriving City</label>
            <LocationAutocomplete
              onSelect={(place) => {
                setArrivingCity(place.name);
                setArrivingCountry(place.country);
                setArrivingLat(place.lat);
                setArrivingLng(place.lng);
              }}
              placeholder={arrivingCity || "Search for an arriving city"}
            />
          </div>
        </>
      )}

      {/* Travel toggle */}
      <label style={{ display: "block", marginBottom: "20px" }}>
        <input
          type="checkbox"
          checked={isTravelDay}
          onChange={(e) => setIsTravelDay(e.target.checked)}
        />{" "}
        Travel Day?
      </label>

      {/* Highlight */}
      <div style={{ marginBottom: "20px" }}>
        <label>Highlight</label>
        <input
          type="text"
          value={highlight}
          placeholder="Enter highlight"
          onChange={(e) => setHighlight(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {/* Journal entry */}
      <div style={{ marginBottom: "20px" }}>
        <label>Journal Entry</label>
        <textarea
          value={journalEntry}
          placeholder="Write your journal entry here..."
          onChange={(e) => setJournalEntry(e.target.value)}
          rows={8}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {/* Notable things */}
      <div style={{ marginBottom: "20px" }}>
        <label>Notable Things (hashtags)</label>
        <input
          type="text"
          placeholder="#Food #Nature #Vibes"
          value={notableThings}
          onChange={(e) => setNotableThings(e.target.value)}
          style={{ width: "100%", padding: "8px" }}
        />
      </div>

      {/* Photos - temporarily disabled */}
      <div style={{ 
        marginBottom: "30px", 
        padding: "20px", 
        backgroundColor: "#f8f9fa", 
        borderRadius: "8px",
        textAlign: "center",
        color: "#6c757d"
      }}>
        <div style={{ fontSize: "24px", marginBottom: "8px" }}>📸</div>
        <div style={{ fontSize: "14px" }}>
          Photo functionality temporarily disabled
        </div>
      </div>

      {/* Save */}
      <button
        onClick={saveDay}
        style={{
          padding: "12px 20px",
          backgroundColor: "#0070f3",
          color: "white",
          border: "none",
          borderRadius: "8px",
          cursor: "pointer",
        }}
      >
        Save Day
      </button>
    </div>
  );
}
