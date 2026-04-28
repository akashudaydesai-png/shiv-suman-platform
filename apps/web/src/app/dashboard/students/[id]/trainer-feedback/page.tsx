import { TrainerFeedbackPage } from "@/components/student-profile-modules";

export default function StudentTrainerFeedbackPage({ params }: { params: { id: string } }) {
  return <TrainerFeedbackPage studentId={params.id} />;
}
