import { AttendanceRegisterPage } from "@/components/student-profile-modules";

export default function StudentAttendancePage({ params }: { params: { id: string } }) {
  return <AttendanceRegisterPage studentId={params.id} />;
}
