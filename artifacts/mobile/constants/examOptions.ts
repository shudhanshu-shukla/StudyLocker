export interface ExamCategory {
  id: string;
  label: string;
  icon: string;
  exams: ExamOption[];
}

export interface ExamOption {
  id: string;
  name: string;
  classes?: string[];
  boards?: string[];
}

export const CLASS_LIST = ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10", "Class 11", "Class 12"];

export const BOARDS = [
  "CBSE", "ICSE / ISC",
  "Maharashtra (SSC/HSC)", "UP Board", "Tamil Nadu (TNBSE)", "Karnataka (KSEEB)",
  "Kerala (SSLC/DHSE)", "Rajasthan (RBSE)", "Gujarat (GSEB)", "West Bengal (WBBSE)",
  "Bihar (BSEB)", "Odisha (BSE)", "Assam (AHSEC)", "Haryana (HBSE)", "Punjab (PSEB)",
  "Delhi (CBSE affiliated)", "Uttarakhand (UBSE)", "Jharkhand (JAC)", "Chhattisgarh (CGBSE)",
  "Himachal Pradesh (HPBOSE)", "Goa", "Andhra Pradesh (BSEAP)", "Telangana (BSETS)",
  "Manipur (BSEM)", "Meghalaya (MBOSE)", "Nagaland (NBSE)", "Tripura (TBSE)",
  "Arunachal Pradesh (BSEAP)", "Sikkim (SBSE)", "Mizoram (MBSE)",
];

export const EXAM_CATEGORIES: ExamCategory[] = [
  {
    id: "school",
    label: "School / Board Exams",
    icon: "book",
    exams: [
      { id: "cbse_6_8", name: "CBSE — Class 6 to 8", classes: ["Class 6", "Class 7", "Class 8"] },
      { id: "cbse_9_10", name: "CBSE — Class 9 & 10", classes: ["Class 9", "Class 10"] },
      { id: "cbse_11_12", name: "CBSE — Class 11 & 12", classes: ["Class 11", "Class 12"] },
      { id: "icse_6_10", name: "ICSE — Class 6 to 10", classes: ["Class 6", "Class 7", "Class 8", "Class 9", "Class 10"] },
      { id: "isc_11_12", name: "ISC — Class 11 & 12", classes: ["Class 11", "Class 12"] },
      { id: "state_6_8", name: "State Board — Class 6 to 8", classes: ["Class 6", "Class 7", "Class 8"] },
      { id: "state_9_10", name: "State Board — Class 9 & 10", classes: ["Class 9", "Class 10"] },
      { id: "state_11_12", name: "State Board — Class 11 & 12", classes: ["Class 11", "Class 12"] },
    ],
  },
  {
    id: "engineering",
    label: "Engineering Entrance",
    icon: "cpu",
    exams: [
      { id: "jee_main", name: "JEE Main" },
      { id: "jee_advanced", name: "JEE Advanced" },
      { id: "bitsat", name: "BITSAT" },
      { id: "viteee", name: "VITEEE" },
      { id: "srmjeee", name: "SRMJEEE" },
      { id: "mht_cet", name: "MHT-CET (Maharashtra)" },
      { id: "ap_eamcet", name: "AP EAMCET" },
      { id: "ts_eamcet", name: "TS EAMCET" },
      { id: "kcet", name: "KCET (Karnataka)" },
      { id: "keam", name: "KEAM (Kerala)" },
      { id: "wbjee", name: "WBJEE (West Bengal)" },
      { id: "cuet_engineering", name: "CUET (Engineering)" },
    ],
  },
  {
    id: "medical",
    label: "Medical Entrance",
    icon: "activity",
    exams: [
      { id: "neet_ug", name: "NEET UG" },
      { id: "neet_pg", name: "NEET PG" },
      { id: "aiapget", name: "AIAPGET (Ayurveda)" },
      { id: "fmge", name: "FMGE / MCI Screening" },
    ],
  },
  {
    id: "civil_services",
    label: "Civil Services & Government",
    icon: "shield",
    exams: [
      { id: "upsc_ias", name: "UPSC — IAS / IPS / IFS" },
      { id: "upsc_cds", name: "UPSC — CDS (Defence)" },
      { id: "upsc_capf", name: "UPSC — CAPF" },
      { id: "mpsc", name: "MPSC (Maharashtra)" },
      { id: "tnpsc", name: "TNPSC (Tamil Nadu)" },
      { id: "uppsc", name: "UPPSC (Uttar Pradesh)" },
      { id: "kpsc", name: "KPSC (Karnataka)" },
      { id: "bpsc", name: "BPSC (Bihar)" },
      { id: "rpsc", name: "RPSC (Rajasthan)" },
      { id: "mppsc", name: "MPPSC (Madhya Pradesh)" },
      { id: "appsc", name: "APPSC (Andhra Pradesh)" },
      { id: "tspsc", name: "TSPSC (Telangana)" },
      { id: "ukpsc", name: "UKPSC (Uttarakhand)" },
      { id: "nda", name: "NDA (National Defence Academy)" },
      { id: "afcat", name: "AFCAT (Air Force)" },
    ],
  },
  {
    id: "ssc_railway",
    label: "SSC & Railway",
    icon: "navigation",
    exams: [
      { id: "ssc_cgl", name: "SSC CGL" },
      { id: "ssc_chsl", name: "SSC CHSL" },
      { id: "ssc_mts", name: "SSC MTS" },
      { id: "ssc_je", name: "SSC JE" },
      { id: "ssc_gd", name: "SSC GD Constable" },
      { id: "rrb_ntpc", name: "RRB NTPC" },
      { id: "rrb_group_d", name: "RRB Group D" },
      { id: "rrb_je", name: "RRB JE (Junior Engineer)" },
      { id: "rrb_alp", name: "RRB ALP (Loco Pilot)" },
    ],
  },
  {
    id: "banking",
    label: "Banking & Insurance",
    icon: "dollar-sign",
    exams: [
      { id: "ibps_po", name: "IBPS PO" },
      { id: "ibps_clerk", name: "IBPS Clerk" },
      { id: "ibps_so", name: "IBPS SO" },
      { id: "sbi_po", name: "SBI PO" },
      { id: "sbi_clerk", name: "SBI Clerk" },
      { id: "rbi_grade_b", name: "RBI Grade B" },
      { id: "rbi_assistant", name: "RBI Assistant" },
      { id: "nabard", name: "NABARD Grade A/B" },
      { id: "lic_aao", name: "LIC AAO" },
      { id: "lic_hfl", name: "LIC HFL" },
    ],
  },
  {
    id: "management",
    label: "Management (MBA)",
    icon: "briefcase",
    exams: [
      { id: "cat", name: "CAT" },
      { id: "mat", name: "MAT" },
      { id: "xat", name: "XAT" },
      { id: "gmat", name: "GMAT" },
      { id: "snap", name: "SNAP" },
      { id: "nmat", name: "NMAT" },
      { id: "iift", name: "IIFT" },
      { id: "cmat", name: "CMAT" },
    ],
  },
  {
    id: "law",
    label: "Law Entrance",
    icon: "file-text",
    exams: [
      { id: "clat", name: "CLAT" },
      { id: "ailet", name: "AILET (NLU Delhi)" },
      { id: "lsat_india", name: "LSAT India" },
      { id: "mh_cet_law", name: "MH CET Law" },
      { id: "ap_lawcet", name: "AP LAWCET" },
    ],
  },
  {
    id: "design",
    label: "Design & Architecture",
    icon: "edit-3",
    exams: [
      { id: "nid", name: "NID (National Institute of Design)" },
      { id: "nift", name: "NIFT" },
      { id: "ceed", name: "CEED" },
      { id: "nata", name: "NATA (Architecture)" },
      { id: "jee_b_arch", name: "JEE B.Arch / B.Planning" },
    ],
  },
  {
    id: "postgrad",
    label: "Postgraduate & Research",
    icon: "award",
    exams: [
      { id: "gate", name: "GATE" },
      { id: "ugc_net", name: "UGC NET" },
      { id: "csir_net", name: "CSIR NET" },
      { id: "cuet_pg", name: "CUET PG" },
      { id: "cat_iim", name: "IIM — FPM / Doctoral" },
    ],
  },
  {
    id: "ca_finance",
    label: "CA / Finance",
    icon: "trending-up",
    exams: [
      { id: "ca_foundation", name: "CA Foundation" },
      { id: "ca_intermediate", name: "CA Intermediate" },
      { id: "ca_final", name: "CA Final" },
      { id: "cma_foundation", name: "CMA Foundation" },
      { id: "cma_intermediate", name: "CMA Intermediate" },
      { id: "cs_foundation", name: "CS Foundation / Executive" },
    ],
  },
  {
    id: "cuet",
    label: "CUET (Central University)",
    icon: "globe",
    exams: [
      { id: "cuet_ug", name: "CUET UG" },
      { id: "cuet_pg_gen", name: "CUET PG" },
    ],
  },
  {
    id: "other",
    label: "Other / General Studies",
    icon: "book-open",
    exams: [
      { id: "olympiad", name: "Olympiads (Maths / Science)" },
      { id: "ntse", name: "NTSE" },
      { id: "kvpy", name: "KVPY / INSPIRE" },
      { id: "general", name: "General Self-Study" },
    ],
  },
];
