export type Role = "admin" | "employee";
export type TransactionType = "income" | "expense";
export type MembershipStatus = "active" | "expired" | "cancelled";
export type MembershipPlan = "monthly" | "quarterly" | "annual";

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          role: Role;
          barbershop_id: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["profiles"]["Row"], "created_at">;
        Update: Partial<Database["public"]["Tables"]["profiles"]["Insert"]>;
      };
      clients: {
        Row: {
          id: string;
          barbershop_id: string;
          full_name: string;
          phone: string | null;
          age: number | null;
          birthday: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["clients"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      products: {
        Row: {
          id: string;
          barbershop_id: string;
          name: string;
          category: string | null;
          purchase_price: number;
          sale_price: number;
          stock: number;
          min_stock: number;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["products"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["products"]["Insert"]>;
      };
      transactions: {
        Row: {
          id: string;
          barbershop_id: string;
          type: TransactionType;
          amount: number;
          description: string;
          category: string | null;
          client_id: string | null;
          date: string;
          created_by: string;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["transactions"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["transactions"]["Insert"]>;
      };
      memberships: {
        Row: {
          id: string;
          barbershop_id: string;
          client_id: string;
          plan: MembershipPlan;
          price: number;
          start_date: string;
          end_date: string;
          status: MembershipStatus;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["memberships"]["Row"], "id" | "created_at">;
        Update: Partial<Database["public"]["Tables"]["memberships"]["Insert"]>;
      };
    };
  };
}

// Convenience types
export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Client = Database["public"]["Tables"]["clients"]["Row"];
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Membership = Database["public"]["Tables"]["memberships"]["Row"];
