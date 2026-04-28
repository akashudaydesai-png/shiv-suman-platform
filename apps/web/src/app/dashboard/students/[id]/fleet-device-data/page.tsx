import { FleetDeviceDataPage } from "@/components/student-profile-modules";

export default function StudentFleetDeviceDataPage({ params }: { params: { id: string } }) {
  return <FleetDeviceDataPage studentId={params.id} />;
}
