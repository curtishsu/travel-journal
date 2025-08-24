"use client";
import { useRouter } from "next/navigation";

export default function HomeButton() {
  const router = useRouter();

  return (
    <button
      onClick={() => router.push("/")}
      style={{
        marginBottom: "20px",
        padding: "8px 14px",
        background: "#e0e0e0",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
        fontSize: "14px",
      }}
    >
      🏠 Home
    </button>
  );
}
