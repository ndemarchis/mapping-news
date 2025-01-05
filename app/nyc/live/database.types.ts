export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  graphql_public: {
    Tables: {
      [_ in never]: never;
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      graphql: {
        Args: {
          operationName?: string;
          query?: string;
          variables?: Json;
          extensions?: Json;
        };
        Returns: Json;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
  public: {
    Tables: {
      articles: {
        Row: {
          archived: boolean | null;
          author: string | null;
          created_at: string;
          feed_name: string | null;
          headline: string | null;
          link: string | null;
          pub_date: string | null;
          uuid3: string;
        };
        Insert: {
          archived?: boolean | null;
          author?: string | null;
          created_at?: string;
          feed_name?: string | null;
          headline?: string | null;
          link?: string | null;
          pub_date?: string | null;
          uuid3: string;
        };
        Update: {
          archived?: boolean | null;
          author?: string | null;
          created_at?: string;
          feed_name?: string | null;
          headline?: string | null;
          link?: string | null;
          pub_date?: string | null;
          uuid3?: string;
        };
        Relationships: [];
      };
      articles_and_data: {
        Row: {
          author: string | null;
          feed_name: string | null;
          id: string;
          link: string | null;
          locations: Json | null;
          pub_date: string | null;
          title: string | null;
        };
        Insert: {
          author?: string | null;
          feed_name?: string | null;
          id?: string;
          link?: string | null;
          locations?: Json | null;
          pub_date?: string | null;
          title?: string | null;
        };
        Update: {
          author?: string | null;
          feed_name?: string | null;
          id?: string;
          link?: string | null;
          locations?: Json | null;
          pub_date?: string | null;
          title?: string | null;
        };
        Relationships: [];
      };
      location_article_relations: {
        Row: {
          article_uuid: string | null;
          created_at: string;
          id: string;
          location_name: string | null;
          place_id: string | null;
        };
        Insert: {
          article_uuid?: string | null;
          created_at?: string;
          id: string;
          location_name?: string | null;
          place_id?: string | null;
        };
        Update: {
          article_uuid?: string | null;
          created_at?: string;
          id?: string;
          location_name?: string | null;
          place_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "location_article_relations_article_uuid_fkey";
            columns: ["article_uuid"];
            isOneToOne: false;
            referencedRelation: "articles";
            referencedColumns: ["uuid3"];
          },
          {
            foreignKeyName: "location_article_relations_place_id_fkey";
            columns: ["place_id"];
            isOneToOne: false;
            referencedRelation: "locations";
            referencedColumns: ["place_id"];
          },
        ];
      };
      locations: {
        Row: {
          formatted_address: string | null;
          lat: number | null;
          lon: number | null;
          place_id: string;
          types: string[] | null;
        };
        Insert: {
          formatted_address?: string | null;
          lat?: number | null;
          lon?: number | null;
          place_id: string;
          types?: string[] | null;
        };
        Update: {
          formatted_address?: string | null;
          lat?: number | null;
          lon?: number | null;
          place_id?: string;
          types?: string[] | null;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      get_sorted_location_article_relations: {
        Args: {
          p_place_id: string;
        };
        Returns: {
          article_uuid: string;
          location_name: string;
          articles: Json;
        }[];
      };
    };
    Enums: {
      "Article Status": "ARCHIVED" | "UNDEFINED";
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
      PublicSchema["Views"])
  ? (PublicSchema["Tables"] &
      PublicSchema["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
  ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
  ? PublicSchema["Enums"][PublicEnumNameOrOptions]
  : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database;
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
  ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never;
