import { NextRequest, NextResponse } from "next/server";
import connectMongoDB from "@/lib/mongodb";
import { Event } from "@/database/event.model";

/**
 * Route context type for dynamic params
 */
interface RouteContext {
  params: {
    slug?: string;
  };
}

/**
 * GET /api/events/[slug]
 * Fetch a single event by its unique slug
 */
export async function GET(
  _request: NextRequest,
  { params }: RouteContext
): Promise<NextResponse> {
  try {
    // Ensure database connection
    await connectMongoDB();

    const { slug } = await params;

    // Validate slug parameter
    if (!slug || typeof slug !== "string") {
      return NextResponse.json(
        { error: "Event slug is required" },
        { status: 400 }
      );
    }

    // Find event by slug
    const event = await Event.findOne({ slug }).lean();

    // Handle not found
    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    // Successful response
    return NextResponse.json(event, { status: 200 });
  } catch (error) {
    // Log error for observability (avoid leaking internals to client)
    console.error("GET /api/events/[slug] error:", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
