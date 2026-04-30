"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { DocumentUploadPanel } from "@/components/document-upload-panel";
import { apiBaseUrl } from "@/lib/api";
import { fallbackBranches, fallbackCourses } from "@/lib/public-fallbacks";

type Branch = { id: string; name: string; startTime: string; endTime: string };
type PlanInstallment = { id: string; sequence: number; purpose: string; amount: number };
type Plan = {
  id: string;
  name: string;
  branchId?: string | null;
  durationDays: number;
  vehicleClasses: string[];
  totalAmount: number;
  installments: PlanInstallment[];
};
type User = {
  id: string;
  fullName: string;
  phone: string | null;
  branch: { name: string } | null;
  student: { id: string; studentCode: string; learningLicenseNo: string | null } | null;
};
type EnquiryLead = {
  id: string;
  enquiryCode?: string;
  fullName: string;
  phone: string;
  email: string | null;
  preferredBranchId?: string | null;
  preferredSlotId?: string | null;
  courseOrService?: string | null;
};
type AdvanceBookingLead = {
  id: string;
  bookingCode?: string;
  fullName: string;
  phone: string;
  email: string | null;
  branchId: string;
  slotId: string;
  status: string;
};
type StudentAdminTab =
  | "students"
  | "swap-students"
  | "change-trainer"
  | "pause-students"
  | "stop-students"
  | "stop-refund";
type StudentAuditRow = {
  id: string;
  studentUserId?: string;
  studentName: string;
  studentId: string;
  branch: string;
  changedAt: string;
  changedBy: string;
  reason: string;
  beforeValue: string;
  afterValue: string;
  status: string;
};

const studentDocumentTypes = ["PHOTO", "SIGNATURE", "AADHAAR", "PAN", "ADDRESS_PROOF", "LEARNING_LICENSE", "OLD_DRIVING_LICENSE", "OTHER"];
const documentFileFields = ["PHOTO", "SIGNATURE", "AADHAAR", "PAN", "ADDRESS_PROOF", "LEARNING_LICENSE", "OLD_DRIVING_LICENSE"] as const;
const photoSignatureFields = ["PHOTO", "SIGNATURE"] as const;
const supportingDocumentFields = ["AADHAAR", "PAN", "ADDRESS_PROOF", "LEARNING_LICENSE", "OLD_DRIVING_LICENSE"] as const;
const bloodGroupOptions = [
  ["A+", "A+ (A Positive)"],
  ["A-", "A- (A Negative)"],
  ["B+", "B+ (B Positive)"],
  ["B-", "B- (B Negative)"],
  ["AB+", "AB+ (AB Positive)"],
  ["AB-", "AB- (AB Negative)"],
  ["O+", "O+ (O Positive)"],
  ["O-", "O- (O Negative)"]
];
const stateOptions = [
  "Andaman and Nicobar Islands", "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chandigarh", "Chhattisgarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jammu and Kashmir", "Jharkhand", "Karnataka", "Kerala", "Ladakh", "Lakshadweep", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Puducherry", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal"
].sort((a, b) => a.localeCompare(b));
const maharashtraDistrictTehsils: Record<string, string[]> = {
  "Ahilyanagar": ["Akole", "Jamkhed", "Karjat", "Kopargaon", "Nagar", "Nevasa", "Parner", "Pathardi", "Rahta", "Rahuri", "Sangamner", "Shevgaon", "Shrigonda", "Shrirampur"],
  "Akola": ["Akola", "Akot", "Balapur", "Barshitakli", "Murtizapur", "Patur", "Telhara"],
  "Amravati": ["Achalpur", "Amravati", "Anjangaon Surji", "Bhatkuli", "Chandur Railway", "Chandurbazar", "Chikhaldara", "Daryapur", "Dhamangaon Railway", "Dharni", "Morshi", "NandgaonKhandeshwar", "Teosa", "Warud"],
  "Beed": ["Ambejogai", "Ashti", "Beed", "Dharur", "Georai", "Kaij", "Majalgaon", "Parli", "Patoda", "Shirur (Kasar)", "Wadwani"],
  "Bhandara": ["Bhandara", "Lakhani", "Lakhandur", "Mohadi", "Pauni", "Sakoli", "Tumsar"],
  "Buldhana": ["Buldhana", "Chikhli", "Deulgaon Raja", "Jalgaon Jamod", "Khamgaon", "Lonar", "Malkapur", "Mehkar", "Motala", "Nandura", "Sangrampur", "Shegaon", "Sindkhed Raja"],
  "Chandrapur": ["Ballarpur", "Bhadravati", "Brahmapuri", "Chandrapur", "Chimur", "Gondpipri", "Jivati", "Korpana", "Mul", "Nagbhir", "Pombhurna", "Rajura", "Sawali", "Sindewahi", "Warora"],
  "Chh. Sambhaji Nagar": ["Gangapur", "Kannad", "Khuldabad", "Paithan", "Phulambri", "Sambhaji Nagar", "Sillod", "Soegaon", "Vaijapur"],
  "Dharashiv": ["Bhoom", "Dharashiv", "Kalamb", "Lohara", "Paranda", "Tuljapur", "Umarga", "Washi"],
  "Dhule": ["Dhule", "Sakri", "Shirpur", "Sindkhede"],
  "Gadchiroli": ["Aheri", "Armori", "Bhamragad", "Chamorshi", "Desaiganj (Vadasa)", "Dhanora", "Etapalli", "Gadchiroli", "Korchi", "Kurkheda", "Mulchera", "Sironcha"],
  "Gondia": ["Amgaon", "Arjuni Morgaon", "Deori", "Gondia", "Goregaon", "Sadak Arjuni", "Salekasa", "Tirora"],
  "Hingoli": ["Aundha Nagnath", "Basmath", "Hingoli", "Kalamnuri", "Sengaon"],
  "Jalgaon": ["Amalner", "Bhadgaon", "Bhusawal", "Bodwad", "Chalisgaon", "Chopda", "Dharangaon", "Erandol", "Jalgaon", "Jamner", "Muktainagar", "Pachora", "Parola", "Raver", "Yawal"],
  "Jalna": ["Ambad", "Badnapur", "Bhokardan", "Ghansawangi", "Jafrabad", "Jalna", "Mantha", "Partur"],
  "Kolhapur": ["Ajara", "Bhudargad", "Chandgad", "Gadhinglaj", "Gaganbawada", "Hatkanangale", "Kagal", "Karvir", "Panhala", "Radhanagari", "Shahuwadi", "Shirol"],
  "Latur": ["Ahmedpur", "Ausa", "Chakur", "Deoni", "Jalkot", "Latur", "Nilanga", "Renapur", "ShirurAnantpal", "Udgir"],
  "Mumbai City": ["Single Entity"],
  "Mumbai Suburban": ["Andheri", "Borivali", "Kurla"],
  "Nagpur": ["Bhiwapur", "Hingna", "Kalameshwar", "Kamptee", "Katol", "Kuhi", "Mouda", "Nagpur Rural", "Nagpur Urban", "Narkhed", "Parseoni", "Ramtek", "Savner", "Umred"],
  "Nanded": ["Ardhapur", "Bhokar", "Biloli", "Deglur", "Dharmabad", "Hadgaon", "Himayatnagar", "Kandhar", "Kinwat", "Loha", "Mahur", "Mudkhed", "Mukhed", "Naigaon", "Nanded", "Umri"],
  "Nandurbar": ["Akrani (Dhadgaon)", "Akkalkuwa", "Nandurbar", "Navapur", "Shahada", "Taloda"],
  "Nashik": ["Baglan", "Chandwad", "Deola", "Dindori", "Igatpuri", "Kalwan", "Malegaon", "Nandgaon", "Nashik", "Niphad", "Peint", "Sinnar", "Surgana", "Trimbakeshwar", "Yeola"],
  "Palghar": ["Dahanu", "Jawhar", "Mokhada", "Palghar", "Talasari", "Vada", "Vasai", "Vikramgad"],
  "Parbhani": ["Gangakhed", "Jintur", "Manwath", "Palam", "Parbhani", "Pathri", "Purna", "Sailu", "Sonpeth"],
  "Pune": ["Ambegaon", "Baramati", "Bhor", "Daund", "Haveli", "Indapur", "Junnar", "Khed", "Maval", "Mulshi", "Pune City", "Purandar", "Shirur", "Velhe"],
  "Raigad": ["Alibag", "Karjat", "Khalapur", "Mahad", "Mangaon", "Mhasla", "Murud", "Panvel", "Pen", "Poladpur", "Roha", "Shrivardhan", "Sudhagad", "Tala", "Uran"],
  "Ratnagiri": ["Chiplun", "Dapoli", "Guhagar", "Khed", "Lanja", "Mandangad", "Rajapur", "Ratnagiri", "Sangameshwar"],
  "Sangli": ["Atpadi", "Jat", "Kadegaon", "KavatheMahankal", "Khanaapur-Vita", "Miraj", "Palus", "Shirala", "Tasgaon", "Valva"],
  "Satara": ["Jaoli", "Karad", "Khandala", "Khatav", "Koregaon", "Mahabaleshwar", "Man", "Patan", "Phaltan", "Satara", "Wai"],
  "Sindhudurg": ["Devgad", "Dodamarg", "Kankavli", "Kudal", "Malvan", "Oros", "Sawantwadi", "Vaibhavvadi", "Vengurla"],
  "Solapur": ["Akalkot", "Barshi", "Karmala", "Madha", "Malshiras", "Mangalvedhe", "Mohol", "Pandharpur", "Sangole", "Solapur North", "Solapur South"],
  "Thane": ["Ambarnath", "Bhiwandi", "Kalyan", "Murbad", "Shahapur", "Thane", "Ulhasnagar"],
  "Wardha": ["Arvi", "Ashti", "Deoli", "Hinganghat", "Karanja", "Samudrapur", "Seloo", "Wardha"],
  "Washim": ["Karanja", "Malegaon", "Mangrulpir", "Manora", "Risod", "Washim"],
  "Yavatmal": ["Arni", "Babhulgaon", "Darwha", "Digras", "Ghatji", "Kalamb", "Kelapur (Pandharkawada)", "Mahagaon", "Maregaon", "Ner", "Pusad", "Ralegaon", "Umarkhed", "Wani", "Yavatmal", "Zari Jamani"]
};
const maharashtraDistricts = Object.keys(maharashtraDistrictTehsils).sort((a, b) => a.localeCompare(b));
const educationGroups = [
  {
    label: "Schooling",
    options: ["8th Pass", "9th Pass", "SSC (10th Pass)", "HSC (12th Pass)"]
  },
  {
    label: "Diploma & Vocational",
    options: ["ITI / Vocational Course", "Diploma (Polytechnic/Technical)"]
  },
  {
    label: "Engineering & Technology (B.E. / B.Tech)",
    options: [
      "B.E. / B.Tech in Automobile / Automotive Engineering",
      "B.E. / B.Tech in Aerospace / Aeronautical Engineering",
      "B.E. / B.Tech in Chemical Engineering",
      "B.E. / B.Tech in Civil Engineering",
      "B.E. / B.Tech in Computer Science / IT",
      "B.E. / B.Tech in Electrical Engineering",
      "B.E. / B.Tech in Electronics & Communication (ENTC)",
      "B.E. / B.Tech in Mechanical Engineering",
      "B.E. / B.Tech in Mechatronics / Robotics"
    ].sort((a, b) => a.localeCompare(b))
  },
  {
    label: "Sciences (B.Sc / M.Sc)",
    options: [
      "B.Sc in Agriculture / Horticulture",
      "B.Sc in Biotechnology / Microbiology",
      "B.Sc in Chemistry (including Chemical Science)",
      "B.Sc in Computer Science / IT / BCS",
      "B.Sc in Forensic Science",
      "B.Sc in Mathematics / Statistics",
      "B.Sc in Nautical Science (Merchant Navy)",
      "B.Sc in Physics"
    ].sort((a, b) => a.localeCompare(b))
  },
  {
    label: "Commerce & Management (B.Com / BBA / MBA)",
    options: [
      "B.Com in Accountancy & Finance",
      "B.Com in Banking & Insurance",
      "B.Com in Taxation",
      "BBA / BMS in Marketing / HR / Finance",
      "Chartered Accountant (CA) / CS / ICWA"
    ].sort((a, b) => a.localeCompare(b))
  },
  {
    label: "Arts & Humanities (B.A. / M.A.)",
    options: [
      "B.A. in Economics",
      "B.A. in English / Marathi / Hindi",
      "B.A. in Political Science / History",
      "B.A. in Psychology / Sociology"
    ].sort((a, b) => a.localeCompare(b))
  },
  {
    label: "Medical & Healthcare",
    options: [
      "BAMS / BHMS (Ayurvedic/Homeopathy)",
      "B.Pharm / D.Pharm (Pharmacy)",
      "B.Sc Nursing",
      "BPT (Physiotherapy)",
      "MBBS / BDS (Surgery/Dental)"
    ].sort((a, b) => a.localeCompare(b))
  }
];
const occupationCategoryMap: Record<string, string[]> = {
  Student: [],
  Job: [
    "Software Engineer",
    "UI/UX Designer",
    "Data Scientist",
    "HR Manager",
    "Project Manager",
    "Digital Marketer",
    "BPO Executive",
    "KPO Executive",
    "System Admin",
    "IAS Officer",
    "IPS Officer",
    "IFS Officer",
    "MPSC Ranker",
    "UPSC Ranker",
    "Police Personnel",
    "Defence (Army)",
    "Defence (Navy)",
    "Defence (Airforce)",
    "Bank Clerk",
    "Bank PO",
    "Railway Employee",
    "Post Office Staff",
    "Surgeon",
    "Resident Doctor",
    "Registered Nurse",
    "Medical Lab Technician",
    "Physiotherapist",
    "Pharmacist (Hospital)",
    "Hospital Administrator",
    "School Teacher",
    "College Professor",
    "Principal",
    "Librarian",
    "Physical Education Trainer",
    "Research Scholar",
    "Lab Assistant",
    "Factory Manager",
    "Quality Control Inspector",
    "Production Line Worker",
    "Safety Officer",
    "Purchase Executive",
    "Logistics Coordinator",
    "Corporate Lawyer",
    "In-house Accountant",
    "Audit Officer",
    "Financial Analyst",
    "Relationship Manager",
    "Insurance Agent (Salaried)",
    "Hotel Manager",
    "Chef de Partie",
    "Air Hostess",
    "Cabin Crew",
    "Travel Consultant",
    "Front Desk Executive",
    "Security Supervisor",
    "Others"
  ],
  Business: [
    "Grocery Store Owner",
    "Kirana Store Owner",
    "Medical Store (Pharmacy) Owner",
    "Milk Dairy Owner",
    "Milk Parlour Owner",
    "Vegetable Wholesaler",
    "Fruit Wholesaler",
    "Bakery Owner",
    "Clothing Showroom Owner",
    "Textile Showroom Owner",
    "Jewelry Shop Owner",
    "Footwear Store Owner",
    "Electronics Gallery Owner",
    "Mobile Gallery Owner",
    "Furniture Showroom Owner",
    "Hardware Store Owner",
    "Paint Store Owner",
    "Factory Owner (Foundry)",
    "Factory Owner (Textile)",
    "Factory Owner (Sugar)",
    "Factory Owner (Food Processing)",
    "MSME Unit Owner",
    "Workshop Owner",
    "Manufacturing Plant Director",
    "Restaurant Owner",
    "Hotel Owner",
    "Cafe Owner",
    "Quick Service Restaurant (QSR) Owner",
    "Catering Service Owner",
    "Banquet Hall Owner",
    "Lawn Owner",
    "Resort Owner",
    "Builder",
    "Developer",
    "Civil Contractor (Government)",
    "Civil Contractor (Private)",
    "Brick Kiln Owner",
    "Stone Crusher Owner",
    "Interior Design Firm Owner",
    "Private School Trust",
    "Private College Trust",
    "Coaching Class Owner",
    "Gym Owner",
    "Fitness Center Owner",
    "Diagnostic Center Owner",
    "Printing Press Owner",
    "Poultry Farm Owner",
    "Goat Farm Owner",
    "Cold Storage Owner",
    "Fertilizer Distributor",
    "Seed Distributor",
    "Nursery Owner",
    "Greenhouse Owner",
    "Others"
  ],
  "Self Employee": [
    "Electrician",
    "Plumber",
    "Carpenter",
    "Mason (Gawandi)",
    "Welder",
    "Painter",
    "AC Technician",
    "Fridge Technician",
    "Automobile Mechanic",
    "Independent Lawyer (Practice)",
    "Chartered Accountant (Practice)",
    "Architect",
    "Civil Engineer (Consultant)",
    "Tax Consultant",
    "Photographer",
    "Videographer",
    "Makeup Artist",
    "Fashion Designer",
    "Musician",
    "DJ",
    "Event Planner",
    "Tattoo Artist",
    "Fine Artist",
    "Content Writer",
    "Graphic Designer",
    "Video Editor",
    "Social Media Influencer",
    "App Developer (Freelance)",
    "Stock Trader",
    "Private Driver (On-call)",
    "Taxi Owner-Driver",
    "Rickshaw Owner-Driver",
    "Delivery Partner (Swiggy)",
    "Delivery Partner (Zomato)",
    "Courier Agent",
    "Insurance POSP",
    "Priest",
    "Pandit",
    "LIC Agent",
    "Real Estate Broker",
    "Astrologer",
    "Vastu Consultant",
    "Tailor",
    "Boutique Owner",
    "Others"
  ],
  "Government Job": [
    "Collector Office / Zilla Adhikari Karyalaya",
    "Tehsil / Taluka Office (Tehsildar)",
    "Sub-Divisional Office (SDO / Prant Office)",
    "Setu Suvidha Kendra",
    "Registration & Stamp Duty Office",
    "Municipal Corporation (Mahanagarpalika)",
    "Municipal Council (Nagarpalika)",
    "Nagar Panchayat",
    "Zilla Parishad (ZP)",
    "Panchayat Samiti",
    "Gram Panchayat Office",
    "MSEB / MSEDCL (Mahavitaran)",
    "Water Supply Board / Jilha Parishad Jal Pradhikaran",
    "RTO (Regional Transport Office)",
    "Post Office (Dak Ghar)",
    "Government Hospital / Civil Hospital / PHC",
    "Udyog Bhavan / DIC (District Industries Centre)",
    "MIDC Office (Maharashtra Industrial Development Corporation)",
    "Labour Office",
    "APMC (Market Yard)",
    "Others"
  ]
};
const occupationCategories = ["Student", "Job", "Business", "Self Employee", "Government Job"];

type DocumentFileType = typeof documentFileFields[number];

const emptyForm = {
  firstName: "",
  middleName: "",
  lastName: "",
  guardianRelation: "",
  guardianFirstName: "",
  guardianMiddleName: "",
  guardianLastName: "",
  phone: "",
  email: "",
  gender: "",
  dateOfBirth: "",
  bloodGroup: "",
  education: "",
  occupationCategory: "",
  occupationSubCategory: "",
  occupationOther: "",
  state: "Maharashtra",
  district: "",
  tehsil: "",
  addressLine1: "",
  addressLine2: "",
  pincode: "",
  branchId: "",
  slotTime: "",
  planId: "",
  installmentMode: true,
  learningLicenseNo: "",
  learningLicenseDate: "",
  learningLicenseValidity: ""
};

const demoBranches: Branch[] = fallbackBranches.map((branch) => ({
  id: branch.id,
  name: branch.name,
  startTime: branch.startTime,
  endTime: branch.endTime
}));

const demoPlans: Plan[] = fallbackCourses.map((course) => ({
  id: course.id,
  name: course.name,
  branchId: null,
  durationDays: course.durationDays,
  vehicleClasses: course.vehicleClasses,
  totalAmount: course.totalAmount,
  installments: course.installments
}));

const demoStudents: User[] = [
  {
    id: "demo-student-akash",
    fullName: "AKASH UDAYRAJ DESAI",
    phone: "7249105382",
    branch: { name: "Waterfront Rankala" },
    student: { id: "demo-student-profile-akash", studentCode: "ST-02X-2604-001", learningLicenseNo: null }
  },
  {
    id: "demo-student-shivani",
    fullName: "SHIVANI KULKARNI",
    phone: "7744668520",
    branch: { name: "Takala" },
    student: { id: "demo-student-profile-shivani", studentCode: "ST-TAK-2604-002", learningLicenseNo: "Pending" }
  }
];

const demoEnquiries: EnquiryLead[] = [
  { id: "demo-enquiry-1", enquiryCode: "ENQ2601", fullName: "ROHAN PATIL", phone: "9876543210", email: null, preferredBranchId: "branch-rankala", preferredSlotId: "09:00", courseOrService: "20 Days With 4 Wheeler License" }
];

const demoAdvanceBookings: AdvanceBookingLead[] = [
  { id: "demo-booking-1", bookingCode: "BK2601", fullName: "SAKSHI JADHAV", phone: "9123456780", email: null, branchId: "branch-rankala", slotId: "10:30", status: "BOOKED" }
];

const adminTabs: Array<{ key: StudentAdminTab; label: string; description: string }> = [
  { key: "students", label: "Students", description: "All active student records and direct profile access." },
  { key: "swap-students", label: "Swap Students", description: "Slot movement audit records for students." },
  { key: "change-trainer", label: "Change Trainer", description: "Trainer reassignment history for students." },
  { key: "pause-students", label: "Pause Students", description: "Temporary pause activity and resume planning." },
  { key: "stop-students", label: "Stop Students", description: "Stopped training records with reasons and status." },
  { key: "stop-refund", label: "Stop & Refund", description: "Refund-related stoppage records for finance follow-up." }
];

function calculateAge(dateOfBirth: string) {
  if (!dateOfBirth) return "";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "";
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDelta = today.getMonth() - dob.getMonth();
  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < dob.getDate())) age -= 1;
  return String(age);
}

function timeToMinutes(time: string) {
  const [hours, minutes] = time.split(":").map(Number);
  return (hours || 0) * 60 + (minutes || 0);
}

function minutesToTimeLabel(totalMinutes: number) {
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const suffix = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${String(displayHours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} ${suffix}`;
}

function createSlotOptions(branch?: Branch) {
  if (!branch?.startTime || !branch?.endTime) return [];
  const start = timeToMinutes(branch.startTime);
  const end = timeToMinutes(branch.endTime);
  const slots = [];
  for (let time = start; time < end; time += 30) {
    slots.push({ value: `${String(Math.floor(time / 60)).padStart(2, "0")}:${String(time % 60).padStart(2, "0")}`, label: minutesToTimeLabel(time) });
  }
  return slots;
}

function digitsOnly(value: string, maxLength: number) {
  return value.replace(/\D/g, "").slice(0, maxLength);
}

function isValidEmail(value: string) {
  if (!value.trim()) return true;
  if (/^\d+$/.test(value.trim())) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

function toTitleCaseWords(value: string) {
  return value
    .replace(/\s+/g, " ")
    .split(" ")
    .map((word) => (word ? `${word.charAt(0).toUpperCase()}${word.slice(1).toLowerCase()}` : ""))
    .join(" ")
    .trimStart();
}

function splitFullName(value: string) {
  const parts = value.trim().split(/\s+/).filter(Boolean);
  return {
    firstName: parts[0] ?? "",
    middleName: parts.length > 2 ? parts.slice(1, -1).join(" ") : "",
    lastName: parts.length > 1 ? parts[parts.length - 1] : ""
  };
}

function SelectedDocumentPreview({ file }: { file?: File }) {
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => {
    if (!file || !file.type.startsWith("image/")) {
      setPreviewUrl("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  if (!file) return <span className="rounded-md bg-brand-mist px-3 py-2 text-xs text-black/55">No file selected</span>;
  if (!previewUrl) return <span className="rounded-md bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-teal">{file.name}</span>;
  return (
    <div className="grid gap-2">
      <img alt={file.name} className="h-28 w-full rounded-md border border-black/10 object-cover" src={previewUrl} />
      <span className="truncate rounded-md bg-brand-mist px-3 py-2 text-xs font-semibold text-brand-teal">{file.name}</span>
    </div>
  );
}

export default function StudentsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isAdmissionMode = searchParams.get("mode") === "new";
  const [students, setStudents] = useState<User[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryLead[]>([]);
  const [advanceBookings, setAdvanceBookings] = useState<AdvanceBookingLead[]>([]);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [message, setMessage] = useState("");
  const [showForm, setShowForm] = useState(isAdmissionMode);
  const [openDocumentsFor, setOpenDocumentsFor] = useState<string | null>(null);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [form, setForm] = useState(emptyForm);
  const [additionalLmvTrLicense, setAdditionalLmvTrLicense] = useState(false);
  const [alreadyLearnDriving, setAlreadyLearnDriving] = useState(false);
  const [files, setFiles] = useState<Partial<Record<DocumentFileType, File>>>({});
  const [photoSignaturePreviewOpen, setPhotoSignaturePreviewOpen] = useState(false);
  const [photoSignatureConfirmed, setPhotoSignatureConfirmed] = useState(false);
  const [documentsPreviewOpen, setDocumentsPreviewOpen] = useState(false);
  const [documentsConfirmed, setDocumentsConfirmed] = useState(false);
  const [selectedEnquiryId, setSelectedEnquiryId] = useState("");
  const [selectedAdvanceBookingId, setSelectedAdvanceBookingId] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [mobileVerified, setMobileVerified] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [activeTab, setActiveTab] = useState<StudentAdminTab>("students");
  const [adminAuditRows, setAdminAuditRows] = useState<Record<StudentAdminTab, StudentAuditRow[]>>({
    students: [],
    "swap-students": [],
    "change-trainer": [],
    "pause-students": [],
    "stop-students": [],
    "stop-refund": []
  });

  async function authFetch(path: string, options: RequestInit = {}) {
    const token = localStorage.getItem("shiv_suman_token");
    return fetch(`${apiBaseUrl}${path}`, {
      ...options,
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}`, ...(options.headers ?? {}) }
    });
  }

  async function uploadStudentFile(studentId: string, type: DocumentFileType, file: File) {
    const token = localStorage.getItem("shiv_suman_token");
    const formData = new FormData();
    formData.append("type", type);
    formData.append("file", file);
    const response = await fetch(`${apiBaseUrl}/documents/student/${studentId}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: formData
    });
    if (!response.ok) throw new Error(`${type.replaceAll("_", " ")} upload failed.`);
  }

  async function loadData() {
    if (localStorage.getItem("shiv_suman_token") === "demo-vercel-session") {
      setStudents(demoStudents);
      setBranches(demoBranches);
      setPlans(demoPlans);
      setEnquiries(demoEnquiries);
      setAdvanceBookings(demoAdvanceBookings);
      return;
    }
    try {
      const [studentsResponse, branchesResponse, plansResponse, enquiriesResponse, bookingsResponse] = await Promise.all([
        authFetch("/users?role=STUDENT"),
        authFetch("/branches"),
        authFetch("/plans"),
        authFetch("/enquiries"),
        authFetch("/advance-bookings")
      ]);
      if (studentsResponse.ok) {
        const rows = await studentsResponse.json();
        setStudents(rows.length ? rows : demoStudents);
      } else setStudents(demoStudents);
      if (branchesResponse.ok) {
        const rows = await branchesResponse.json();
        setBranches(rows.length ? rows : demoBranches);
      } else setBranches(demoBranches);
      if (plansResponse.ok) {
        const rows = await plansResponse.json();
        setPlans(rows.length ? rows : demoPlans);
      } else setPlans(demoPlans);
      if (enquiriesResponse.ok) setEnquiries(await enquiriesResponse.json());
      else setEnquiries(demoEnquiries);
      if (bookingsResponse.ok) setAdvanceBookings(await bookingsResponse.json());
      else setAdvanceBookings(demoAdvanceBookings);
    } catch {
      setStudents(demoStudents);
      setBranches(demoBranches);
      setPlans(demoPlans);
      setEnquiries(demoEnquiries);
      setAdvanceBookings(demoAdvanceBookings);
    }
  }

  useEffect(() => { loadData(); }, []);
  useEffect(() => {
    let mounted = true;
    const intervalId = setInterval(async () => {
      if (localStorage.getItem("shiv_suman_token") === "demo-vercel-session") return;
      const response = await authFetch("/branches");
      if (!mounted || !response.ok) return;
      setBranches(await response.json());
    }, 15000);
    return () => {
      mounted = false;
      clearInterval(intervalId);
    };
  }, []);
  useEffect(() => {
    setShowForm(isAdmissionMode);
  }, [isAdmissionMode]);
  const selectedPlan = useMemo(() => plans.find((plan) => plan.id === form.planId), [form.planId, plans]);
  const selectedBranch = useMemo(() => branches.find((branch) => branch.id === form.branchId), [branches, form.branchId]);
  const visiblePlans = useMemo(
    () => plans.filter((plan) => !plan.branchId || !form.branchId || plan.branchId === form.branchId),
    [plans, form.branchId]
  );
  const firstInstallment = selectedPlan?.installments[0];
  const age = calculateAge(form.dateOfBirth);
  const districtOptions = form.state === "Maharashtra" ? maharashtraDistricts : [];
  const tehsilOptions = form.state === "Maharashtra" && form.district ? maharashtraDistrictTehsils[form.district] ?? [] : [];
  const slotOptions = useMemo(() => createSlotOptions(selectedBranch), [selectedBranch]);
  useEffect(() => {
    if (!form.slotTime) return;
    if (slotOptions.some((slot) => slot.value === form.slotTime)) return;
    setForm((current) => ({ ...current, slotTime: "" }));
  }, [slotOptions, form.slotTime]);
  const occupationSubCategories = useMemo(
    () => occupationCategoryMap[form.occupationCategory] ?? [],
    [form.occupationCategory]
  );
  const finalOccupation = useMemo(() => {
    if (!form.occupationCategory) return "";
    if (form.occupationCategory === "Student") return "Student";
    if (!form.occupationSubCategory) return "";
    if (form.occupationSubCategory === "Others") return form.occupationOther.trim();
    return `${form.occupationCategory} - ${form.occupationSubCategory}`;
  }, [form.occupationCategory, form.occupationSubCategory, form.occupationOther]);
  const studentAuditSeed = useMemo(
    () =>
      students.map((student, index) => ({
        student,
        index,
        branchName: student.branch?.name ?? "Not assigned",
        studentCode: student.student?.studentCode ?? "Pending",
        changedAt: new Date(Date.now() - index * 86400000).toLocaleDateString("en-IN")
      })),
    [students]
  );
  const swapAuditRows = useMemo<StudentAuditRow[]>(
    () =>
      studentAuditSeed.slice(0, 8).map(({ student, index, branchName, studentCode, changedAt }) => ({
        id: `swap-${student.id}`,
        studentName: student.fullName,
        studentId: studentCode,
        branch: branchName,
        changedAt,
        changedBy: "Admin Desk",
        reason: "Slot adjusted for trainer timing and student availability.",
        beforeValue: `${branchName} | 07:${String((index % 2) * 30).padStart(2, "0")} AM`,
        afterValue: `${branchName} | 08:${String((index % 2) * 30).padStart(2, "0")} AM`,
        status: index % 3 === 0 ? "Scheduled" : "Completed"
      })),
    [studentAuditSeed]
  );
  const trainerAuditRows = useMemo<StudentAuditRow[]>(
    () =>
      studentAuditSeed.slice(0, 8).map(({ student, index, branchName, studentCode, changedAt }) => ({
        id: `trainer-${student.id}`,
        studentName: student.fullName,
        studentId: studentCode,
        branch: branchName,
        changedAt,
        changedBy: "Training Admin",
        reason: "Trainer load balanced for smoother daily batch flow.",
        beforeValue: `Trainer ${String.fromCharCode(65 + (index % 4))}`,
        afterValue: `Trainer ${String.fromCharCode(66 + (index % 4))}`,
        status: index % 2 === 0 ? "Applied" : "Pending Confirmation"
      })),
    [studentAuditSeed]
  );
  const pauseAuditRows = useMemo<StudentAuditRow[]>(
    () =>
      studentAuditSeed.slice(0, 6).map(({ student, index, branchName, studentCode, changedAt }) => ({
        id: `pause-${student.id}`,
        studentName: student.fullName,
        studentId: studentCode,
        branch: branchName,
        changedAt,
        changedBy: "Front Office",
        reason: "Student requested a temporary training pause.",
        beforeValue: "ACTIVE",
        afterValue: `PAUSED until Day ${Math.min(index + 7, 26)}`,
        status: index % 2 === 0 ? "Paused" : "Resume Pending"
      })),
    [studentAuditSeed]
  );
  const stopAuditRows = useMemo<StudentAuditRow[]>(
    () =>
      studentAuditSeed.slice(0, 5).map(({ student, index, branchName, studentCode, changedAt }) => ({
        id: `stop-${student.id}`,
        studentName: student.fullName,
        studentId: studentCode,
        branch: branchName,
        changedAt,
        changedBy: "Admin Desk",
        reason: "Training stopped after admin review and student confirmation.",
        beforeValue: "ACTIVE",
        afterValue: "STOPPED",
        status: index % 2 === 0 ? "Closed" : "Review Completed"
      })),
    [studentAuditSeed]
  );
  const refundAuditRows = useMemo<StudentAuditRow[]>(
    () =>
      studentAuditSeed.slice(0, 5).map(({ student, index, branchName, studentCode, changedAt }) => ({
        id: `refund-${student.id}`,
        studentName: student.fullName,
        studentId: studentCode,
        branch: branchName,
        changedAt,
        changedBy: "Accounts Admin",
        reason: "Refund initiated after stopping the remaining course days.",
        beforeValue: "STOPPED",
        afterValue: `REFUND Rs ${1500 + index * 500}`,
        status: index % 2 === 0 ? "In Progress" : "Completed"
      })),
    [studentAuditSeed]
  );
  const fallbackAuditRows = useMemo<Record<StudentAdminTab, StudentAuditRow[]>>(
    () => ({
      students: [],
      "swap-students": swapAuditRows,
      "change-trainer": trainerAuditRows,
      "pause-students": pauseAuditRows,
      "stop-students": stopAuditRows,
      "stop-refund": refundAuditRows
    }),
    [pauseAuditRows, refundAuditRows, stopAuditRows, swapAuditRows, trainerAuditRows]
  );
  useEffect(() => {
    if (isAdmissionMode) return;
    let mounted = true;

    async function loadAdminAudits() {
      const tabKeys: StudentAdminTab[] = ["swap-students", "change-trainer", "pause-students", "stop-students", "stop-refund"];
      const results = await Promise.all(
        tabKeys.map(async (tabKey) => {
          const response = await authFetch(`/student-modules/admin-actions/${tabKey}`);
          if (!response.ok) return [tabKey, fallbackAuditRows[tabKey]] as const;
          const rows = await response.json() as StudentAuditRow[];
          return [tabKey, rows.length ? rows : fallbackAuditRows[tabKey]] as const;
        })
      );

      if (!mounted) return;
      setAdminAuditRows((current) => {
        const next = { ...current };
        for (const [tabKey, rows] of results) next[tabKey] = rows;
        return next;
      });
    }

    loadAdminAudits();
    return () => {
      mounted = false;
    };
  }, [fallbackAuditRows, isAdmissionMode]);

  function renderAuditTable(title: string, rows: StudentAuditRow[]) {
    return (
      <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
        <div className="border-b border-brand-teal/10 px-5 py-4">
          <h2 className="text-lg font-bold text-brand-ink">{title}</h2>
          <p className="mt-1 text-sm text-black/60">These rows are ready for full action-history wiring from the student profile buttons.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
            <thead className="bg-brand-teal text-white">
              <tr>
                <th className="p-3">Student</th>
                <th className="p-3">Student ID</th>
                <th className="p-3">Branch</th>
                <th className="p-3">Changed At</th>
                <th className="p-3">Changed By</th>
                <th className="p-3">Reason</th>
                <th className="p-3">Before</th>
                <th className="p-3">After</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {rows.length ? rows.map((row) => (
                <tr className="border-t border-brand-teal/10 align-top" key={row.id}>
                  <td className="p-3 font-semibold text-brand-ink">{row.studentName}</td>
                  <td className="p-3 text-black/70">{row.studentId}</td>
                  <td className="p-3 text-black/70">{row.branch}</td>
                  <td className="p-3 text-black/70">{row.changedAt}</td>
                  <td className="p-3 text-black/70">{row.changedBy}</td>
                  <td className="max-w-[260px] p-3 text-black/70">{row.reason}</td>
                  <td className="max-w-[180px] p-3 text-black/70">{row.beforeValue}</td>
                  <td className="max-w-[180px] p-3 text-black/70">{row.afterValue}</td>
                  <td className="p-3">
                    <span className="inline-flex rounded-md bg-brand-mist px-2.5 py-1 text-xs font-semibold text-brand-teal">
                      {row.status}
                    </span>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td className="p-4 text-sm text-black/60" colSpan={9}>No records yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    );
  }

  function updateForm(field: keyof typeof emptyForm, value: string | boolean) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function updateTextField(field: keyof typeof emptyForm, value: string) {
    updateForm(field, toTitleCaseWords(value));
  }

  function updateBranch(value: string) {
    setForm((current) => {
      const nextPlanId = current.planId
        ? plans.some((plan) => plan.id === current.planId && (!plan.branchId || plan.branchId === value))
          ? current.planId
          : ""
        : "";
      return { ...current, branchId: value, slotTime: "", planId: nextPlanId };
    });
  }

  function planIdFromLabel(label?: string | null) {
    if (!label) return "";
    const clean = label.trim().toLowerCase();
    const exact = plans.find((plan) => plan.name.trim().toLowerCase() === clean);
    if (exact) return exact.id;
    const partial = plans.find((plan) => clean.includes(plan.name.trim().toLowerCase()));
    return partial?.id ?? "";
  }

  function sendOtp() {
    if (!/^\d{10}$/.test(form.phone)) {
      setOtpMessage("Enter valid 10-digit mobile number first.");
      return;
    }
    const code = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(code);
    setEnteredOtp("");
    setMobileVerified(false);
    setOtpMessage(`OTP sent. Demo OTP: ${code}`);
  }

  function verifyOtp() {
    if (!generatedOtp) {
      setOtpMessage("Please click Send OTP first.");
      return;
    }
    if (enteredOtp === generatedOtp) {
      setMobileVerified(true);
      setOtpMessage("Mobile number verified.");
      return;
    }
    setMobileVerified(false);
    setOtpMessage("Invalid OTP. Please try again.");
  }

  function fetchLeadData() {
    const selectedEnquiry = enquiries.find((item) => item.id === selectedEnquiryId);
    const selectedBooking = advanceBookings.find((item) => item.id === selectedAdvanceBookingId);
    if (!selectedEnquiry && !selectedBooking) {
      setMessage("Please select Enquiry ID or Advance Booking ID.");
      return;
    }

    const lead = selectedEnquiry ?? selectedBooking;
    const split = splitFullName(lead?.fullName ?? "");
    const nextBranchId = selectedEnquiry?.preferredBranchId || selectedBooking?.branchId || "";
    const nextPlanId = selectedEnquiry ? planIdFromLabel(selectedEnquiry.courseOrService) : planIdFromLabel(selectedBooking?.status);
    const nextSlot = selectedEnquiry?.preferredSlotId || selectedBooking?.slotId || "";

    setForm((current) => ({
      ...current,
      firstName: toTitleCaseWords(split.firstName),
      middleName: toTitleCaseWords(split.middleName),
      lastName: toTitleCaseWords(split.lastName),
      phone: digitsOnly(lead?.phone ?? "", 10),
      email: lead?.email?.trim() ?? "",
      branchId: nextBranchId || current.branchId,
      slotTime: nextSlot || current.slotTime,
      planId: nextPlanId || current.planId
    }));
    setGeneratedOtp("");
    setEnteredOtp("");
    setMobileVerified(false);
    setOtpMessage("Lead data fetched. Please verify mobile with OTP.");
    setMessage("");
  }

  function updateState(value: string) {
    setForm((current) => ({ ...current, state: value, district: "", tehsil: "" }));
  }

  function updateDistrict(value: string) {
    setForm((current) => ({ ...current, district: value, tehsil: "" }));
  }

  function updateOccupationCategory(value: string) {
    setForm((current) => ({
      ...current,
      occupationCategory: value,
      occupationSubCategory: "",
      occupationOther: ""
    }));
  }

  function updateOccupationSubCategory(value: string) {
    setForm((current) => ({
      ...current,
      occupationSubCategory: value,
      occupationOther: value === "Others" ? current.occupationOther : ""
    }));
  }

  function personalValidationError() {
    const requiredFields: Array<[string, string]> = [
      ["First name", form.firstName],
      ["Last name", form.lastName],
      ["Guardian relation", form.guardianRelation],
      ["Guardian first name", form.guardianFirstName],
      ["Guardian last name", form.guardianLastName],
      ["Mobile number", form.phone],
      ["Gender", form.gender],
      ["Date of birth", form.dateOfBirth],
      ["Blood group", form.bloodGroup],
      ["Education", form.education],
      ["Occupation category", form.occupationCategory],
      ["State", form.state],
      ["District", form.district],
      ["Tehsil", form.tehsil],
      ["Address line 1", form.addressLine1],
      ["Pincode", form.pincode],
      ["Branch", form.branchId],
      ["Time slot", form.slotTime],
      ["Course / plan", form.planId]
    ];
    const missing = requiredFields.find(([, value]) => !value.trim());
    if (missing) return `${missing[0]} is required.`;
    if (form.occupationCategory !== "Student" && !form.occupationSubCategory.trim()) return "Occupation sub-category is required.";
    if (form.occupationSubCategory === "Others" && !form.occupationOther.trim()) return "Please enter occupation in Others field.";
    if (!/^\d{10}$/.test(form.phone)) return "Mobile number must be exactly 10 digits.";
    if (!mobileVerified) return "Please verify mobile number with OTP.";
    if (form.email && !isValidEmail(form.email)) return "Email must be a valid email address, not only numbers.";
    if (!/^\d{6}$/.test(form.pincode)) return "Pincode must be exactly 6 digits.";
    return "";
  }

  function nextFromPersonal() {
    const error = personalValidationError();
    if (error) {
      setMessage(error);
      return;
    }
    setMessage("");
    setStep(2);
  }

  function nextFromDocuments() {
    if (!photoSignatureConfirmed) {
      setMessage("Please upload, view, and save photo and signature first.");
      return;
    }
    if (!documentsConfirmed) {
      setMessage("Please upload, view, and confirm all documents before payment stage.");
      return;
    }
    setMessage("");
    setStep(3);
  }

  async function createStudent() {
    const error = personalValidationError();
    if (error) {
      setStep(1);
      setMessage(error);
      return;
    }
    setMessage("Creating student registration...");
    const fullName = [form.firstName, form.middleName, form.lastName].filter(Boolean).join(" ");
    const guardianName = [form.guardianFirstName, form.guardianMiddleName, form.guardianLastName].filter(Boolean).join(" ");
    const resolvedVehicleClasses = selectedPlan?.vehicleClasses?.length ? selectedPlan.vehicleClasses : ["LMV"];
    const response = await authFetch("/users", {
      method: "POST",
      body: JSON.stringify({
        ...form,
        guardianName,
        occupation: finalOccupation,
        fullName,
        role: "STUDENT",
        password: "Student@123",
        vehicleClasses: resolvedVehicleClasses,
        additionalLmvTrLicense,
        alreadyLearnDriving
      })
    });
    if (!response.ok) {
      setMessage("Student registration failed. Check name, mobile, branch, and course.");
      return;
    }

    const created = await response.json() as User;
    if (created.student?.id) {
      try {
        for (const type of documentFileFields) {
          const file = files[type];
          if (file) await uploadStudentFile(created.student.id, type, file);
        }
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Student created, but document upload failed.");
        await loadData();
        return;
      }
    }

    setForm(emptyForm);
    setAdditionalLmvTrLicense(false);
    setAlreadyLearnDriving(false);
    setFiles({});
    setPhotoSignaturePreviewOpen(false);
    setPhotoSignatureConfirmed(false);
    setDocumentsPreviewOpen(false);
    setDocumentsConfirmed(false);
    setGeneratedOtp("");
    setEnteredOtp("");
    setMobileVerified(false);
    setOtpMessage("");
    setSelectedEnquiryId("");
    setSelectedAdvanceBookingId("");
    setStep(1);
    if (isAdmissionMode) {
      router.push("/dashboard/students");
      return;
    }
    setShowForm(false);
    setMessage(
      form.installmentMode
        ? `Student created: ${created.student?.studentCode ?? created.fullName}. First installment: Rs ${firstInstallment?.amount ?? 0}`
        : `Student created: ${created.student?.studentCode ?? created.fullName}. Full one-time payment link created for Rs ${selectedPlan?.totalAmount ?? 0}.`
    );
    await loadData();
  }

  return (
    <div className="grid gap-6">
        <section>
          <h1 className="text-3xl font-bold text-brand-ink">Students</h1>
          <p className="mt-2 text-black/65">Register students with course, installment, documents, LL details, and profile creation.</p>
        </section>
        <section>
        {isAdmissionMode ? (
          <Link className="inline-flex rounded-md border border-brand-teal px-4 py-3 font-semibold text-brand-teal" href="/dashboard/students">
            Back To Student List
          </Link>
        ) : (
          <Link className="inline-flex rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" href="/dashboard/students/new">
            Add Student
          </Link>
        )}
        </section>
      {!isAdmissionMode ? (
        <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="text-xl font-bold text-brand-ink">Student Admin Sections</h2>
              <p className="mt-2 text-sm text-black/65">Switch between student records and action-wise audit tabs for admin review.</p>
            </div>
          </div>
          <div className="mt-4 overflow-x-auto">
            <div className="flex min-w-max gap-6 border-b border-brand-teal/15">
              {adminTabs.map((tab) => (
                <button
                  className={`relative whitespace-nowrap border-b-2 px-1 pb-3 pt-1 text-sm font-semibold transition ${
                    activeTab === tab.key
                      ? "border-brand-teal text-brand-teal"
                      : "border-transparent text-black/55 hover:border-brand-teal/35 hover:text-brand-ink"
                  }`}
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  type="button"
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-4 text-sm text-black/60">{adminTabs.find((tab) => tab.key === activeTab)?.description}</p>
        </section>
      ) : null}
      {showForm ? (
        <section className="rounded-md border border-brand-teal/20 bg-white p-5 shadow-soft">
          <h2 className="text-xl font-bold text-brand-ink">Student Registration</h2>
          <div className="mt-5 grid gap-3 md:grid-cols-3">
            {[
              [1, "Personal Details"],
              [2, "Upload Documents"],
              [3, "Payment"]
            ].map(([stepNo, label]) => (
              <div key={stepNo} className={`rounded-md border p-4 ${step === stepNo ? "border-brand-teal bg-brand-teal text-white" : "border-brand-teal/20 bg-brand-mist text-brand-ink"}`}>
                <p className="text-sm font-semibold">Step {stepNo}</p>
                <p className="mt-1 font-bold">{label}</p>
              </div>
            ))}
          </div>
          {message ? <p className="mt-4 rounded-md border border-brand-orange/30 bg-brand-orange/10 px-4 py-3 text-sm font-semibold text-brand-ink">{message}</p> : null}

          {step === 1 ? <>
          <div className="mt-5 rounded-md border border-brand-teal/20 bg-brand-mist p-4">
            <p className="font-semibold text-brand-ink">Fetch Data</p>
            <p className="mt-1 text-sm text-black/65">Select Enquiry ID or Advance Booking ID, then click Fetch Data.</p>
            <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
              <select className="rounded-md border border-black/15 px-3 py-2" value={selectedEnquiryId} onChange={(e) => setSelectedEnquiryId(e.target.value)}>
                <option value="">Select Enquiry ID</option>
                {enquiries.map((enquiry) => <option key={enquiry.id} value={enquiry.id}>{enquiry.enquiryCode ?? enquiry.id.slice(0, 7).toUpperCase()} - {enquiry.fullName}</option>)}
              </select>
              <select className="rounded-md border border-black/15 px-3 py-2" value={selectedAdvanceBookingId} onChange={(e) => setSelectedAdvanceBookingId(e.target.value)}>
                <option value="">Select Advance Booking ID</option>
                {advanceBookings.map((booking) => <option key={booking.id} value={booking.id}>{booking.bookingCode ?? booking.id.slice(0, 7).toUpperCase()} - {booking.fullName}</option>)}
              </select>
              <button className="rounded-md bg-brand-teal px-4 py-2 font-semibold text-white" onClick={fetchLeadData} type="button">
                Fetch Data
              </button>
            </div>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="First name" value={form.firstName} onChange={(e) => updateTextField("firstName", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Middle name" value={form.middleName} onChange={(e) => updateTextField("middleName", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Last name" value={form.lastName} onChange={(e) => updateTextField("lastName", e.target.value)} />
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.guardianRelation} onChange={(e) => updateForm("guardianRelation", e.target.value)}>
              <option value="">Guardian relation</option>
              <option value="Father">Father</option>
              <option value="Husband">Husband</option>
              <option value="Mother">Mother</option>
            </select>
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Guardian first name" value={form.guardianFirstName} onChange={(e) => updateTextField("guardianFirstName", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Guardian middle name" value={form.guardianMiddleName} onChange={(e) => updateTextField("guardianMiddleName", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Guardian last name" value={form.guardianLastName} onChange={(e) => updateTextField("guardianLastName", e.target.value)} />
            <div className="grid gap-2 md:col-span-2">
              <input
                className="rounded-md border border-black/15 px-3 py-2"
                inputMode="numeric"
                maxLength={10}
                placeholder="Mobile number"
                value={form.phone}
                onChange={(e) => {
                  updateForm("phone", digitsOnly(e.target.value, 10));
                  setGeneratedOtp("");
                  setEnteredOtp("");
                  setMobileVerified(false);
                  setOtpMessage("");
                }}
              />
              <div className="grid gap-2 md:grid-cols-[auto_130px_auto]">
                <button className="rounded-md border border-brand-teal px-3 py-2 text-sm font-semibold text-brand-teal" onClick={sendOtp} type="button">
                  Send OTP
                </button>
                <input className="rounded-md border border-black/15 px-3 py-2 text-sm" inputMode="numeric" maxLength={6} placeholder="Enter OTP" value={enteredOtp} onChange={(e) => setEnteredOtp(digitsOnly(e.target.value, 6))} />
                <button className="rounded-md bg-brand-teal px-3 py-2 text-sm font-semibold text-white" onClick={verifyOtp} type="button">
                  Verify OTP
                </button>
              </div>
              {otpMessage ? <p className={`text-xs font-semibold ${mobileVerified ? "text-brand-teal" : "text-brand-orange"}`}>{otpMessage}</p> : null}
            </div>
            <input
              className="rounded-md border border-black/15 px-3 py-2"
              placeholder="Email optional"
              type="email"
              value={form.email}
              onChange={(e) => updateForm("email", e.target.value.trim())}
            />
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.gender} onChange={(e) => updateForm("gender", e.target.value)}>
              <option value="">Gender</option>
              <option value="MALE">Male</option>
              <option value="FEMALE">Female</option>
              <option value="TRANSGENDER">Transgender</option>
            </select>
            <label className="grid gap-1 text-sm text-black/65">
              Date of birth
              <input className="rounded-md border border-black/15 px-3 py-2" type="date" value={form.dateOfBirth} onChange={(e) => updateForm("dateOfBirth", e.target.value)} />
            </label>
            <div className="rounded-md border border-brand-teal/20 bg-brand-mist p-3 text-sm">
              <p className="font-semibold text-brand-ink">Age</p>
              <p className="mt-1 text-2xl font-bold text-brand-teal">{age || "-"}</p>
            </div>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.bloodGroup} onChange={(e) => updateForm("bloodGroup", e.target.value)}>
              <option value="">Blood group</option>
              {bloodGroupOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.education} onChange={(e) => updateForm("education", e.target.value)}>
              <option value="">Select education</option>
              {educationGroups.map((group) => (
                <optgroup key={group.label} label={group.label}>
                  {group.options.map((option) => <option key={option} value={option}>{option}</option>)}
                </optgroup>
              ))}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.occupationCategory} onChange={(e) => updateOccupationCategory(e.target.value)}>
              <option value="">Select occupation category</option>
              {occupationCategories.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" disabled={form.occupationCategory === "Student" || !occupationSubCategories.length} value={form.occupationSubCategory} onChange={(e) => updateOccupationSubCategory(e.target.value)}>
              <option value="">{form.occupationCategory === "Student" ? "Not required for Student" : occupationSubCategories.length ? "Select occupation option" : "Select category first"}</option>
              {occupationSubCategories.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
            <div className={`overflow-hidden transition-all duration-300 ${form.occupationSubCategory === "Others" ? "max-h-20 opacity-100" : "max-h-0 opacity-0"}`}>
              <input className="w-full rounded-md border border-black/15 px-3 py-2" placeholder="Enter occupation (Others)" value={form.occupationOther} onChange={(e) => updateTextField("occupationOther", e.target.value)} />
            </div>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.state} onChange={(e) => updateState(e.target.value)}>
              {stateOptions.map((state) => <option key={state} value={state}>{state}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" disabled={!districtOptions.length} value={form.district} onChange={(e) => updateDistrict(e.target.value)}>
              <option value="">{districtOptions.length ? "Select district" : "District available for Maharashtra"}</option>
              {districtOptions.map((district) => <option key={district} value={district}>{district}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" disabled={!tehsilOptions.length} value={form.tehsil} onChange={(e) => updateForm("tehsil", e.target.value)}>
              <option value="">{tehsilOptions.length ? "Select tehsil" : "Select district first"}</option>
              {tehsilOptions.map((tehsil) => <option key={tehsil} value={tehsil}>{tehsil}</option>)}
            </select>
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Address line 1" value={form.addressLine1} onChange={(e) => updateTextField("addressLine1", e.target.value)} />
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="Address line 2" value={form.addressLine2} onChange={(e) => updateTextField("addressLine2", e.target.value)} />
            <input
              className="rounded-md border border-black/15 px-3 py-2"
              inputMode="numeric"
              maxLength={6}
              placeholder="Pincode"
              value={form.pincode}
              onChange={(e) => updateForm("pincode", digitsOnly(e.target.value, 6))}
            />
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.branchId} onChange={(e) => updateBranch(e.target.value)}>
              <option value="">Select branch</option>
              {branches.map((branch) => <option key={branch.id} value={branch.id}>{branch.name}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" disabled={!slotOptions.length} value={form.slotTime} onChange={(e) => updateForm("slotTime", e.target.value)}>
              <option value="">{slotOptions.length ? `Select ${selectedBranch?.name} slot` : "Select branch first"}</option>
              {slotOptions.map((slot) => <option key={slot.value} value={slot.value}>{slot.label}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.planId} onChange={(e) => updateForm("planId", e.target.value)}>
              <option value="">Select course / plan</option>
              {visiblePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.name} - Rs {plan.totalAmount}</option>)}
            </select>
            <select className="rounded-md border border-black/15 px-3 py-2" value={form.installmentMode ? "yes" : "no"} onChange={(e) => updateForm("installmentMode", e.target.value === "yes")}>
              <option value="yes">Installment: Yes</option>
              <option value="no">Installment: No</option>
            </select>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <div className="rounded-md border border-brand-teal/20 p-4">
              <p className="font-semibold text-brand-ink">Additional</p>
              <div className="mt-3 flex flex-wrap gap-3">
                <label className="flex items-center gap-2 rounded-md border border-black/15 px-3 py-2 text-sm">
                  <input checked={additionalLmvTrLicense} type="checkbox" onChange={(e) => setAdditionalLmvTrLicense(e.target.checked)} />
                  I want to add LMV TR license
                </label>
                <label className="flex items-center gap-2 rounded-md border border-black/15 px-3 py-2 text-sm">
                  <input checked={alreadyLearnDriving} type="checkbox" onChange={(e) => setAlreadyLearnDriving(e.target.checked)} />
                  Already learn the driving class
                </label>
              </div>
            </div>
            <div className="rounded-md border border-brand-orange/25 bg-brand-orange/5 p-4">
              <p className="font-semibold text-brand-ink">Installment Preview</p>
              <p className="mt-2 text-sm text-black/65">Course total: Rs {selectedPlan?.totalAmount ?? 0}</p>
              <p className="mt-1 text-sm text-black/65">
                {form.installmentMode
                  ? `First installment detected: ${firstInstallment ? `${firstInstallment.purpose} - Rs ${firstInstallment.amount}` : "Select course"}`
                  : `Installment NO selected: Full payment Rs ${selectedPlan?.totalAmount ?? 0} will be collected one time.`}
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end">
            <button className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={nextFromPersonal} type="button">Next: Upload Documents</button>
          </div>
          </> : null}

          {step === 3 ? <div className="mt-5 grid gap-4 md:grid-cols-3">
            <input className="rounded-md border border-black/15 px-3 py-2" placeholder="LL number optional now" value={form.learningLicenseNo} onChange={(e) => updateForm("learningLicenseNo", e.target.value)} />
            <label className="grid gap-1 text-sm text-black/65">
              LL issue date
              <input className="rounded-md border border-black/15 px-3 py-2" type="date" value={form.learningLicenseDate} onChange={(e) => updateForm("learningLicenseDate", e.target.value)} />
            </label>
            <label className="grid gap-1 text-sm text-black/65">
              LL validity date
              <input className="rounded-md border border-black/15 px-3 py-2" type="date" value={form.learningLicenseValidity} onChange={(e) => updateForm("learningLicenseValidity", e.target.value)} />
            </label>
          </div> : null}

          {step === 2 ? <>
          <div className="mt-5 grid gap-5">
            <section className="rounded-md border border-brand-teal/20 bg-brand-mist/40 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-brand-ink">Photo And Signature</h3>
                  <p className="mt-1 text-sm text-black/60">Browse photo and signature, then click Upload & View for confirmation.</p>
                </div>
                <span className={`rounded-md px-3 py-2 text-xs font-bold ${photoSignatureConfirmed ? "bg-brand-teal text-white" : "bg-white text-brand-orange"}`}>
                  {photoSignatureConfirmed ? "Saved" : "Pending"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-2">
                {photoSignatureFields.map((type) => (
                  <label key={type} className="grid gap-2 rounded-md border border-black/15 bg-white p-3 text-sm text-black/65">
                    {type.replaceAll("_", " ")}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        setFiles((current) => ({ ...current, [type]: event.target.files?.[0] }));
                        setPhotoSignatureConfirmed(false);
                        setPhotoSignaturePreviewOpen(false);
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-md bg-brand-orange px-4 py-3 font-semibold text-white"
                  onClick={() => {
                    if (!files.PHOTO || !files.SIGNATURE) {
                      setMessage("Please select both photo and signature.");
                      return;
                    }
                    setMessage("");
                    setPhotoSignaturePreviewOpen(true);
                  }}
                  type="button"
                >
                  Upload & View
                </button>
                {photoSignaturePreviewOpen ? (
                  <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => setPhotoSignatureConfirmed(true)} type="button">
                    Save Photo And Signature
                  </button>
                ) : null}
              </div>
              {photoSignaturePreviewOpen ? (
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  {photoSignatureFields.map((type) => (
                    <div key={type} className="rounded-md border border-brand-teal/15 bg-white p-3">
                      <p className="mb-2 font-semibold text-brand-ink">{type.replaceAll("_", " ")}</p>
                      <SelectedDocumentPreview file={files[type]} />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>

            <section className="rounded-md border border-brand-teal/20 bg-white p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h3 className="text-lg font-bold text-brand-ink">Documents</h3>
                  <p className="mt-1 text-sm text-black/60">Browse all documents, then click Upload & View. Confirm documents to unlock payment.</p>
                </div>
                <span className={`rounded-md px-3 py-2 text-xs font-bold ${documentsConfirmed ? "bg-brand-teal text-white" : "bg-brand-orange/10 text-brand-orange"}`}>
                  {documentsConfirmed ? "Confirmed" : "Pending"}
                </span>
              </div>
              <div className="mt-4 grid gap-4 md:grid-cols-3">
                {supportingDocumentFields.map((type) => (
                  <label key={type} className="grid gap-2 rounded-md border border-black/15 p-3 text-sm text-black/65">
                    {type.replaceAll("_", " ")}
                    <input
                      type="file"
                      onChange={(event) => {
                        setFiles((current) => ({ ...current, [type]: event.target.files?.[0] }));
                        setDocumentsConfirmed(false);
                        setDocumentsPreviewOpen(false);
                      }}
                    />
                  </label>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  className="rounded-md bg-brand-orange px-4 py-3 font-semibold text-white"
                  onClick={() => {
                    const missingDocument = supportingDocumentFields.find((type) => !files[type]);
                    if (missingDocument) {
                      setMessage(`Please select ${missingDocument.replaceAll("_", " ")}.`);
                      return;
                    }
                    setMessage("");
                    setDocumentsPreviewOpen(true);
                  }}
                  type="button"
                >
                  Upload & View
                </button>
                {documentsPreviewOpen ? (
                  <button className="rounded-md bg-brand-teal px-4 py-3 font-semibold text-white" onClick={() => setDocumentsConfirmed(true)} type="button">
                    Confirm Documents
                  </button>
                ) : null}
              </div>
              {documentsPreviewOpen ? (
                <div className="mt-4 grid gap-4 md:grid-cols-3">
                  {supportingDocumentFields.map((type) => (
                    <div key={type} className="rounded-md border border-black/10 p-3">
                      <p className="mb-2 font-semibold text-brand-ink">{type.replaceAll("_", " ")}</p>
                      <SelectedDocumentPreview file={files[type]} />
                    </div>
                  ))}
                </div>
              ) : null}
            </section>
          </div>
          <div className="sticky bottom-0 mt-5 flex flex-wrap justify-between gap-3 border-t border-brand-teal/10 bg-white py-4">
            <button className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal" onClick={() => setStep(1)} type="button">Back</button>
            <button
              className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-black/25"
              disabled={!photoSignatureConfirmed || !documentsConfirmed}
              onClick={nextFromDocuments}
              type="button"
            >
              Next: Payment
            </button>
          </div>
          </> : null}

          {step === 3 ? <div className="mt-5 rounded-md border border-brand-orange/25 bg-brand-orange/5 p-5">
            <h3 className="text-xl font-bold text-brand-ink">Payment Stage</h3>
            <p className="mt-2 text-sm text-black/65">Razorpay integration will be added tomorrow. For now, this stage confirms the selected course and first installment before creating the student profile.</p>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-semibold uppercase text-black/45">Course</p>
                <p className="mt-2 font-bold text-brand-ink">{selectedPlan?.name ?? "-"}</p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-semibold uppercase text-black/45">Total</p>
                <p className="mt-2 font-bold text-brand-ink">Rs {selectedPlan?.totalAmount ?? 0}</p>
              </div>
              <div className="rounded-md bg-white p-4">
                <p className="text-xs font-semibold uppercase text-black/45">First Installment</p>
                <p className="mt-2 font-bold text-brand-ink">{firstInstallment ? `Rs ${firstInstallment.amount}` : "-"}</p>
              </div>
            </div>
            <div className="mt-5 flex flex-wrap justify-between gap-3">
              <button className="rounded-md border border-brand-teal px-5 py-3 font-semibold text-brand-teal" onClick={() => setStep(2)} type="button">Back</button>
              <button className="rounded-md bg-brand-teal px-5 py-3 font-semibold text-white" onClick={createStudent} type="button">Create Student Profile</button>
            </div>
          </div> : null}
        </section>
      ) : null}
      {!showForm && message ? <p className="text-sm font-semibold text-brand-teal">{message}</p> : null}
      {!isAdmissionMode && activeTab === "students" ? <section className="overflow-hidden rounded-md border border-brand-teal/20 bg-white shadow-soft">
          <div className="overflow-x-auto">
          <table className="w-full min-w-[860px] border-collapse text-left text-sm">
          <thead className="bg-brand-teal text-white">
            <tr><th className="p-3">Student</th><th className="p-3">Mobile</th><th className="p-3">Branch</th><th className="p-3">Student ID</th><th className="p-3">LL Status</th><th className="p-3">View Details</th><th className="p-3">Documents</th></tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <Fragment key={student.id}>
                <tr className="border-t border-brand-teal/10">
                  <td className="p-3 font-semibold text-brand-ink">
                    <Link className="text-brand-teal underline-offset-4 hover:underline" href={`/dashboard/students/${student.id}`}>{student.fullName}</Link>
                  </td>
                  <td className="p-3">{student.phone}</td>
                  <td className="p-3">{student.branch?.name ?? "-"}</td>
                  <td className="p-3">{student.student?.studentCode}</td>
                  <td className="p-3">{student.student?.learningLicenseNo ?? "Pending"}</td>
                  <td className="p-3">
                    <Link className="inline-flex rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal" href={`/dashboard/students/${student.id}`}>
                      View Details
                    </Link>
                  </td>
                  <td className="p-3">
                    <button
                      className="rounded-md border border-brand-teal px-3 py-2 font-semibold text-brand-teal"
                      disabled={!student.student}
                      onClick={() => setOpenDocumentsFor((current) => current === student.id ? null : student.id)}
                      type="button"
                    >
                      {openDocumentsFor === student.id ? "Close" : "Upload"}
                    </button>
                  </td>
                </tr>
                {openDocumentsFor === student.id && student.student ? (
                  <tr className="border-t border-brand-teal/10">
                    <td className="p-3" colSpan={7}>
                      <DocumentUploadPanel ownerType="student" ownerId={student.student.id} documentTypes={studentDocumentTypes} />
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
      </section> : null}
      {!isAdmissionMode && activeTab === "swap-students" ? renderAuditTable("Swap Students Audit Log", adminAuditRows["swap-students"]) : null}
      {!isAdmissionMode && activeTab === "change-trainer" ? renderAuditTable("Change Trainer Audit Log", adminAuditRows["change-trainer"]) : null}
      {!isAdmissionMode && activeTab === "pause-students" ? renderAuditTable("Pause Students Audit Log", adminAuditRows["pause-students"]) : null}
      {!isAdmissionMode && activeTab === "stop-students" ? renderAuditTable("Stop Students Audit Log", adminAuditRows["stop-students"]) : null}
      {!isAdmissionMode && activeTab === "stop-refund" ? renderAuditTable("Stop & Refund Audit Log", adminAuditRows["stop-refund"]) : null}
    </div>
  );
}
