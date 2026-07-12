export const branches = [
  { id: 2, code: "DPK", name: "Depok" },
  { id: 3, code: "JKS", name: "Jakarta Selatan" },
  { id: 4, code: "TGR", name: "Tangerang" },
  { id: 6, code: "CKR1", name: "Cikarang Utara" },
  { id: 5, code: "CKR2", name: "Cikarang Selatan" },
] as const

export type BranchCode = (typeof branches)[number]["code"]

export function getBranchIdByCode(code: string): number | undefined {
  return branches.find((b) => b.code === code)?.id
}