"use client";

import { useState } from "react";

type Location = {
  name: string;
  country: string;
  lat: number;
  lng: number;
};

export default function LocationAutocomplete({
  onSelect,
  placeholder,
  value: initialValue = "",
}: {
  onSelect: (location: Location) => void;
  placeholder?: string;
  value?: string;
}) {
  const [query, setQuery] = useState(initialValue);
  const [results, setResults] = useState<any[]>([]);

  async function handleSearch(value: string) {
    setQuery(value);

    if (value.length < 2) {
      setResults([]);
      return;
    }

    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
        value
      )}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN}&autocomplete=true&types=place`
    );
    const data = await res.json();

    setResults(data.features || []);
  }

  function handleSelect(place: any) {
    const name = place.text;

    let country = "";
    if (place.context && Array.isArray(place.context)) {
      const countryContext = place.context.find((c: any) =>
        c.id.startsWith("country")
      );
      if (countryContext) {
        country = countryContext.text;
      }
    }

    onSelect({
      name,
      country,
      lat: place.center[1],
      lng: place.center[0],
    });

    setQuery(name); // keep selection in box
    setResults([]);
  }

  return (
    <div style={{ position: "relative" }}>
      <input
        type="text"
        value={query}
        placeholder={placeholder || "Search for a location"}
        onChange={(e) => handleSearch(e.target.value)}
        style={{
          padding: "0.5rem",
          width: "100%",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      {results.length > 0 && (
        <ul
          style={{
            position: "absolute",
            top: "100%",
            left: 0,
            right: 0,
            background: "white",
            border: "1px solid #ccc",
            borderTop: "none",
            listStyle: "none",
            margin: 0,
            padding: 0,
            zIndex: 1000,
            maxHeight: "200px",
            overflowY: "auto",
          }}
        >
          {results.map((place) => (
            <li
              key={place.id}
              onClick={() => handleSelect(place)}
              style={{
                padding: "0.5rem",
                cursor: "pointer",
                borderBottom: "1px solid #eee",
              }}
            >
              {place.place_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
