export const SETTINGS_KEYS = [
  "branch_slot_engine",
  "plan_installment_templates",
  "automation_center",
  "role_permission_matrix",
  "messaging_templates",
  "document_compliance",
  "evidence_privacy_policy",
  "financial_controls",
  "rto_service_catalog",
  "audit_alert_rules"
] as const;

export type SettingsKey = (typeof SETTINGS_KEYS)[number];

export const settingsDefaults: Record<SettingsKey, unknown> = {
  branch_slot_engine: {
    slotDurationMinutes: 30,
    breakRules: [{ start: "13:00", end: "14:00", label: "Lunch Break" }],
    weeklyHolidays: ["SUNDAY"],
    autoRebuildSlotsOnBranchTimingChange: true,
    leadTimeMinutes: 0
  },
  plan_installment_templates: {
    templates: [
      {
        name: "STANDARD_TRAINING",
        requiredPurposes: ["TRAINING", "LEARNING_LICENSE", "PERMANENT_LICENSE", "LAST_PAYMENT"],
        allowOneTime: true
      }
    ]
  },
  automation_center: {
    workflows: [
      { trigger: "admission.created", active: true, channels: ["WHATSAPP"] },
      { trigger: "payment.success", active: true, channels: ["SMS", "WHATSAPP"] },
      { trigger: "dl_test.event_created", active: true, channels: ["WHATSAPP"] }
    ],
    retryPolicy: { maxRetries: 3, retryDelayMinutes: 5 },
    failureAlertEmails: []
  },
  role_permission_matrix: {
    branchScopedByDefault: true,
    permissions: [
      { role: "ADMIN", canViewFleetCamera: true, canDelete: true },
      { role: "SUPERVISOR", canViewFleetCamera: false, canDelete: false },
      { role: "RECEPTIONIST", canViewFleetCamera: false, canDelete: false }
    ]
  },
  messaging_templates: {
    channels: ["SMS", "WHATSAPP", "EMAIL"],
    languages: ["EN", "MR", "HI"],
    templates: [
      {
        event: "payment.link_created",
        language: "EN",
        body: "Dear {{name}}, your payment link is {{payment_link}}."
      }
    ]
  },
  document_compliance: {
    rules: [
      {
        context: "STUDENT_ADMISSION",
        requiredDocs: ["PHOTO", "SIGNATURE", "AADHAAR"],
        hardBlock: true
      }
    ]
  },
  evidence_privacy_policy: {
    fleetRetentionDays: 180,
    cameraRetentionDays: 90,
    adminOnlyEvidenceView: true,
    watermarkDownloads: true,
    allowEvidenceDownload: false
  },
  financial_controls: {
    receiptPrefix: "SSM",
    receiptSequencePad: 6,
    refundApprovalRequired: true,
    allowOneTimePayments: true,
    defaultCurrency: "INR"
  },
  rto_service_catalog: {
    defaultSlaDays: 7,
    statuses: ["NEW", "DOCUMENTS_RECEIVED", "DOCUMENTS_READY", "SUBMITTED_TO_RTO", "COMPLETED", "DELIVERED"],
    requireFeeStructure: true
  },
  audit_alert_rules: {
    alerts: [
      { event: "branch_timing_changed", active: true, severity: "HIGH" },
      { event: "session_missed", active: true, severity: "MEDIUM" },
      { event: "payment_webhook_failed", active: true, severity: "HIGH" }
    ],
    inAppNotifications: true
  }
};
