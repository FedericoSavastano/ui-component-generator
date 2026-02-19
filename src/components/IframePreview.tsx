"use client";

import { useMemo, useState, useEffect } from "react";
import { ComponentVariant } from "@/types";
import { Loader2 } from "lucide-react";

interface IframePreviewProps {
  code: string;
  variant: ComponentVariant;
  previewProps: Record<string, any>;
}

export default function IframePreview({
  code,
  variant,
  previewProps,
}: IframePreviewProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Generar el HTML del iframe
  const iframeContent = useMemo(() => {
    const processedCode = prepareCodeForIframe(code, {
      ...previewProps,
      ...variant.props,
    });
    return generateIframeHTML(processedCode);
  }, [code, variant, previewProps]);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    // Escuchar mensajes del iframe
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === "preview-loaded") {
        setIsLoading(false);
      } else if (event.data.type === "preview-error") {
        setError(event.data.error);
        setIsLoading(false);
      }
    };

    window.addEventListener("message", handleMessage);

    // Timeout de seguridad
    const timeout = setTimeout(() => {
      setIsLoading(false);
    }, 3000);

    return () => {
      window.removeEventListener("message", handleMessage);
      clearTimeout(timeout);
    };
  }, [iframeContent]);

  return (
    <div className="relative bg-white border-2 border-gray-200 rounded-lg overflow-hidden">
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-10">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Cargando preview...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-4 left-4 right-4 bg-red-50 border border-red-200 rounded p-3 z-10">
          <p className="text-red-600 text-sm font-mono">{error}</p>
        </div>
      )}

      <iframe
        title="Component Preview"
        sandbox="allow-scripts"
        srcDoc={iframeContent}
        className="w-full h-[400px] border-0"
      />
    </div>
  );
}

function generateIframeHTML(processedCode: string): string {
  return `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
  <script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
  <script src="https://unpkg.com/@babel/standalone/babel.min.js"></script>
  
  <style>
    body {
      margin: 0;
      padding: 2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      min-height: 100vh;
      font-family: system-ui, -apple-system, sans-serif;
      background: transparent;
    }
  </style>
</head>
<body>
  <div id="root"></div>
  
  <script type="text/babel">
    const { useState, useEffect, useCallback, useMemo } = React;
    
    // Código del componente
    ${processedCode}
    
    // Renderizar
    try {
      const root = ReactDOM.createRoot(document.getElementById('root'));
      root.render(<App />);
      window.parent.postMessage({ type: 'preview-loaded' }, '*');
    } catch (error) {
      window.parent.postMessage({ 
        type: 'preview-error', 
        error: error.message || String(error)
      }, '*');
    }
  </script>
  
  <script>
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      window.parent.postMessage({ 
        type: 'preview-error', 
        error: String(msg)
      }, '*');
      return false;
    };
  </script>
</body>
</html>
  `.trim();
}

/**
 * Prepara el código para el iframe
 */
function prepareCodeForIframe(
  code: string,
  props: Record<string, any>,
): string {
  let processedCode = code;

  // Remover imports
  processedCode = processedCode.replace(
    /import\s+.*?from\s+['"].*?['"];?\n?/g,
    "",
  );

  // Remover export default
  processedCode = processedCode.replace(/export\s+default\s+/g, "");

  // Remover interfaces
  processedCode = processedCode.replace(/interface\s+\w+\s*{[^}]*}/gs, "");

  // Remover type annotations de parámetros
  processedCode = processedCode.replace(
    /\(\s*{\s*([^}]+)\}\s*:\s*\w+\s*\)/g,
    "({ $1 })",
  );

  // Extraer nombre del componente
  const componentNameMatch = processedCode.match(/function\s+(\w+)/);
  const componentName = componentNameMatch
    ? componentNameMatch[1]
    : "Component";

  // Crear componente wrapper
  const propsString = JSON.stringify(props, null, 2);

  processedCode = `
${processedCode}

function App() {
  const props = ${propsString};
  return <${componentName} {...props} />;
}
  `.trim();

  return processedCode;
}
