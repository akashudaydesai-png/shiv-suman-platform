import { redirect } from "next/navigation";

export default function NewStudentPage() {
  redirect("/dashboard/students?mode=new");
}

