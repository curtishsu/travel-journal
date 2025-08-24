"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@supabase/supabase-js";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

type Trip = {
  id: string;
  start_date: string;
  end_date: string;
  trip_type?: string[];
};

type TripDay = {
  location: string | null;
  date: string;
  highlight: string | null;
  notable_things: string | null;
  is_travel_day: boolean;
  arriving_city: string | null;
};

export default function MyStatsPage() {
  const router = useRouter();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [chartType, setChartType] = useState<'pie' | 'bar'>('bar');

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const { data: trips } = await supabase
      .from("trips")
      .select("id, start_date, end_date, trip_type");

    const { data: tripDays } = await supabase
      .from("trip_days")
      .select("location, date, highlight, notable_things, is_travel_day, arriving_city");

    if (!trips || !tripDays) return;

    // Calculate total travel days
    const totalTravelDays = tripDays.length;

    // Location and country analysis
    const locationCounts: Record<string, number> = {};
    const cities = new Set<string>();
    const countries = new Set<string>();

    tripDays.forEach(day => {
      let city: string | null = null;

      if (day.location) {
        city = day.location;
      } else if (day.is_travel_day && day.arriving_city) {
        city = day.arriving_city;
      }

      if (city) {
        cities.add(city);
        locationCounts[city] = (locationCounts[city] || 0) + 1;
        
        // Extract country from city (assuming format like "City, Country")
        const parts = city.split(',');
        if (parts.length > 1) {
          countries.add(parts[parts.length - 1].trim());
        }
      }
    });

    const mostVisited = Object.entries(locationCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] || "N/A";

    // Trip types analysis
    const tripTypeCounts: Record<string, number> = {};
    trips.forEach(trip => {
      if (trip.trip_type) {
        trip.trip_type.forEach((type: string) => {
          tripTypeCounts[type] = (tripTypeCounts[type] || 0) + 1;
        });
      }
    });

    // Hashtag analysis from trip days
    const hashtagCounts: Record<string, number> = {};
    let totalNotableThings = 0;
    let totalHashtags = 0;
    
    tripDays.forEach(day => {
      if (day.notable_things) {
        totalNotableThings++;
        console.log("Processing notable_things:", day.notable_things, "Type:", typeof day.notable_things);
        
        let hashtags: string[] = [];
        
        // Handle different data types for backward compatibility
        if (typeof day.notable_things === 'string') {
          hashtags = day.notable_things.match(/#\w+/g) || [];
        } else if (Array.isArray(day.notable_things)) {
          // If it's an array (old format), join it and then extract hashtags
          const joinedText = day.notable_things.join(' ');
          hashtags = joinedText.match(/#\w+/g) || [];
        }
        
        console.log("Found hashtags:", hashtags);
        hashtags.forEach((hashtag: string) => {
          hashtagCounts[hashtag] = (hashtagCounts[hashtag] || 0) + 1;
          totalHashtags++;
        });
      }
    });
    
    console.log("Total notable_things processed:", totalNotableThings);
    console.log("Total hashtags found:", totalHashtags);
    console.log("Hashtag counts:", hashtagCounts);

    // Trips per year
    const tripsPerYear: Record<string, number> = {};
    trips.forEach(t => {
      const year = new Date(t.start_date).getFullYear();
      tripsPerYear[year] = (tripsPerYear[year] || 0) + 1;
    });

    // Days per year
    const daysPerYear: Record<string, number> = {};
    tripDays.forEach(d => {
      const year = new Date(d.date).getFullYear();
      daysPerYear[year] = (daysPerYear[year] || 0) + 1;
    });



    setStats({
      totalTrips: trips.length,
      totalTravelDays,
      totalCountries: countries.size,
      totalLocations: cities.size,
      mostVisited,
      tripTypeCounts,
      hashtagCounts,
      tripsPerYear,
      daysPerYear,
    });

    setLoading(false);
  }

  if (loading) return <p style={{ padding: "20px" }}>Loading stats...</p>;

  const tripTypeData = {
    labels: Object.keys(stats.tripTypeCounts),
    datasets: [
      {
        data: Object.values(stats.tripTypeCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 1,
      },
    ],
  };

  const hashtagData = {
    labels: Object.keys(stats.hashtagCounts),
    datasets: [
      {
        data: Object.values(stats.hashtagCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 1,
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const,
      },
    },
  };

  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return (
    <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
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

      <h1 style={{ marginBottom: "30px" }}>📊 My Travel Stats</h1>

      {/* Summary Stats - 2x2 grid with most visited taking full width */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>📈 Summary Stats</h2>
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "1rem"
        }}>
          <StatCard title="Total Trips" value={stats.totalTrips} />
          <StatCard title="Total Days" value={stats.totalTravelDays} />
          <StatCard title="Countries Visited" value={stats.totalCountries} />
          <StatCard title="Locations Visited" value={stats.totalLocations} />
        </div>
        {/* Most visited location takes full width */}
        <div style={{ gridColumn: "1 / -1" }}>
          <StatCard 
            title="Most Visited Location" 
            value={stats.mostVisited} 
            style={{ backgroundColor: "#e3f2fd" }}
          />
        </div>
      </div>

      {/* Trip Types Distribution */}
      <div style={{ marginBottom: "0" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2>🏷️ Trip Types Distribution</h2>
          <div style={{
            display: "flex",
            backgroundColor: "#f0f0f0",
            borderRadius: "6px",
            padding: "2px",
          }}>
            <button
              onClick={() => setChartType('pie')}
              style={{
                padding: "6px 12px",
                backgroundColor: chartType === 'pie' ? "#0070f3" : "transparent",
                color: chartType === 'pie' ? "white" : "#666",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              Pie
            </button>
            <button
              onClick={() => setChartType('bar')}
              style={{
                padding: "6px 12px",
                backgroundColor: chartType === 'bar' ? "#0070f3" : "transparent",
                color: chartType === 'bar' ? "white" : "#666",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "0.9rem",
                transition: "all 0.2s",
              }}
            >
              Bar
            </button>
          </div>
        </div>
        <div style={{ height: "200px", display: "flex", justifyContent: "center" }}>
          {Object.keys(stats.tripTypeCounts).length > 0 ? (
            chartType === 'pie' ? (
              <Pie data={tripTypeData} options={pieOptions} />
            ) : (
              <Bar 
                data={{
                  labels: Object.keys(stats.tripTypeCounts),
                  datasets: [{
                    label: 'Number of Trips',
                    data: Object.values(stats.tripTypeCounts),
                    backgroundColor: '#36A2EB',
                  }]
                }} 
                options={barOptions} 
              />
            )
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No trip types data available</p>
          )}
        </div>
      </div>

      {/* Hashtag Distribution */}
      <div style={{ marginBottom: "0" }}>
        <h2 style={{ marginBottom: "20px", marginTop: "0" }}>🏷️ Hashtag Day Distribution</h2>
        <div style={{ height: "200px", display: "flex", justifyContent: "center" }}>
          {Object.keys(stats.hashtagCounts).length > 0 ? (
            chartType === 'pie' ? (
              <Pie data={hashtagData} options={pieOptions} />
            ) : (
              <Bar 
                data={{
                  labels: Object.keys(stats.hashtagCounts),
                  datasets: [{
                    label: 'Number of Days',
                    data: Object.values(stats.hashtagCounts),
                    backgroundColor: '#FF6384',
                  }]
                }} 
                options={barOptions} 
              />
            )
          ) : (
            <p style={{ textAlign: "center", color: "#666" }}>No hashtag data available</p>
          )}
        </div>
      </div>

      {/* Trends Timeline */}
      <div style={{ marginBottom: "40px" }}>
        <h2 style={{ marginBottom: "20px" }}>📅 Trends Timeline</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
          {/* Trips per Year Chart */}
          <div style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.5rem",
            background: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "300px",
          }}>
            <h3 style={{ margin: "0 0 20px 0", textAlign: "center" }}>Unique Trips per Year</h3>
            <div style={{ height: "250px" }}>
              <Line 
                data={{
                  labels: Object.keys(stats.tripsPerYear).sort(),
                  datasets: [{
                    label: 'Trips',
                    data: Object.keys(stats.tripsPerYear).sort().map(year => stats.tripsPerYear[year]),
                    borderColor: '#FF6384',
                    backgroundColor: 'rgba(255, 99, 132, 0.1)',
                    tension: 0.1,
                    fill: true,
                  }]
                }}
                options={lineOptions}
              />
            </div>
          </div>
          
          {/* Days per Year Chart */}
          <div style={{
            border: "1px solid #ddd",
            borderRadius: "12px",
            padding: "1.5rem",
            background: "white",
            boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
            minHeight: "300px",
          }}>
            <h3 style={{ margin: "0 0 20px 0", textAlign: "center" }}>Days Traveled per Year</h3>
            <div style={{ height: "250px" }}>
              {Object.keys(stats.daysPerYear).length > 0 ? (
                <Line 
                  data={{
                    labels: Object.keys(stats.daysPerYear).sort(),
                    datasets: [{
                      label: 'Days',
                      data: Object.keys(stats.daysPerYear).sort().map(year => stats.daysPerYear[year]),
                      borderColor: '#36A2EB',
                      backgroundColor: 'rgba(54, 162, 235, 0.1)',
                      tension: 0.1,
                      fill: true,
                    }]
                  }}
                  options={lineOptions}
                />
              ) : (
                <p style={{ textAlign: "center", color: "#666", padding: "40px 0" }}>No days data available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, style = {} }: { title: string; value: any; style?: any }) {
  return (
    <div style={{
      border: "1px solid #ddd",
      borderRadius: "6px",
      padding: "0.75rem",
      background: "#f9f9f9",
      textAlign: "center",
      boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
      ...style
    }}>
      <h3 style={{ margin: "0 0 6px 0", fontSize: "0.8rem", color: "#666" }}>{title}</h3>
      <p style={{ fontSize: "1.25rem", margin: 0, fontWeight: "bold", color: "#333" }}>{value}</p>
    </div>
  );
}


