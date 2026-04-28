import { Injectable } from "@nestjs/common";

@Injectable()
export class BlueprintService {
  getBlueprint() {
    return {
      product: "Shiv Suman Driving School ERP",
      stack: {
        frontend: ["Next.js", "React", "TypeScript", "Tailwind CSS", "shadcn/ui"],
        backend: ["NestJS", "Prisma", "PostgreSQL", "Redis", "BullMQ"],
        integrations: ["Razorpay", "Zoho/SMS/WhatsApp", "S3/R2", "Fleet vendor API"]
      },
      roles: [
        "SUPER_ADMIN",
        "ADMIN",
        "BRANCH_ADMIN",
        "RECEPTIONIST",
        "SUPERVISOR",
        "TRAINER",
        "STUDENT",
        "ACCOUNTANT"
      ],
      modules: [
        "Public website",
        "Role dashboards",
        "Enquiry",
        "Advance booking",
        "Admission",
        "Plans and installments",
        "Payments and receipts",
        "RTO work",
        "DL practice and test events",
        "Leave automation",
        "Training sessions",
        "Fleet and camera evidence",
        "Notifications",
        "Reports and exports"
      ]
    };
  }
}
