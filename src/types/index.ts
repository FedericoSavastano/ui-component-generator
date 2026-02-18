export type ComponentCategory =
  | "button"
  | "card"
  | "input"
  | "navbar"
  | "modal"
  | "form"
  | "badge"
  | "alert"
  | "other";

export interface ComponentVariant {
  name: string;
  props: Record<string, any>;
}

export interface GeneratedComponent {
  id: string;
  created_at: string;
  name: string;
  description: string;
  category: ComponentCategory;
  code: string;
  variants: ComponentVariant[];
  preview_props: Record<string, any>;
  tags: string[];
  user_id?: string;
  is_public: boolean;
  likes: number;
}

export interface GenerateRequest {
  description: string;
  category?: ComponentCategory;
  includeVariants?: boolean;
}

export interface GenerateResponse {
  success: boolean;
  component?: {
    name: string;
    code: string;
    category: ComponentCategory;
    variants: ComponentVariant[];
    preview_props: Record<string, any>;
    tags: string[];
  };
  message?: string;
}

export const CATEGORIES: {
  value: ComponentCategory;
  label: string;
  icon: string;
}[] = [
  { value: "button", label: "Button", icon: "🔘" },
  { value: "card", label: "Card", icon: "🗃️" },
  { value: "input", label: "Input", icon: "✏️" },
  { value: "navbar", label: "Navbar", icon: "📱" },
  { value: "modal", label: "Modal", icon: "🪟" },
  { value: "form", label: "Form", icon: "📝" },
  { value: "badge", label: "Badge", icon: "🏷️" },
  { value: "alert", label: "Alert", icon: "⚠️" },
  { value: "other", label: "Other", icon: "✨" },
];
