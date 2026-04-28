import { VideoLecturesPage } from "@/components/student-profile-modules";

export default function StudentVideoLecturesPage({ params }: { params: { id: string } }) {
  return <VideoLecturesPage studentId={params.id} />;
}
