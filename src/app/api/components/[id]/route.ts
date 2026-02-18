import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const params = await context.params;
    const componentId = params.id;

    const { data: component, error } = await supabase
      .from("components")
      .select("*")
      .eq("id", componentId)
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    if (!component) {
      return NextResponse.json(
        { success: false, message: "Component not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      success: true,
      component,
    });
  } catch (error) {
    console.error("Error fetching component:", error);
    return NextResponse.json(
      { success: false, message: "Failed to fetch component" },
      { status: 500 },
    );
  }
}
