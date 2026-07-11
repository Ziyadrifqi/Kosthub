export const branches = [
  { code: "DPK", name: "Depok" },
  { code: "JKS", name: "Jakarta Selatan" },
  { code: "TGR", name: "Tangerang" },
  { code: "CKR1", name: "Cikarang Utara" },
  { code: "CKR2", name: "Cikarang Selatan" },
] as const

export type BranchCode = (typeof branches)[number]["code"]
