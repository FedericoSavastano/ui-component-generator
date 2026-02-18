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
3. Usa solo Tailwind CSS para estilos (sin CSS modules, sin styled-components)
4. El componente debe ser auto-contenido (todas las dependencias incluidas)
5. Incluye tipos TypeScript apropiados
6. Usa lucide-react para iconos si son necesarios

ESTRUCTURA DEL JSON:
{
  "name": "NombreDelComponente",
  "code": "código completo del componente en string",
  "category": "${category}",
  "variants": [
    {"name": "default", "props": {}},
    {"name": "small", "props": {"size": "sm"}},
    {"name": "large", "props": {"size": "lg"}}
  ],
  "preview_props": {"label": "Click me"},
  "tags": ["animated", "modern", "gradient"]
}

EJEMPLO DE CÓDIGO DEL COMPONENTE:
\`\`\`typescript
interface ButtonProps {
  label: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'secondary';
  onClick?: () => void;
}

export default function Button({ label, size = 'md', variant = 'primary', onClick }: ButtonProps) {
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
      className={\`rounded-lg font-medium transition-colors \${sizeClasses[size]} \${variantClasses[variant]}\`}
    >
      {label}
    </button>
  );
}
\`\`\`

${includeVariants ? "INCLUYE AL MENOS 3 VARIANTES (pequeño, mediano, grande o diferentes colores)." : "NO incluyas variantes."}

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

    // Validar estructura
    if (!result.name || !result.code) {
      throw new Error("Invalid component structure");
    }

    // Asegurar que tenga las propiedades necesarias
    return {
      name: result.name,
      code: result.code,
      category: result.category || category,
      variants: result.variants || [{ name: "default", props: {} }],
      preview_props: result.preview_props || {},
      tags: result.tags || [],
    };
  } catch (error) {
    console.error("Error generating component:", error);
    throw new Error("Failed to generate component");
  }
}
