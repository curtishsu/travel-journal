import DayClientPage from "./DayClientPage";

export default async function Page({
  params,
}: {
  params: Promise<{ tripId: string; dayNumber: string }>;
}) {
  // ✅ Await params before using
  const { tripId, dayNumber } = await params;

  return <DayClientPage tripId={tripId} dayNumber={dayNumber} />;
}
