import Groq from "groq-sdk";

import { ComponentCategory } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

/**
 * Genera componente desde descripción de texto
 */
export async function generateComponent(
  description: string,
  category: ComponentCategory = "other",
  includeVariants: boolean = true,
) {
  const prompt = `Eres un experto en React, TypeScript y Tailwind CSS. Genera un componente React basado en esta descripción.

DESCRIPCIÓN: ${description}
CATEGORÍA: ${category}

REQUISITOS ESTRICTOS:
1. Responde ÚNICAMENTE con JSON válido (sin markdown, sin backticks)
2. El código debe ser React + TypeScript funcional
3. Usa solo Tailwind CSS para estilos
4. NO uses iconos de lucide-react - usa emojis o texto en su lugar
5. El componente debe ser auto-contenido
6. Usa sintaxis function, NO arrow functions
7. Define props con valores default directos en los parámetros

ESTRUCTURA DEL JSON:
{
  "name": "NombreDelComponente",
  "code": "código completo del componente",
  "category": "${category}",
  "variants": [
    {"name": "default", "props": {}},
    {"name": "small", "props": {"size": "sm"}},
    {"name": "large", "props": {"size": "lg"}}
  ],
  "preview_props": {},
  "tags": ["animated", "modern"]
}

IMPORTANTE SOBRE preview_props:
- Para BUTTONS: {"label": "Click me"}
- Para CARDS: {"title": "Card Title", "description": "Description text"}
- Para INPUTS: {"placeholder": "Enter text...", "label": "Input Label"}
- Para BADGES: {"text": "Badge"}
- Para ALERTS: {"title": "Alert", "message": "This is an alert message"}
- Para OTROS: Deja preview_props como {} vacío si el componente no necesita props para verse bien

EJEMPLO DE CÓDIGO (SIN ICONOS - USA EMOJIS):
\`\`\`typescript
function Button({ label = 'Button', size = 'md', variant = 'primary', emoji = '✓', onClick }) {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800'
  };

  return (
    <button
      onClick={onClick}
      className={'rounded-lg font-medium transition-colors flex items-center gap-2 ' + sizeClasses[size] + ' ' + variantClasses[variant]}
    >
      {emoji && <span>{emoji}</span>}
      {label}
    </button>
  );
}
\`\`\`

REGLAS ADICIONALES:
- Si necesitas íconos, usa EMOJIS en vez de componentes (ej: ✓ ✕ ➜ ⭐ ❤️ 🔍 ⚙️ 📧 📞 🏠 👤)
- NO uses imports de ningún tipo
- NO uses template literals complejos con \${} - usa concatenación simple con +
- Los componentes deben verse bien SIN necesidad de props externos
- Usa defaults inteligentes para que el componente se vea completo

${includeVariants ? "INCLUYE AL MENOS 3 VARIANTES con diferentes tamaños o estilos." : "NO incluyas variantes."}

Responde SOLO con el JSON:`;

  try {
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en React y TypeScript. Siempre respondes con JSON válido, sin markdown ni texto adicional.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("No response from AI");
    }

    // Limpiar la respuesta
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    try {
      const result = JSON.parse(cleanedText);

      if (!result.name || !result.code) {
        throw new Error("Invalid component structure");
      }

      // Ajustar preview_props según categoría si están vacíos o incorrectos
      let previewProps = result.preview_props || {};

      if (Object.keys(previewProps).length === 0) {
        switch (category) {
          case "button":
            previewProps = { label: "Click me" };
            break;
          case "card":
            previewProps = { title: "Card Title", description: "Description" };
            break;
          case "input":
            previewProps = { label: "Label", placeholder: "Enter text..." };
            break;
          case "badge":
            previewProps = { text: "Badge" };
            break;
          case "alert":
            previewProps = { title: "Alert", message: "This is a message" };
            break;
          case "navbar":
          case "modal":
          case "form":
          case "other":
            previewProps = {};
            break;
        }
      }

      return {
        name: result.name,
        code: result.code,
        category: result.category || category,
        variants: result.variants || [{ name: "default", props: {} }],
        preview_props: previewProps,
        tags: result.tags || [],
      };
    } catch (error) {
      console.error("Error parsing AI response:");
      console.error("Raw response:", responseText);
      console.error("Cleaned text:", cleanedText);
      console.error("Parse error:", error);

      return {
        name: "Component",
        code: "// Error parsing AI response",
        category,
        variants: [{ name: "default", props: {} }],
        preview_props: {},
        tags: ["error"],
      };
    }
  } catch (error) {
    console.error("Error generating component:", error);
    throw new Error("Failed to generate component");
  }
}

/**
 * Edita un componente existente con nuevas instrucciones
 * Usa Groq (gratis)
 */
export async function editComponent(
  existingCode: string,
  editInstructions: string,
  category: ComponentCategory,
): Promise<any> {
  const prompt = `Tienes este componente React + Tailwind CSS:

\`\`\`typescript
${existingCode}
\`\`\`

INSTRUCCIONES DE EDICIÓN:
${editInstructions}

Modifica el componente según las instrucciones. Responde ÚNICAMENTE con JSON válido (sin markdown):

{
  "name": "NombreDelComponente",
  "code": "código completo modificado",
  "category": "${category}",
  "variants": [
    {"name": "default", "props": {}},
    {"name": "small", "props": {"size": "sm"}},
    {"name": "large", "props": {"size": "lg"}}
  ],
  "preview_props": {},
  "tags": ["edited", "improved"]
}

IMPORTANTE:
- MANTÉN la estructura general del componente
- APLICA los cambios solicitados
- Si piden cambiar colores, cambia las clases de Tailwind apropiadas
- Si piden cambiar tamaños, ajusta padding, text-size, etc.
- Si piden agregar elementos, agrégalos manteniendo el estilo
- Usa function declarations (NO arrow functions)
- Solo Tailwind CSS para estilos
- NO uses imports
- Usa concatenación con + en vez de template literals \${}
- Usa EMOJIS si necesitas iconos (NO lucide-react)

Responde SOLO con el JSON:`;

  try {
    console.log("Calling Groq for editing...");

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content:
            "Eres un experto en React y TypeScript. Editas componentes según instrucciones. Siempre respondes con JSON válido sin markdown.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.5,
      max_tokens: 3000,
    });

    const responseText = completion.choices[0]?.message?.content || "";

    if (!responseText) {
      throw new Error("No response from AI");
    }

    console.log("AI response received, parsing...");

    // Limpiar respuesta
    let cleanedText = responseText.trim();
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    const result = JSON.parse(cleanedText);

    if (!result.name || !result.code) {
      throw new Error("Invalid component structure from AI");
    }

    // Ajustar preview_props según categoría si están vacíos
    let previewProps = result.preview_props || {};

    if (Object.keys(previewProps).length === 0) {
      switch (category) {
        case "button":
          previewProps = { label: "Click me" };
          break;
        case "card":
          previewProps = { title: "Card Title", description: "Description" };
          break;
        case "input":
          previewProps = { label: "Label", placeholder: "Enter text..." };
          break;
        case "badge":
          previewProps = { text: "Badge" };
          break;
        case "alert":
          previewProps = { title: "Alert", message: "This is a message" };
          break;
        default:
          previewProps = {};
      }
    }

    return {
      name: result.name,
      code: result.code,
      category: result.category || category,
      variants: result.variants || [{ name: "default", props: {} }],
      preview_props: previewProps,
      tags: result.tags || ["edited"],
    };
  } catch (error) {
    console.error("Error editing component:", error);
    throw new Error("Failed to edit component");
  }
}
