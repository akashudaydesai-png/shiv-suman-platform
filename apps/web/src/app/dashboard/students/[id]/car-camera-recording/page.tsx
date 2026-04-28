import { CarCameraRecordingPage } from "@/components/student-profile-modules";

export default function StudentCarCameraRecordingPage({ params }: { params: { id: string } }) {
  return <CarCameraRecordingPage studentId={params.id} />;
}
