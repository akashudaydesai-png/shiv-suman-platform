import { Injectable } from "@nestjs/common";

const adminSections = [
  "Branch selector",
  "Live batch/session status",
  "Running sessions",
  "Car location/status",
  "Trainer/student/car mapping",
  "Income and expense",
  "Pending RTO work",
  "Own student license pending work",
  "Enquiry follow-up",
  "Advance booking queue",
  "Today leave",
  "Today free slots",
  "Staff performance",
  "Fleet/camera alerts",
  "Delete requests"
];

const receptionSections = [
  "Enquiry",
  "Advance booking",
  "Admission process",
  "Student documents",
  "Internal student RTO work",
  "External customer RTO work",
  "Today leave",
  "Today free slots",
  "Pending document tasks",
  "DL test document readiness"
];

const supervisorSections = [
  "Branch student list",
  "Today leave students",
  "DL practice list",
  "DL test event calendar",
  "Ready/not-ready students",
  "Documents needed for DL test",
  "Trainer leave application status",
  "Pending practice feedback"
];

@Injectable()
export class DashboardService {
  getDashboard(role: string) {
    const normalizedRole = role.toUpperCase();
    if (normalizedRole === "ADMIN" || normalizedRole === "SUPER_ADMIN") {
      return { role: normalizedRole, sections: adminSections, evidenceAccess: true };
    }
    if (normalizedRole === "RECEPTIONIST") {
      return { role: normalizedRole, sections: receptionSections, evidenceAccess: false };
    }
    if (normalizedRole === "SUPERVISOR") {
      return { role: normalizedRole, sections: supervisorSections, evidenceAccess: false };
    }
    return { role: normalizedRole, sections: ["My tasks", "Notifications", "Profile"], evidenceAccess: false };
  }
}
