"use client";

import { useState } from "react";
import { ComponentCategory, CATEGORIES } from "@/types";
import { Sparkles, Loader2 } from "lucide-react";
import toast from "react-hot-toast";

interface GeneratorFormProps {
  onGenerate: (componentId: string) => void;
}

export default function GeneratorForm({ onGenerate }: GeneratorFormProps) {
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ComponentCategory>("button");
  const [includeVariants, setIncludeVariants] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!description.trim()) {
      toast.error("Por favor, describe el componente");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description,
          category,
          includeVariants,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Generation failed");
      }

      toast.success("¡Componente generado!");
      onGenerate(data.component.id);

      // Limpiar form
      setDescription("");
    } catch (error) {
      console.error("Error:", error);
      toast.error(error instanceof Error ? error.message : "Error al generar");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Selector de categoría */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-3">
          Tipo de Componente
        </label>
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              type="button"
              onClick={() => setCategory(cat.value)}
              className={`
                p-3 rounded-lg border-2 transition-all text-center
                ${
                  category === cat.value
                    ? "border-blue-500 bg-blue-50 text-blue-700"
                    : "border-gray-200 hover:border-gray-300 text-gray-700"
                }
              `}
            >
              <div className="text-2xl mb-1">{cat.icon}</div>
              <div className="text-xs font-medium">{cat.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Descripción */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Describe tu componente
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Ej: Un botón primario con gradiente azul, icono de check, animación hover suave, y esquinas redondeadas"
          rows={4}
          disabled={isGenerating}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
        />
        <p className="mt-2 text-xs text-gray-500">
          💡 Tip: Sé específico sobre colores, tamaños, animaciones y
          funcionalidad
        </p>
      </div>

      {/* Checkbox de variantes */}
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="includeVariants"
          checked={includeVariants}
          onChange={(e) => setIncludeVariants(e.target.checked)}
          disabled={isGenerating}
          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
        />
        <label htmlFor="includeVariants" className="text-sm text-gray-700">
          Generar variantes (tamaños, colores, estilos)
        </label>
      </div>

      {/* Botón generar */}
      <button
        type="submit"
        disabled={isGenerating || !description.trim()}
        className="
          w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-purple-600 
          text-white rounded-lg font-medium
          hover:from-blue-700 hover:to-purple-700
          disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
          transform hover:scale-[1.02] active:scale-[0.98]
          transition-all duration-200
          shadow-lg hover:shadow-xl
          flex items-center justify-center gap-2
        "
      >
        {isGenerating ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Generando componente...
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generar Componente
          </>
        )}
      </button>
    </form>
  );
}
