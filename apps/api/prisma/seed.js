const { PrismaClient, RoleCode } = require("@prisma/client");
const { pbkdf2Sync, randomBytes } = require("node:crypto");

const prisma = new PrismaClient();

function hashPassword(password) {
  const iterations = 120000;
  const salt = randomBytes(16).toString("hex");
  const hash = pbkdf2Sync(password, salt, iterations, 64, "sha512").toString("hex");
  return `pbkdf2$${iterations}$${salt}$${hash}`;
}

const branches = [
  { name: "Rankala", code: "RANKALA", startTime: "07:00", endTime: "20:00" },
  { name: "Shahu Stadium", code: "SHAHU_STADIUM", startTime: "07:00", endTime: "20:00" },
  { name: "Takala", code: "TAKALA", startTime: "07:00", endTime: "20:00" }
];

const plans = [
  {
    name: "12 Days Only",
    durationDays: 12,
    vehicleClasses: ["LMV"],
    totalAmount: 2500,
    installments: [{ sequence: 1, purpose: "Training fee", amount: 2500 }]
  },
  {
    name: "12 Days With 4 Wheeler License",
    durationDays: 12,
    vehicleClasses: ["LMV"],
    totalAmount: 5000,
    installments: [
      { sequence: 1, purpose: "Training fee", amount: 2500 },
      { sequence: 2, purpose: "Learning license", amount: 300, automationEvent: "learning_license.payment_received" },
      { sequence: 3, purpose: "Permanent license", amount: 1200, automationEvent: "installment.permanent_license_paid" },
      { sequence: 4, purpose: "License last payment", amount: 1000 }
    ]
  },
  {
    name: "15 Days With 4W + 2W License",
    durationDays: 15,
    vehicleClasses: ["LMV", "MCWG"],
    totalAmount: 6300,
    installments: [
      { sequence: 1, purpose: "Training fee", amount: 2500 },
      { sequence: 2, purpose: "Learning license", amount: 800, automationEvent: "learning_license.payment_received" },
      { sequence: 3, purpose: "Training fee", amount: 500 },
      { sequence: 4, purpose: "Permanent license", amount: 1200, automationEvent: "installment.permanent_license_paid" },
      { sequence: 5, purpose: "License last payment", amount: 1200 }
    ]
  },
  {
    name: "26 Days With 4W + 2W License",
    durationDays: 26,
    vehicleClasses: ["LMV", "MCWG"],
    totalAmount: 8300,
    installments: [
      { sequence: 1, purpose: "Training fee", amount: 2500 },
      { sequence: 2, purpose: "Learning license", amount: 800, automationEvent: "learning_license.payment_received" },
      { sequence: 3, purpose: "Training fee", amount: 2500 },
      { sequence: 4, purpose: "Permanent license", amount: 1200, automationEvent: "installment.permanent_license_paid" },
      { sequence: 5, purpose: "License last payment", amount: 1200 }
    ]
  }
];

const rtoServices = [
  "2 wheeler license",
  "4 wheeler license",
  "Duplicate license",
  "Address change in DL",
  "Name change in DL",
  "Renewal of DL",
  "2 wheeler Renewal of RC",
  "4 wheeler Renewal of RC",
  "Transfer of ownership of 2 wheeler",
  "Transfer of ownership of 4 wheeler",
  "Duplicate of RC"
];

const notificationTemplates = [
  ["Admission confirmation", "admission.created", "WHATSAPP", "Welcome {{studentName}}. Your admission is created. Receipt: {{receiptLink}} App: {{appLink}} User ID: {{userId}}"],
  ["Payment link", "payment.link_created", "SMS", "Your Shiv Suman payment link is {{paymentLink}}"],
  ["Receipt generated", "payment.success", "WHATSAPP", "Payment received. Receipt: {{receiptLink}} Remaining: {{remainingAmount}}"],
  ["DL appointment", "dl_test.documents_ready", "WHATSAPP", "Your DL appointment is on {{appointmentDate}} at {{appointmentTime}}. Bring {{documents}}."]
];

async function seed() {
  for (const branch of branches) {
    await prisma.branch.upsert({
      where: { code: branch.code },
      update: branch,
      create: branch
    });
  }

  await prisma.user.upsert({
    where: { email: "admin@shivsuman.local" },
    update: {
      fullName: "Akash Admin",
      role: RoleCode.ADMIN,
      accessStatus: "ACTIVE"
    },
    create: {
      email: "admin@shivsuman.local",
      phone: "9999999999",
      passwordHash: hashPassword("Akash@1500"),
      fullName: "Akash Admin",
      role: RoleCode.ADMIN,
      accessStatus: "ACTIVE"
    }
  });

  const rankala = await prisma.branch.findUnique({ where: { code: "RANKALA" } });

  const trainer = await prisma.user.upsert({
    where: { email: "trainer@shivsuman.local" },
    update: {
      fullName: "Senior Trainer",
      role: RoleCode.TRAINER,
      accessStatus: "ACTIVE",
      branchId: rankala?.id
    },
    create: {
      email: "trainer@shivsuman.local",
      phone: "8888888888",
      passwordHash: hashPassword("Trainer@123"),
      fullName: "Senior Trainer",
      role: RoleCode.TRAINER,
      accessStatus: "ACTIVE",
      branchId: rankala?.id
    }
  });

  await prisma.staffProfile.upsert({
    where: { userId: trainer.id },
    update: { designation: "TRAINER" },
    create: {
      userId: trainer.id,
      employeeCode: "EMP-TRAINER-001",
      designation: "TRAINER"
    }
  });

  for (const plan of plans) {
    const savedPlan = await prisma.plan.upsert({
      where: { name: plan.name },
      update: {
        durationDays: plan.durationDays,
        vehicleClasses: plan.vehicleClasses,
        totalAmount: plan.totalAmount,
        active: true
      },
      create: {
        name: plan.name,
        durationDays: plan.durationDays,
        vehicleClasses: plan.vehicleClasses,
        totalAmount: plan.totalAmount
      }
    });

    await prisma.planInstallment.deleteMany({ where: { planId: savedPlan.id } });
    for (const installment of plan.installments) {
      await prisma.planInstallment.create({
        data: {
          planId: savedPlan.id,
          sequence: installment.sequence,
          purpose: installment.purpose,
          amount: installment.amount,
          automationEvent: installment.automationEvent ?? null
        }
      });
    }
  }

  for (const name of rtoServices) {
    await prisma.rtoService.upsert({
      where: { name },
      update: { active: true },
      create: {
        name,
        category: "RTO_SERVICE",
        feeAmount: 0,
        formSchemaJson: { fields: ["name", "phone", "address", "serviceNotes"] },
        documentSchemaJson: { required: ["aadhaar", "photo"] }
      }
    });
  }

  for (const [name, event, channel, body] of notificationTemplates) {
    await prisma.notificationTemplate.upsert({
      where: { name },
      update: { event, channel, body, active: true },
      create: { name, event, channel, body }
    });
  }

  const pages = [
    ["about", "About Us", "Trusted driving training, RTO support, and branch-wise student care."],
    ["courses", "Courses", "Dynamic driving courses with installment plans, documents, and license support."],
    ["branches", "Branches", "Rankala, Shahu Stadium, and Takala branches with live slot operations."],
    ["contact", "Contact", "Reach the nearest branch for admissions, RTO work, and advance booking."]
  ];

  for (const [slug, title, summary] of pages) {
    await prisma.publicWebsitePage.upsert({
      where: { slug },
      update: { title, contentJson: { summary }, published: true },
      create: {
        slug,
        title,
        seoTitle: `${title} | Shiv Suman Motor Training`,
        metaDescription: summary,
        contentJson: { summary },
        published: true
      }
    });
  }

  await prisma.blogPost.upsert({
    where: { slug: "how-to-prepare-for-driving-license-test" },
    update: {
      title: "How to prepare for your driving license test",
      publishedAt: new Date()
    },
    create: {
      slug: "how-to-prepare-for-driving-license-test",
      title: "How to prepare for your driving license test",
      seoTitle: "Driving License Test Preparation Guide",
      metaDescription: "Simple steps for learning license, practice, documents, and DL test readiness.",
      tags: ["driving license", "RTO", "training"],
      content: "Practice regularly, keep your documents ready, follow trainer feedback, and attend the DL test only when the supervisor marks you ready.",
      publishedAt: new Date()
    }
  });
}

seed()
  .then(async () => {
    await prisma.$disconnect();
    console.log("Seed completed.");
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
