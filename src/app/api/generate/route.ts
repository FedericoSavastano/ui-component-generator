import { NextRequest, NextResponse } from "next/server";
import { generateComponent } from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import { ComponentCategory } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { description, category, includeVariants } = await request.json();

    if (!description || description.trim().length === 0) {
      return NextResponse.json(
        { success: false, message: "Description is required" },
        { status: 400 },
      );
    }

    console.log("Generating component...");
    console.log("Description:", description);
    console.log("Category:", category);

    // Generar componente con IA
    const component = await generateComponent(
      description,
      category as ComponentCategory,
      includeVariants !== false,
    );

    console.log("Component generated:", component.name);

    // Guardar en Supabase
    const { data: savedComponent, error } = await supabase
      .from("components")
      .insert({
        name: component.name,
        description,
        category: component.category,
        code: component.code,
        variants: component.variants,
        preview_props: component.preview_props,
        tags: component.tags,
        is_public: false,
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }

    console.log("Component saved:", savedComponent.id);

    return NextResponse.json({
      success: true,
      component: savedComponent,
    });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      {
        success: false,
        message: error instanceof Error ? error.message : "Generation failed",
      },
      { status: 500 },
    );
  }
}
