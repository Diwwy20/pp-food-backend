export interface Category {
  id: number;
  nameTh: string;
  nameEn: string;
}

export interface CreateProductDTO {
  nameTh: string;
  nameEn?: string;
  descriptionTh?: string;
  descriptionEn?: string;
  price: string | number;
  categoryId: number | string;
  isRecommended?: string | boolean;
  isAvailable?: string | boolean;
  options?: string;
}

export interface UpdateProductDTO extends Partial<CreateProductDTO> {
  deleteImageIds?: string | number[];
}

export interface RegisterDTO {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  nickName?: string;
}

export interface UpdateProfileDTO {
  firstName?: string;
  lastName?: string;
  nickName?: string;
}

export interface ProductOptionValueDTO {
  nameTh: string;
  nameEn?: string;
  price: number;
}

export interface ProductOptionDTO {
  nameTh: string;
  nameEn?: string;
  isRequired: boolean;
  maxSelect: number;
  choices: ProductOptionValueDTO[];
}
