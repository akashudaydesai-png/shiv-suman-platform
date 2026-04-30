export type PublicCar = {
  id: string;
  name: string;
  registrationNo: string;
  branchId?: string;
  branchName: string;
  fleetDeviceId: string | null;
  cameraDeviceId: string | null;
  createdAt?: string;
  imageUrl: string;
};

export type PublicCourse = {
  id: string;
  name: string;
  durationDays: number;
  vehicleClasses: string[];
  totalAmount: number;
  installments: Array<{ id: string; sequence: number; purpose: string; amount: number }>;
};

export type PublicBranch = {
  id: string;
  name: string;
  code: string;
  address: string | null;
  startTime: string;
  endTime: string;
  imageUrl: string;
};

export type PublicTrainer = {
  id: string;
  fullName: string;
  branch: { name: string } | null;
  imageUrl: string;
};

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  metaDescription: string | null;
  tags: string[];
  featuredImageUrl: string | null;
  featuredVideoUrl: string | null;
  redirectUrl: string | null;
};

export const heroImageUrl =
  "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=85";

export const fallbackCars: PublicCar[] = [
  {
    id: "demo-swift",
    name: "Maruti Suzuki Swift",
    registrationNo: "MH09DX6256",
    branchId: "rankala",
    branchName: "Waterfront Rankala",
    fleetDeviceId: "FLEET-READY",
    cameraDeviceId: "CAM-READY",
    createdAt: "2026-04-23T05:40:16.004Z",
    imageUrl: "https://images.unsplash.com/photo-1542362567-b07e54358753?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "demo-baleno",
    name: "Maruti Suzuki Baleno",
    registrationNo: "MH09AB2407",
    branchId: "takala",
    branchName: "Takala",
    fleetDeviceId: "FLEET-02",
    cameraDeviceId: "CAM-02",
    createdAt: "2026-04-23T05:40:16.004Z",
    imageUrl: "https://images.unsplash.com/photo-1552519507-da3b142c6e3d?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "demo-ertiga",
    name: "Maruti Suzuki Ertiga",
    registrationNo: "MH09TR1035",
    branchId: "shahu",
    branchName: "Shahu Stadium",
    fleetDeviceId: "FLEET-03",
    cameraDeviceId: "CAM-03",
    createdAt: "2026-04-23T05:40:16.004Z",
    imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=85"
  }
];

export const fallbackCourses: PublicCourse[] = [
  {
    id: "course-12-license",
    name: "12 Days With 4 Wheeler License",
    durationDays: 12,
    vehicleClasses: ["LMV"],
    totalAmount: 5000,
    installments: [
      { id: "c12-1", sequence: 1, purpose: "Training fee", amount: 2500 },
      { id: "c12-2", sequence: 2, purpose: "Learning license", amount: 300 },
      { id: "c12-3", sequence: 3, purpose: "Permanent license", amount: 1200 },
      { id: "c12-4", sequence: 4, purpose: "License last payment", amount: 1000 }
    ]
  },
  {
    id: "course-20-combo",
    name: "20 Days With 4 Wheeler And 2 Wheeler License",
    durationDays: 20,
    vehicleClasses: ["LMV", "MCWG"],
    totalAmount: 6800,
    installments: [
      { id: "c20-1", sequence: 1, purpose: "Admission", amount: 2500 },
      { id: "c20-2", sequence: 2, purpose: "Learning license fees", amount: 800 },
      { id: "c20-3", sequence: 3, purpose: "Second installment", amount: 1000 },
      { id: "c20-4", sequence: 4, purpose: "Driving license fees", amount: 1200 },
      { id: "c20-5", sequence: 5, purpose: "Last license fees", amount: 1200 }
    ]
  },
  {
    id: "course-26-premium",
    name: "26 Days Training With 4 Wheeler License",
    durationDays: 26,
    vehicleClasses: ["LMV"],
    totalAmount: 7500,
    installments: [
      { id: "c26-1", sequence: 1, purpose: "Training fee", amount: 2500 },
      { id: "c26-2", sequence: 2, purpose: "Practice and test readiness", amount: 2500 },
      { id: "c26-3", sequence: 3, purpose: "License support", amount: 2500 }
    ]
  }
];

export const fallbackBranches: PublicBranch[] = [
  {
    id: "branch-rankala",
    name: "Waterfront Rankala",
    code: "02",
    address: "Gala Number L10, Waterfront Apartment Near D Mart Rankala",
    startTime: "08:00",
    endTime: "20:00",
    imageUrl: "https://images.unsplash.com/photo-1600320254374-ce2d293c324e?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "branch-takala",
    name: "Takala",
    code: "TAKALA",
    address: "Takala, Kolhapur",
    startTime: "07:00",
    endTime: "20:00",
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1200&q=85"
  },
  {
    id: "branch-shahu",
    name: "Shahu Stadium",
    code: "SHAHU_STADIUM",
    address: "Shahu Stadium area, Kolhapur",
    startTime: "07:00",
    endTime: "20:00",
    imageUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=1200&q=85"
  }
];

export const fallbackTrainers: PublicTrainer[] = [
  {
    id: "trainer-1",
    fullName: "Senior LMV Trainer",
    branch: { name: "Waterfront Rankala" },
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "trainer-2",
    fullName: "DL Test Practice Trainer",
    branch: { name: "Takala" },
    imageUrl: "https://images.unsplash.com/photo-1543269664-56d93c1b41a6?auto=format&fit=crop&w=900&q=85"
  },
  {
    id: "trainer-3",
    fullName: "City Driving Coach",
    branch: { name: "Shahu Stadium" },
    imageUrl: "https://images.unsplash.com/photo-1556157382-97eda2d62296?auto=format&fit=crop&w=900&q=85"
  }
];

export const fallbackBlogPosts: PublicBlogPost[] = [
  {
    id: "blog-1",
    slug: "first-driving-class",
    title: "What To Carry For Your First Driving Class",
    metaDescription: "Photo ID, comfortable footwear, learning license updates, and a calm first session plan.",
    tags: ["Training", "Beginner", "License"],
    featuredImageUrl: "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?auto=format&fit=crop&w=1200&q=85",
    featuredVideoUrl: null,
    redirectUrl: null
  },
  {
    id: "blog-2",
    slug: "dl-test-readiness",
    title: "How We Prepare Students For DL Test Day",
    metaDescription: "Practice routes, reverse control, road signs, documents, and confidence checks before the test.",
    tags: ["DL Test", "Practice", "RTO"],
    featuredImageUrl: "https://images.unsplash.com/photo-1507136566006-cfc505b114fc?auto=format&fit=crop&w=1200&q=85",
    featuredVideoUrl: null,
    redirectUrl: null
  }
];

export function withFallback<T>(items: T[], fallback: T[]) {
  return items.length ? items : fallback;
}
