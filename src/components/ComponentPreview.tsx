"use client";

import { useState } from "react";
import { GeneratedComponent, ComponentVariant } from "@/types";
import {
  Code,
  Copy,
  Download,
  Eye,
  EyeOff,
  Check,
  Play,
  Edit3,
} from "lucide-react";
import Editor from "@monaco-editor/react";
import toast from "react-hot-toast";
import IframePreview from "./IframePreview";
import EditModal from "./EditModal";

interface ComponentPreviewProps {
  component: GeneratedComponent;
  onComponentUpdated?: (newComponent: GeneratedComponent) => void;
}

export default function ComponentPreview({
  component,
  onComponentUpdated,
}: ComponentPreviewProps) {
  const [showCode, setShowCode] = useState(false);
  const [showLivePreview, setShowLivePreview] = useState(true);
  const [selectedVariant, setSelectedVariant] = useState<ComponentVariant>(
    component.variants[0] || { name: "default", props: {} },
  );
  const [copied, setCopied] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(component.code);
      setCopied(true);
      toast.success("Código copiado al portapapeles");
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error("Error al copiar código");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([component.code], { type: "text/typescript" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${component.name}.tsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("Archivo descargado");
  };

  const handleEdit = async (instructions: string) => {
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          editMode: true,
          existingCode: component.code,
          editInstructions: instructions,
          category: component.category,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message || "Edit failed");
      }

      toast.success("¡Componente actualizado!");

      // Notificar al padre que el componente cambió
      if (onComponentUpdated) {
        onComponentUpdated(data.component);
      }
    } catch (error) {
      toast.error("Error al editar componente");
      throw error;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">{component.name}</h2>
          <p className="text-sm text-gray-600 mt-1">{component.description}</p>
          <div className="flex gap-2 mt-2">
            {component.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-full"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex gap-2 flex-wrap justify-end">
          <button
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center gap-2 px-3 py-2 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg transition-colors text-sm font-medium"
          >
            <Edit3 className="w-4 h-4" />
            Editar
          </button>

          <button
            onClick={() => setShowLivePreview(!showLivePreview)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors text-sm font-medium ${
              showLivePreview
                ? "bg-green-100 text-green-700 hover:bg-green-200"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            }`}
          >
            <Play className="w-4 h-4" />
            {showLivePreview ? "Preview ON" : "Preview OFF"}
          </button>

          <button
            onClick={() => setShowCode(!showCode)}
            className="flex items-center gap-2 px-3 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors text-sm font-medium"
          >
            {showCode ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
            {showCode ? "Ocultar" : "Ver"} Código
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-2 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            {copied ? (
              <Check className="w-4 h-4" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            {copied ? "Copiado" : "Copiar"}
          </button>

          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
          >
            <Download className="w-4 h-4" />
            Descargar
          </button>
        </div>
      </div>

      {/* Selector de variantes */}
      {component.variants.length > 1 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Variantes
          </label>
          <div className="flex gap-2 flex-wrap">
            {component.variants.map((variant, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedVariant(variant)}
                className={`
                  px-4 py-2 rounded-lg border-2 transition-all text-sm font-medium capitalize
                  ${
                    selectedVariant.name === variant.name
                      ? "border-blue-500 bg-blue-50 text-blue-700"
                      : "border-gray-200 hover:border-gray-300 text-gray-700"
                  }
                `}
              >
                {variant.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Live Preview */}
      {showLivePreview && (
        <IframePreview
          code={component.code}
          variant={selectedVariant}
          previewProps={component.preview_props}
        />
      )}

      {/* Editor de código */}
      {showCode && (
        <div className="border border-gray-200 rounded-lg overflow-hidden">
          <div className="bg-gray-800 px-4 py-2 flex items-center justify-between">
            <span className="text-sm text-gray-300 font-mono">
              {component.name}.tsx
            </span>
            <span className="text-xs text-gray-400">
              {component.code.split("\n").length} líneas
            </span>
          </div>
          <Editor
            height="400px"
            language="typescript"
            value={component.code}
            theme="vs-dark"
            options={{
              readOnly: true,
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: "on",
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>
      )}

      {/* Modal de edición */}
      <EditModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onEdit={handleEdit}
        componentName={component.name}
      />
    </div>
  );
}
