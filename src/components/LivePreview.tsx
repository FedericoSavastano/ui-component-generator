"use client";

import {
  LiveProvider,
  LivePreview as ReactLivePreview,
  LiveError,
} from "react-live";
import { ComponentVariant } from "@/types";
import * as LucideIcons from "lucide-react";
import { useEffect } from "react";

interface LivePreviewProps {
  code: string;
  variant: ComponentVariant;
  previewProps: Record<string, any>;
}

export default function LivePreview({
  code,
  variant,
  previewProps,
}: LivePreviewProps) {
  const mergedProps = { ...previewProps, ...variant.props };
  const processedCode = prepareCodeForLive(code, mergedProps);

  console.log("=== CÓDIGO ORIGINAL ===");
  console.log(code);
  console.log("=== CÓDIGO PROCESADO ===");
  console.log(processedCode);
  console.log("=== PROPS ===");
  console.log(mergedProps);

  // Inyectar Tailwind CSS para el preview
  useEffect(() => {
    // Verificar si ya existe
    if (!document.getElementById("tailwind-cdn-preview")) {
      const script = document.createElement("script");
      script.id = "tailwind-cdn-preview";
      script.src = "https://cdn.tailwindcss.com";
      document.head.appendChild(script);
    }
  }, []);

  return (
    <div className="bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-lg p-12">
      <LiveProvider
        code={processedCode}
        scope={{
          ...LucideIcons,
        }}
        noInline={true}
      >
        <div className="flex items-center justify-center min-h-[200px]">
          {/* Wrapper con ID para que Tailwind CDN lo detecte */}
          <div id="preview-container" className="contents">
            <ReactLivePreview />
          </div>
        </div>

        <LiveError className="mt-4 p-4 bg-red-50 text-red-600 text-sm rounded border border-red-200 font-mono text-xs overflow-x-auto" />
      </LiveProvider>
    </div>
  );
}

function prepareCodeForLive(code: string, props: Record<string, any>): string {
  let processedCode = code;

  // 1. Remover imports
  processedCode = processedCode.replace(
    /import\s+.*?from\s+['"].*?['"];?\n?/g,
    "",
  );

  // 2. Remover export default
  processedCode = processedCode.replace(/export\s+default\s+/g, "");

  // 3. Remover interfaces TypeScript
  processedCode = processedCode.replace(/interface\s+\w+\s*{[^}]*}/gs, "");

  // 4. Remover type annotations de parámetros de función
  processedCode = processedCode.replace(
    /\(\s*{\s*([^}]+)\}\s*:\s*\w+\s*\)/g,
    "({ $1 })",
  );

  // 5. Remover default values con type annotations
  processedCode = processedCode.replace(
    /=\s*(['"][^'"]*['"])\s*:\s*\w+/g,
    "= $1",
  );

  // 6. Extraer el nombre del componente
  const componentNameMatch = processedCode.match(/function\s+(\w+)/);
  const componentName = componentNameMatch
    ? componentNameMatch[1]
    : "Component";

  // 7. Agregar render al final
  const propsString = JSON.stringify(props);
  processedCode =
    processedCode.trim() +
    `\n\nrender(<${componentName} {...${propsString}} />);`;

  return processedCode;
}
