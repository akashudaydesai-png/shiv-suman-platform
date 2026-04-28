export const roles = [
  "SUPER_ADMIN",
  "ADMIN",
  "BRANCH_ADMIN",
  "RECEPTIONIST",
  "SUPERVISOR",
  "TRAINER",
  "STUDENT",
  "ACCOUNTANT"
] as const;

export type Role = (typeof roles)[number];

export const systemEvents = [
  "admission.created",
  "payment.link_created",
  "payment.success",
  "installment.permanent_license_paid",
  "learning_license.entered",
  "learning_license.eligible_after_30_days",
  "student.leave_created",
  "trainer.leave_requested",
  "trainer.leave_approved",
  "trainer.leave_rejected",
  "slot.freed",
  "session.started",
  "session.completed",
  "dl_test.event_created",
  "dl_test.documents_ready",
  "rto_case.status_changed",
  "blog.published",
  "delete.requested",
  "delete.approved"
] as const;

export type SystemEvent = (typeof systemEvents)[number];

export const slotStatuses = [
  "AVAILABLE",
  "ENQUIRY_QUEUE",
  "ADVANCE_BOOKED",
  "ADMITTED",
  "ON_LEAVE_TODAY",
  "RUNNING",
  "COMPLETED",
  "CANCELLED"
] as const;

export type SlotStatus = (typeof slotStatuses)[number];

export const rtoStatuses = [
  "NEW",
  "PAYMENT_PENDING",
  "DOCUMENTS_RECEIVED",
  "DOCUMENTS_READY",
  "SUBMITTED_TO_RTO",
  "COMPLETED",
  "DELIVERED",
  "ON_HOLD"
] as const;

export type RtoStatus = (typeof rtoStatuses)[number];
