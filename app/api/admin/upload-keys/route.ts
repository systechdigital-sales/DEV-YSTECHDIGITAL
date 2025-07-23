import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ success: false, error: "No file provided" }, { status: 400 })
    }

    // Read file content
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const content = buffer.toString("utf8")

    // Parse CSV content (basic implementation)
    const lines = content.split("\n").filter((line) => line.trim())
    const headers = lines[0].split(",").map((h) => h.trim().replace(/"/g, ""))

    // Expected headers: Product Sub Category, Product, Activation Code
    const expectedHeaders = ["Product Sub Category", "Product", "Activation Code"]

    // Validate headers
    const hasValidHeaders = expectedHeaders.every((header) =>
      headers.some((h) => h.toLowerCase().includes(header.toLowerCase().replace(/\s/g, ""))),
    )

    if (!hasValidHeaders) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid file format. Please ensure columns: Product Sub Category, Product, Activation Code",
        },
        { status: 400 },
      )
    }

    // Parse data rows
    const keysData = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map((v) => v.trim().replace(/"/g, ""))
      if (values.length >= 3) {
        keysData.push({
          productSubCategory: values[0],
          product: values[1],
          activationCode: values[2],
        })
      }
    }

    // Save to OTT keys (in production, save to database)
    const response = await fetch(`${request.nextUrl.origin}/api/admin/keys`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(keysData),
    })

    const result = await response.json()

    if (result.success) {
      return NextResponse.json({
        success: true,
        count: keysData.length,
        message: `Successfully uploaded ${keysData.length} OTT keys`,
      })
    } else {
      return NextResponse.json({ success: false, error: "Failed to save OTT keys" }, { status: 500 })
    }
  } catch (error) {
    console.error("Error uploading OTT keys file:", error)
    return NextResponse.json({ success: false, error: "Failed to process file" }, { status: 500 })
  }
}
