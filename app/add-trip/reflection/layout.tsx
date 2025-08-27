// app/add-trip/reflection/layout.tsx
import { Suspense } from "react";

export default function ReflectionLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={<div className="p-6">Loading…</div>}>
      {children}
    </Suspense>
  );
}
