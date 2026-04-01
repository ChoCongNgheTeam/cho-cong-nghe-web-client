export interface AttributeOption {
  id: string;
  code: string;
  name: string;
}

export interface CategoryWithAttributes {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  isActive: boolean;
  attributes: AttributeOption[];
}

export interface AttributeSimple {
  id: string;
  code: string;
  name: string;
}
