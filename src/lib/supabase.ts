import { createClient } from "@supabase/supabase-js";
import { GeneratedComponent } from "@/types";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper types para Supabase
export type Database = {
  public: {
    Tables: {
      components: {
        Row: GeneratedComponent;
        Insert: Omit<GeneratedComponent, "id" | "created_at" | "likes">;
        Update: Partial<Omit<GeneratedComponent, "id" | "created_at">>;
      };
    };
  };
};
