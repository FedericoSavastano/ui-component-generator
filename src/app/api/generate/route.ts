import { NextRequest, NextResponse } from "next/server";
import { generateComponent, editComponent } from "@/lib/ai";
import { supabase } from "@/lib/supabase";
import { ComponentCategory } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      description,
      category,
      includeVariants,
      editMode,
      existingCode,
      editInstructions,
    } = body;

    console.log("=== API GENERATE REQUEST ===");
    console.log("Edit mode:", editMode);
    console.log("Category:", category);

    let component;

    // MODO EDICIÓN
    if (editMode && existingCode && editInstructions) {
      console.log("🔧 EDITING COMPONENT");
      console.log("Instructions:", editInstructions);
      console.log("Existing code length:", existingCode.length);

      component = await editComponent(
        existingCode,
        editInstructions,
        category as ComponentCategory,
      );

      console.log("✅ Component edited successfully:", component.name);
    }
    // MODO NORMAL (generación desde descripción)
    else {
      // Validar que exista descripción solo en modo normal
      if (!description || description.trim().length === 0) {
        console.log("❌ Validation failed: description is required");
        return NextResponse.json(
          { success: false, message: "Description is required" },
          { status: 400 },
        );
      }

      console.log("✨ GENERATING NEW COMPONENT");
      console.log("Description:", description);

      component = await generateComponent(
        description,
        category as ComponentCategory,
        includeVariants !== false,
      );

      console.log("✅ Component generated successfully:", component.name);
    }

    // Guardar en Supabase
    console.log("💾 Saving to database...");

    const { data: savedComponent, error } = await supabase
      .from("components")
      .insert({
        name: component.name,
        // Usar editInstructions como descripción si estamos en editMode
        description:
          description || editInstructions || "Component edited with AI",
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
      console.error("❌ Supabase error:", error);
      throw error;
    }

    console.log("✅ Component saved with ID:", savedComponent.id);

    return NextResponse.json({
      success: true,
      component: savedComponent,
    });
  } catch (error) {
    console.error("❌ Generation error:", error);

    // Dar más contexto del error
    let errorMessage = "Generation failed";

    if (error instanceof Error) {
      errorMessage = error.message;

      // Si es error de parseo JSON de la IA
      if (error.message.includes("JSON")) {
        errorMessage = "AI returned invalid format. Please try again.";
      }

      // Si es error de Groq/AI
      if (error.message.includes("API")) {
        errorMessage = "AI service temporarily unavailable. Please try again.";
      }
    }

    return NextResponse.json(
      {
        success: false,
        message: errorMessage,
      },
      { status: 500 },
    );
  }
}
