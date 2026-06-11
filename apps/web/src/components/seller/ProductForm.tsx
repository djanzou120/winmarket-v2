'use client';

import { useState, useRef, useCallback } from 'react';
import React from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import {
  PhotoIcon,
  XMarkIcon,
  PlusIcon,
  TrashIcon,
  InformationCircleIcon
} from '@heroicons/react/24/outline';
import { ProductCondition, ProductStatus } from '@/graphql/generated';

// GraphQL queries and mutations
const CATEGORIES_QUERY = gql`
  query Categories {
    categories {
      edges {
        node {
          id
          name
          description
          parentId
        }
      }
    }
  }
`;

const CREATE_PRODUCT_MUTATION = gql`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
      title
      slug
      status
    }
  }
`;

const UPDATE_PRODUCT_MUTATION = gql`
  mutation UpdateProduct($id: ID!, $input: UpdateProductInput!) {
    updateProduct(id: $id, input: $input) {
      id
      title
      slug
      status
    }
  }
`;

const GET_PRODUCT_QUERY = gql`
  query GetProduct($id: ID!) {
    product(id: $id) {
      id
      title
      description
      price
      stock
      status
      condition
      dimensions
      weight
      tags
      images
      allowReviews
      metaDescription
      categoryId
      category {
        id
        name
      }
      variants {
        id
        name
        price
        sku
        stock
        image
        isActive
      }
    }
  }
`;

// Validation schema
const variantSchema = z.object({
  name: z.string().min(1, 'Variant name is required'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  sku: z.string().optional(),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  image: z.string().url().optional().or(z.literal('')),
  isActive: z.boolean().default(true)
});

const productSchema = z.object({
  title: z.string().min(1, 'Product title is required').max(200, 'Title is too long'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000, 'Description is too long'),
  price: z.number().min(0.01, 'Price must be greater than 0'),
  stock: z.number().int().min(0, 'Stock must be 0 or greater'),
  categoryId: z.string().min(1, 'Category is required'),
  condition: z.nativeEnum(ProductCondition),
  status: z.nativeEnum(ProductStatus).default(ProductStatus.Draft),
  dimensions: z.string().optional(),
  weight: z.number().positive().optional(),
  tags: z.array(z.string()).max(10, 'Maximum 10 tags allowed'),
  images: z.array(z.string().url()).min(1, 'At least one image is required').max(10, 'Maximum 10 images allowed'),
  allowReviews: z.boolean().default(true),
  metaDescription: z.string().max(160, 'Meta description is too long').optional(),
  variants: z.array(variantSchema).optional()
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormProps {
  productId?: string;
  onSuccess?: () => void;
}

export function ProductForm({ productId, onSuccess }: ProductFormProps) {
  const router = useRouter();
  const isEditing = Boolean(productId);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [tagInput, setTagInput] = useState('');

  const { data: categoriesData } = useQuery(CATEGORIES_QUERY);
  const { data: productData, loading: productLoading } = useQuery(GET_PRODUCT_QUERY, {
    variables: { id: productId },
    skip: !productId
  });

  const [createProduct, { loading: creating }] = useMutation(CREATE_PRODUCT_MUTATION, {
    onCompleted: (data) => {
      toast.success('Product created successfully!');
      onSuccess?.();
      router.push(`/dashboard/seller/products/${data.createProduct.id}/edit`);
    },
    onError: (error) => {
      toast.error(`Failed to create product: ${error.message}`);
    }
  });

  const [updateProduct, { loading: updating }] = useMutation(UPDATE_PRODUCT_MUTATION, {
    onCompleted: () => {
      toast.success('Product updated successfully!');
      onSuccess?.();
    },
    onError: (error) => {
      toast.error(`Failed to update product: ${error.message}`);
    }
  });

  const {
    register,
    control,
    handleSubmit,
    watch,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      status: ProductStatus.Draft,
      condition: ProductCondition.New,
      allowReviews: true,
      tags: [],
      images: [],
      variants: []
    }
  });

  const { fields: variantFields, append: appendVariant, remove: removeVariant } = useFieldArray({
    control,
    name: 'variants'
  });

  // Load product data for editing
  React.useEffect(() => {
    if (isEditing && productData?.product) {
      const product = productData.product;
      setValue('title', product.title);
      setValue('description', product.description);
      setValue('price', product.price);
      setValue('stock', product.stock);
      setValue('categoryId', product.categoryId);
      setValue('condition', product.condition);
      setValue('status', product.status);
      setValue('dimensions', product.dimensions || '');
      setValue('weight', product.weight || undefined);
      setValue('tags', product.tags || []);
      setValue('images', product.images || []);
      setValue('allowReviews', product.allowReviews);
      setValue('metaDescription', product.metaDescription || '');
      setValue('variants', product.variants || []);
    }
  }, [isEditing, productData, setValue]);

  const categories = categoriesData?.categories?.edges?.map((edge: any) => edge.node) || [];
  const watchedImages = watch('images');
  const watchedTags = watch('tags');

  // Image upload simulation (replace with actual upload logic)
  const uploadImages = async (files: FileList) => {
    setUploadingImages(true);
    try {
      const uploadPromises = Array.from(files).map(async (file) => {
        // Simulate upload - replace with actual API call
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            // In a real app, upload to cloud storage and return the URL
            resolve(reader.result as string);
          };
          reader.readAsDataURL(file);
        });
      });

      const uploadedUrls = await Promise.all(uploadPromises);
      const currentImages = getValues('images') || [];
      setValue('images', [...currentImages, ...uploadedUrls]);
      toast.success(`${uploadedUrls.length} image(s) uploaded successfully`);
    } catch (error) {
      toast.error('Failed to upload images');
    } finally {
      setUploadingImages(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadImages(e.dataTransfer.files);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadImages(e.target.files);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = getValues('images') || [];
    setValue('images', currentImages.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (tagInput.trim() && !watchedTags.includes(tagInput.trim())) {
      setValue('tags', [...watchedTags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (index: number) => {
    setValue('tags', watchedTags.filter((_, i) => i !== index));
  };

  const addVariant = () => {
    appendVariant({
      name: '',
      price: 0,
      sku: '',
      stock: 0,
      image: '',
      isActive: true
    });
  };

  const onSubmit = async (data: ProductFormData) => {
    try {
      const input = {
        ...data,
        weight: data.weight || undefined,
        dimensions: data.dimensions || undefined,
        metaDescription: data.metaDescription || undefined
      };

      if (isEditing) {
        await updateProduct({
          variables: {
            id: productId,
            input
          }
        });
      } else {
        await createProduct({
          variables: { input }
        });
      }
    } catch (error) {
      // Error handled in mutation callbacks
    }
  };

  const isLoading = creating || updating || isSubmitting || uploadingImages;

  if (productLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Product Title *
                </label>
                <input
                  {...register('title')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter product title"
                />
                {errors.title && (
                  <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  {...register('description')}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Describe your product in detail"
                />
                {errors.description && (
                  <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category *
                  </label>
                  <select
                    {...register('categoryId')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Select a category</option>
                    {categories.map((category: any) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-600">{errors.categoryId.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Condition *
                  </label>
                  <select
                    {...register('condition')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value={ProductCondition.New}>New</option>
                    <option value={ProductCondition.LikeNew}>Like New</option>
                    <option value={ProductCondition.Good}>Good</option>
                    <option value={ProductCondition.Fair}>Fair</option>
                  </select>
                  {errors.condition && (
                    <p className="mt-1 text-xs text-red-600">{errors.condition.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Images */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Product Images</h3>

            {/* Image Upload Area */}
            <div
              className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
                dragActive
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
            >
              <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Drop images here or{' '}
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-blue-600 hover:text-blue-700 font-medium"
                  >
                    browse files
                  </button>
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  PNG, JPG, GIF up to 10MB each. Maximum 10 images.
                </p>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileSelect}
                className="hidden"
              />
              {uploadingImages && (
                <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              )}
            </div>

            {/* Image Preview */}
            {watchedImages.length > 0 && (
              <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                {watchedImages.map((image, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={image}
                      alt={`Product image ${index + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                    />
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <XMarkIcon className="h-3 w-3" />
                    </button>
                    {index === 0 && (
                      <span className="absolute bottom-1 left-1 text-xs bg-blue-500 text-white px-1 rounded">
                        Main
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
            {errors.images && (
              <p className="mt-1 text-xs text-red-600">{errors.images.message}</p>
            )}
          </div>

          {/* Pricing and Inventory */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Pricing & Inventory</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price * ($)
                </label>
                <input
                  {...register('price', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0.00"
                />
                {errors.price && (
                  <p className="mt-1 text-xs text-red-600">{errors.price.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stock Quantity *
                </label>
                <input
                  {...register('stock', { valueAsNumber: true })}
                  type="number"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="0"
                />
                {errors.stock && (
                  <p className="mt-1 text-xs text-red-600">{errors.stock.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Product Variants */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Product Variants</h3>
              <button
                type="button"
                onClick={addVariant}
                className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <PlusIcon className="h-4 w-4 mr-1" />
                Add Variant
              </button>
            </div>

            {variantFields.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <p className="text-sm">No variants added yet</p>
                <p className="text-xs mt-1">Add variants for different sizes, colors, or configurations</p>
              </div>
            ) : (
              <div className="space-y-4">
                {variantFields.map((field, index) => (
                  <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-900">Variant {index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeVariant(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Name *
                        </label>
                        <input
                          {...register(`variants.${index}.name`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Red, Large"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Price ($)
                        </label>
                        <input
                          {...register(`variants.${index}.price`, { valueAsNumber: true })}
                          type="number"
                          step="0.01"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          SKU
                        </label>
                        <input
                          {...register(`variants.${index}.sku`)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Optional"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Stock
                        </label>
                        <input
                          {...register(`variants.${index}.stock`, { valueAsNumber: true })}
                          type="number"
                          min="0"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                          placeholder="0"
                        />
                      </div>
                    </div>
                    <div className="mt-3 flex items-center">
                      <Controller
                        name={`variants.${index}.isActive`}
                        control={control}
                        render={({ field }) => (
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={field.value}
                              onChange={field.onChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Active</span>
                          </label>
                        )}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Information */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Information</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dimensions (L × W × H)
                  </label>
                  <input
                    {...register('dimensions')}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., 10 × 5 × 3 inches"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (lbs)
                  </label>
                  <input
                    {...register('weight', { valueAsNumber: true })}
                    type="number"
                    step="0.1"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="0.0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta Description (SEO)
                </label>
                <textarea
                  {...register('metaDescription')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Brief description for search engines (max 160 characters)"
                />
                {errors.metaDescription && (
                  <p className="mt-1 text-xs text-red-600">{errors.metaDescription.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex space-x-2">
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Add tags (press Enter)"
                  />
                  <button
                    type="button"
                    onClick={addTag}
                    className="px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Add
                  </button>
                </div>
                {watchedTags.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {watchedTags.map((tag, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(index)}
                          className="ml-1 inline-flex items-center p-0.5 rounded-full text-blue-400 hover:text-blue-600"
                        >
                          <XMarkIcon className="h-3 w-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
                {errors.tags && (
                  <p className="mt-1 text-xs text-red-600">{errors.tags.message}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Publish */}
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Publish</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register('status')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value={ProductStatus.Draft}>Draft</option>
                  <option value={ProductStatus.Active}>Active</option>
                  <option value={ProductStatus.Archived}>Archived</option>
                </select>
              </div>

              <div className="flex items-center">
                <Controller
                  name="allowReviews"
                  control={control}
                  render={({ field }) => (
                    <label className="flex items-center">
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-700">Allow customer reviews</span>
                    </label>
                  )}
                />
              </div>

              <div className="flex space-x-3">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
                </button>
              </div>

              {!isEditing && (
                <button
                  type="button"
                  onClick={() => router.push('/dashboard/seller/products')}
                  className="w-full text-gray-600 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
              )}
            </div>
          </div>

          {/* Help */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex">
              <InformationCircleIcon className="flex-shrink-0 h-5 w-5 text-blue-400" />
              <div className="ml-3">
                <h3 className="text-sm font-medium text-blue-800">
                  Product Creation Tips
                </h3>
                <div className="mt-2 text-sm text-blue-700">
                  <ul className="list-disc list-inside space-y-1">
                    <li>Use high-quality images for better conversion</li>
                    <li>Write detailed descriptions to reduce returns</li>
                    <li>Set competitive pricing based on market research</li>
                    <li>Use relevant tags to improve discoverability</li>
                    <li>Enable reviews to build customer trust</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}