import * as XLSX from "xlsx"

export function parseExcel(buffer: Buffer): any[] {
  const workbook = XLSX.read(buffer, { type: "buffer" })
  const sheetName = workbook.SheetNames[0]
  const worksheet = workbook.Sheets[sheetName]
  return XLSX.utils.sheet_to_json(worksheet)
}

export function parseCSV(csvString: string): any[] {
  // Use XLSX.utils.sheet_to_json for CSV as well for consistent parsing behavior
  // This handles headers and data parsing more robustly than a manual split.
  const worksheet = XLSX.utils.csv_to_sheet(csvString)
  return XLSX.utils.sheet_to_json(worksheet)
}
