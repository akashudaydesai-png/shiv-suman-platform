import { QuizMarksPage } from "@/components/student-profile-modules";

export default function StudentQuizPage({ params }: { params: { id: string } }) {
  return <QuizMarksPage studentId={params.id} />;
}
