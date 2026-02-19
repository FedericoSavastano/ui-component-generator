import Groq from "groq-sdk";
import { ComponentCategory } from "@/types";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY!,
});

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
            "Eres un experto en React y TypeScript. Siempre respondes con JSON válido sin markdown ni texto adicional.",
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

    // Limpiar respuesta
    let cleanedText = responseText.trim();

    // Remover markdown si existe
    cleanedText = cleanedText.replace(/```json\n?/g, "").replace(/```\n?/g, "");

    // Buscar JSON en el texto
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      cleanedText = jsonMatch[0];
    }

    // Parsear JSON
    const result = JSON.parse(cleanedText);

    // Ajustar preview_props según categoría si están vacíos o incorrectos
    let previewProps = result.preview_props || {};

    if (Object.keys(previewProps).length === 0) {
      // Si está vacío, generar props apropiados según categoría
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
          // Estos se ven bien sin props
          previewProps = {};
          break;
      }
    }

    // Asegurar que tenga las propiedades necesarias
    return {
      name: result.name,
      code: result.code,
      category: result.category || category,
      variants: result.variants || [{ name: "default", props: {} }],
      preview_props: previewProps, // ← Usar los props validados
      tags: result.tags || [],
    };

    // // Validar estructura
    // if (!result.name || !result.code) {
    //   throw new Error("Invalid component structure");
    // }

    // // Asegurar que tenga las propiedades necesarias
    // return {
    //   name: result.name,
    //   code: result.code,
    //   category: result.category || category,
    //   variants: result.variants || [{ name: "default", props: {} }],
    //   preview_props: result.preview_props || {},
    //   tags: result.tags || [],
    // };
  } catch (error) {
    console.error("Error generating component:", error);
    throw new Error("Failed to generate component");
  }
}
