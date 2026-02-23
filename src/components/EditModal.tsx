"use client";

import { useState } from "react";
import { X, Sparkles, Loader2 } from "lucide-react";

interface EditModalProps {
  isOpen: boolean;
  onClose: () => void;
  onEdit: (instructions: string) => Promise<void>;
  componentName: string;
}

export default function EditModal({
  isOpen,
  onClose,
  onEdit,
  componentName,
}: EditModalProps) {
  const [instructions, setInstructions] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!instructions.trim()) return;

    setIsEditing(true);
    try {
      await onEdit(instructions);
      setInstructions("");
      onClose();
    } catch (error) {
      console.error("Edit error:", error);
    } finally {
      setIsEditing(false);
    }
  };

  const quickEdits = [
    "Cambia el color a verde",
    "Hazlo más grande",
    "Agrega una sombra más pronunciada",
    "Cambia el estilo a minimalista",
    "Agrega animación al hover",
    "Hazlo más redondeado",
  ];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">
              Editar Componente
            </h2>
            <p className="text-sm text-gray-600 mt-1">{componentName}</p>
          </div>
          <button
            onClick={onClose}
            disabled={isEditing}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                ¿Qué quieres cambiar?
              </label>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                placeholder="Ej: Cambia el color del botón a verde, hazlo más grande, agrega una sombra..."
                rows={4}
                disabled={isEditing}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:bg-gray-50 disabled:text-gray-500"
              />
              <p className="mt-2 text-xs text-gray-500">
                💡 Tip: Sé específico sobre colores, tamaños, animaciones o
                cambios de estilo
              </p>
            </div>

            {/* Quick edits */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ediciones rápidas
              </label>
              <div className="grid grid-cols-2 gap-2">
                {quickEdits.map((edit, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setInstructions(edit)}
                    disabled={isEditing}
                    className="px-3 py-2 text-sm text-left bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {edit}
                  </button>
                ))}
              </div>
            </div>

            {/* Info */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                <strong>¿Cómo funciona?</strong> La IA analizará tu componente
                actual y aplicará los cambios que solicites, manteniendo el
                resto del diseño intacto.
              </p>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            type="button"
            onClick={onClose}
            disabled={isEditing}
            className="px-4 py-2 text-gray-700 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            disabled={isEditing || !instructions.trim()}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium flex items-center gap-2"
          >
            {isEditing ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Editando...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Aplicar Cambios
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
