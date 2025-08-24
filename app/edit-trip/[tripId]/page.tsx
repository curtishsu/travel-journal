"use client";

import { useEffect, useState, use } from "react";
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
  trip_type?: string[];
  photo_url?: string;
};

export default function EditTripPage({ params }: { params: Promise<{ tripId: string }> }) {
  const router = useRouter();
  const { tripId } = use(params);
  const [trip, setTrip] = useState<Trip | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    start_date: "",
    end_date: "",
    trip_type: [] as string[],
    photo_url: "",
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchTrip();
  }, [tripId]);

  async function fetchTrip() {
    const { data, error } = await supabase
      .from("trips")
      .select("id, name, start_date, end_date, trip_type, photo_url")
      .eq("id", tripId)
      .single();

    if (error) {
      console.error("Error fetching trip:", error);
      alert("Failed to load trip");
      router.push("/journal");
      return;
    }

    setTrip(data);
    setFormData({
      name: data.name,
      start_date: data.start_date,
      end_date: data.end_date,
      trip_type: data.trip_type || [],
      photo_url: data.photo_url || "",
    });
    setLoading(false);
  }

  async function handlePhotoUpload(event: React.ChangeEvent<HTMLInputElement>) {
    try {
      setUploading(true);

      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${tripId}-${Math.random()}.${fileExt}`;
      const filePath = `trip-photos/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('trip-photos')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data } = supabase.storage
        .from('trip-photos')
        .getPublicUrl(filePath);

      setFormData({ ...formData, photo_url: data.publicUrl });
      alert('Photo uploaded successfully!');
    } catch (error) {
      console.error('Error uploading photo:', error);
      alert('Error uploading photo. Please try again.');
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const { error } = await supabase
      .from("trips")
      .update({
        name: formData.name,
        start_date: formData.start_date,
        end_date: formData.end_date,
        trip_type: formData.trip_type,
        photo_url: formData.photo_url,
      })
      .eq("id", tripId);

    if (error) {
      console.error("Error updating trip:", error);
      alert("Failed to update trip");
    } else {
      alert("Trip updated successfully!");
      router.push("/journal");
    }
    setSaving(false);
  }

  if (loading) {
    return <p style={{ padding: "20px" }}>Loading trip...</p>;
  }

  if (!trip) {
    return <p style={{ padding: "20px" }}>Trip not found</p>;
  }

  return (
    <div style={{ padding: "20px", maxWidth: "600px", margin: "0 auto" }}>
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

      <h1 style={{ marginBottom: "20px" }}>✏️ Edit Trip</h1>

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        <div>
          <label htmlFor="name" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Trip Name:
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label htmlFor="start_date" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Start Date:
          </label>
          <input
            type="date"
            id="start_date"
            value={formData.start_date}
            onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label htmlFor="end_date" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            End Date:
          </label>
          <input
            type="date"
            id="end_date"
            value={formData.end_date}
            onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
            required
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label htmlFor="trip_type" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Trip Type (hashtags):
          </label>
          <input
            type="text"
            id="trip_type"
            value={formData.trip_type.join(" ")}
            onChange={(e) => setFormData({ ...formData, trip_type: e.target.value.split(" ").filter(Boolean) })}
            placeholder="e.g., #Vacation #Work #Adventure"
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
        </div>

        <div>
          <label htmlFor="photo" style={{ display: "block", marginBottom: "5px", fontWeight: "bold" }}>
            Trip Photo:
          </label>
          {formData.photo_url && (
            <div style={{ marginBottom: "10px" }}>
              <img
                src={formData.photo_url}
                alt="Trip photo"
                style={{
                  width: "200px",
                  height: "150px",
                  objectFit: "cover",
                  borderRadius: "8px",
                  border: "1px solid #ddd",
                }}
              />
            </div>
          )}
          <input
            type="file"
            id="photo"
            accept="image/*"
            onChange={handlePhotoUpload}
            disabled={uploading}
            style={{
              width: "100%",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
              fontSize: "16px",
            }}
          />
          {uploading && (
            <div style={{ marginTop: "5px", color: "#666", fontSize: "14px" }}>
              Uploading photo...
            </div>
          )}
          <div style={{ marginTop: "5px", color: "#666", fontSize: "12px" }}>
            Upload a photo to represent this trip (JPG, PNG, etc.)
          </div>
        </div>

        <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
          <button
            type="submit"
            disabled={saving}
            style={{
              padding: "12px 24px",
              backgroundColor: "#0070f3",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: saving ? "not-allowed" : "pointer",
              fontSize: "16px",
              opacity: saving ? 0.6 : 1,
            }}
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button
            type="button"
            onClick={() => router.push("/journal")}
            style={{
              padding: "12px 24px",
              backgroundColor: "#6c757d",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontSize: "16px",
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
