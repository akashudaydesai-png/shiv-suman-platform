import { StudentFeedbackPage } from "@/components/student-profile-modules";

export default function StudentFeedbackRoutePage({ params }: { params: { id: string } }) {
  return <StudentFeedbackPage studentId={params.id} />;
}
