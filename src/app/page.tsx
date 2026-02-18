"use client";

import { useState } from "react";
import GeneratorForm from "@/components/GeneratorForm";
import ComponentPreview from "@/components/ComponentPreview";
import { GeneratedComponent } from "@/types";
import { Code2, Sparkles } from "lucide-react";

export default function Home() {
  const [currentComponent, setCurrentComponent] =
    useState<GeneratedComponent | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleGenerate = async (componentId: string) => {
    setIsLoading(true);
    try {
      // Fetch el componente generado
      const response = await fetch(`/api/components/${componentId}`);
      const data = await response.json();

      if (data.success) {
        setCurrentComponent(data.component);
      }
    } catch (error) {
      console.error("Error loading component:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewComponent = () => {
    setCurrentComponent(null);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2 rounded-lg">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  UI Component Generator
                </h1>
                <p className="text-sm text-gray-600">
                  Genera componentes React con IA
                </p>
              </div>
            </div>
            {currentComponent && (
              <button
                onClick={handleNewComponent}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all font-medium shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Sparkles className="w-4 h-4" />
                Generar Nuevo
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {!currentComponent ? (
          <div className="max-w-3xl mx-auto">
            {/* Hero section */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium mb-6">
                <Sparkles className="w-4 h-4" />
                Potenciado por IA
              </div>
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Describe tu componente,
                <br />
                <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  la IA lo crea
                </span>
              </h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Genera componentes React profesionales con TypeScript y Tailwind
                CSS en segundos. Sin configuración, sin boilerplate.
              </p>
            </div>

            {/* Form card */}
            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
              <GeneratorForm onGenerate={handleGenerate} />
            </div>

            {/* Features grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="text-center p-6">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Súper Rápido
                </h3>
                <p className="text-sm text-gray-600">
                  Genera componentes en segundos, no horas
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-3xl mb-3">🎨</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Múltiples Variantes
                </h3>
                <p className="text-sm text-gray-600">
                  Automáticamente genera diferentes tamaños y estilos
                </p>
              </div>
              <div className="text-center p-6">
                <div className="text-3xl mb-3">📦</div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  Listo para Usar
                </h3>
                <p className="text-sm text-gray-600">
                  Copia y pega directo en tu proyecto
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-6xl mx-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className="text-gray-600">Cargando componente...</p>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
                <ComponentPreview component={currentComponent} />
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
