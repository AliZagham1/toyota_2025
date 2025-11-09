import { NextResponse } from "next/server"
import { listDealers } from "@/lib/dealers"

export async function GET() {
  const dealers = listDealers().map((d) => ({
    key: d.key,
    displayName: d.displayName,
    domain: d.domain,
  }))
  return NextResponse.json({ success: true, dealers })
}


