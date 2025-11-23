import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)

    // Get filter parameters (comma-separated for multiple values)
    const service = searchParams.get("service")
    const source = searchParams.get("source")
    const category = searchParams.get("category")
    const subservice = searchParams.get("subservice")
    const priority = searchParams.get("priority")
    const page = parseInt(searchParams.get("page") || "1")
    const pageSize = parseInt(searchParams.get("pageSize") || "10")

    // Build query
    let query = supabase
      .from("incidents")
      .select("*", { count: "exact" })
      .order("time", { ascending: false })

    // Apply filters - use .in() for multiple values (OR within same field)
    // Multiple different fields create AND conditions
    if (service) {
      const values = service.split(',').map(v => v.trim())
      query = query.in("service", values)
    }
    if (source) {
      const values = source.split(',').map(v => v.trim())
      query = query.in("source", values)
    }
    if (category) {
      const values = category.split(',').map(v => v.trim())
      query = query.in("category", values)
    }
    if (subservice) {
      const values = subservice.split(',').map(v => v.trim())
      query = query.in("subservice", values)
    }
    if (priority) {
      const values = priority.split(',').map(v => parseInt(v.trim()))
      query = query.in("priority", values)
    }

    // Apply pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    const { data, error, count } = await query

    if (error) {
      console.error("Supabase query error:", error)
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      pagination: {
        total: count || 0,
        page,
        pageSize,
        totalPages: Math.ceil((count || 0) / pageSize),
      },
    })
  } catch (error) {
    console.error("API error:", error)
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch incidents"
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const body = await request.json()

    const { data, error } = await supabase
      .from("incidents")
      .insert([body])
      .select()
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Failed to create incident" },
      { status: 500 }
    )
  }
}
