'use client';

import { useRequireAuth } from '@/hooks/use-require-auth';
import { UserRole } from '@/graphql/generated';
import { useQuery, useMutation } from '@apollo/client';
import { gql } from '@apollo/client';
import { redirect } from 'next/navigation';
import { useState } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'react-hot-toast';
import {
  TruckIcon,
  PlusIcon,
  TrashIcon,
  XMarkIcon,
  InformationCircleIcon,
  MapPinIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

// GraphQL queries and mutations
const MY_DELIVERY_PROVIDERS_QUERY = gql`
  query MyDeliveryProviders {
    myDeliveryProviders {
      id
      name
      description
      logo
      isActive
      estimatedDays
      trackingUrl
      zones {
        id
        name
        countries
        states
        cities
        baseRate
        weightRate
        sizeRate
        freeShippingThreshold
      }
      settings {
        apiKey
        webhookUrl
        defaultPackaging
        insuranceOptions
        signatureRequired
        saturdayDelivery
      }
    }
  }
`;

const CREATE_DELIVERY_OPTION_MUTATION = gql`
  mutation CreateDeliveryOption($input: CreateDeliveryOptionInput!) {
    createDeliveryOption(input: $input) {
      id
      name
      description
      estimatedDays
    }
  }
`;

const UPDATE_DELIVERY_OPTION_MUTATION = gql`
  mutation UpdateDeliveryOption($id: ID!, $input: UpdateDeliveryOptionInput!) {
    updateDeliveryOption(id: $id, input: $input) {
      id
      name
      description
      estimatedDays
    }
  }
`;

const DELETE_DELIVERY_OPTION_MUTATION = gql`
  mutation DeleteDeliveryOption($id: ID!) {
    deleteDeliveryOption(id: $id)
  }
`;

// Validation schemas
const zoneSchema = z.object({
  name: z.string().min(1, 'Zone name is required'),
  countries: z.array(z.string()).min(1, 'At least one country is required'),
  states: z.array(z.string()).optional(),
  cities: z.array(z.string()).optional(),
  baseRate: z.number().min(0, 'Base rate must be 0 or greater'),
  weightRate: z.number().min(0, 'Weight rate must be 0 or greater'),
  sizeRate: z.number().min(0, 'Size rate must be 0 or greater'),
  freeShippingThreshold: z.number().min(0, 'Free shipping threshold must be 0 or greater').optional()
});

const deliveryProviderSchema = z.object({
  name: z.string().min(1, 'Provider name is required'),
  description: z.string().min(1, 'Description is required'),
  logo: z.string().url().optional(),
  estimatedDays: z.string().min(1, 'Estimated delivery time is required'),
  trackingUrl: z.string().url().optional(),
  isActive: z.boolean().default(true),
  zones: z.array(zoneSchema).min(1, 'At least one delivery zone is required'),
  settings: z.object({
    apiKey: z.string().optional(),
    webhookUrl: z.string().url().optional(),
    defaultPackaging: z.string().optional(),
    insuranceOptions: z.boolean().default(false),
    signatureRequired: z.boolean().default(false),
    saturdayDelivery: z.boolean().default(false)
  }).optional()
});

type DeliveryProviderFormData = z.infer<typeof deliveryProviderSchema>;

export default function DeliveryManagementPage() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [activeTab, setActiveTab] = useState('providers');

  const { data, loading, error, refetch } = useQuery(MY_DELIVERY_PROVIDERS_QUERY, {
    skip: !isAuthenticated || user?.userType !== UserRole.Seller,
    errorPolicy: 'all'
  });

  const [createDeliveryOption] = useMutation(CREATE_DELIVERY_OPTION_MUTATION, {
    onCompleted: () => {
      toast.success('Delivery option created successfully');
      refetch();
      setIsCreating(false);
    },
    onError: (error) => {
      toast.error(`Failed to create delivery option: ${error.message}`);
    }
  });

  const [updateDeliveryOption] = useMutation(UPDATE_DELIVERY_OPTION_MUTATION, {
    onCompleted: () => {
      toast.success('Delivery option updated successfully');
      refetch();
      setSelectedProvider(null);
    },
    onError: (error) => {
      toast.error(`Failed to update delivery option: ${error.message}`);
    }
  });

  const [deleteDeliveryOption] = useMutation(DELETE_DELIVERY_OPTION_MUTATION, {
    onCompleted: () => {
      toast.success('Delivery option deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(`Failed to delete delivery option: ${error.message}`);
    }
  });

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<DeliveryProviderFormData>({
    resolver: zodResolver(deliveryProviderSchema),
    defaultValues: {
      isActive: true,
      zones: [
        {
          name: 'Local',
          countries: ['United States'],
          states: [],
          cities: [],
          baseRate: 5.99,
          weightRate: 0.5,
          sizeRate: 0.25,
          freeShippingThreshold: 50
        }
      ],
      settings: {
        insuranceOptions: false,
        signatureRequired: false,
        saturdayDelivery: false
      }
    }
  });

  const { fields: zoneFields, append: appendZone, remove: removeZone } = useFieldArray({
    control,
    name: 'zones'
  });

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Auth check
  if (!isAuthenticated || !user) {
    return null;
  }

  // Role check
  if (user.userType !== UserRole.Seller) {
    redirect('/dashboard');
  }

  const deliveryProviders = data?.myDeliveryProviders || [];

  const handleDeleteProvider = async (providerId: string) => {
    if (window.confirm('Are you sure you want to delete this delivery option? This action cannot be undone.')) {
      await deleteDeliveryOption({ variables: { id: providerId } });
    }
  };

  const onSubmit = async (formData: DeliveryProviderFormData) => {
    try {
      const input = {
        ...formData,
        settings: formData.settings || undefined
      };

      if (selectedProvider) {
        await updateDeliveryOption({
          variables: {
            id: selectedProvider,
            input
          }
        });
      } else {
        await createDeliveryOption({
          variables: { input }
        });
      }
    } catch (error) {
      // Error handled in mutation callbacks
    }
  };

  const addZone = () => {
    appendZone({
      name: '',
      countries: ['United States'],
      states: [],
      cities: [],
      baseRate: 0,
      weightRate: 0,
      sizeRate: 0,
      freeShippingThreshold: 0
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Delivery Management
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  Configure your shipping options and delivery zones
                </p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setIsCreating(true);
                    setSelectedProvider(null);
                    reset();
                  }}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                >
                  <PlusIcon className="h-4 w-4 mr-2" />
                  Add Delivery Option
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {[
              { id: 'providers', name: 'Delivery Providers', icon: TruckIcon },
              { id: 'zones', name: 'Delivery Zones', icon: MapPinIcon },
              { id: 'settings', name: 'Settings', icon: ClockIcon }
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon
                    className={`mr-2 h-5 w-5 ${
                      activeTab === tab.id ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                    }`}
                  />
                  {tab.name}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'providers' && (
          <div className="space-y-6">
            {/* Delivery Providers List */}
            {!isCreating && !selectedProvider && (
              <div className="bg-white shadow rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">
                    Your Delivery Providers
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Manage your shipping options and delivery providers
                  </p>
                </div>
                <div className="divide-y divide-gray-200">
                  {deliveryProviders.length === 0 ? (
                    <div className="px-6 py-12 text-center">
                      <TruckIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <h3 className="mt-2 text-sm font-medium text-gray-900">No delivery providers</h3>
                      <p className="mt-1 text-sm text-gray-500">
                        Get started by adding your first delivery option.
                      </p>
                    </div>
                  ) : (
                    deliveryProviders.map((provider: any) => (
                      <div key={provider.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            {provider.logo ? (
                              <img
                                src={provider.logo}
                                alt={provider.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                            ) : (
                              <div className="h-12 w-12 rounded-lg bg-gray-200 flex items-center justify-center">
                                <TruckIcon className="h-6 w-6 text-gray-400" />
                              </div>
                            )}
                            <div className="ml-4">
                              <div className="flex items-center">
                                <h4 className="text-lg font-medium text-gray-900">
                                  {provider.name}
                                </h4>
                                <span className={`ml-3 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                  provider.isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-gray-100 text-gray-800'
                                }`}>
                                  {provider.isActive ? 'Active' : 'Inactive'}
                                </span>
                              </div>
                              <p className="text-sm text-gray-500 mt-1">
                                {provider.description}
                              </p>
                              <div className="flex items-center mt-2 text-xs text-gray-500">
                                <ClockIcon className="h-4 w-4 mr-1" />
                                {provider.estimatedDays}
                                <span className="mx-2">•</span>
                                <MapPinIcon className="h-4 w-4 mr-1" />
                                {provider.zones?.length || 0} delivery zone{provider.zones?.length !== 1 ? 's' : ''}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-3">
                            <button
                              onClick={() => {
                                setSelectedProvider(provider.id);
                                setIsCreating(false);
                                // Load provider data into form
                                reset({
                                  name: provider.name,
                                  description: provider.description,
                                  logo: provider.logo || '',
                                  estimatedDays: provider.estimatedDays,
                                  trackingUrl: provider.trackingUrl || '',
                                  isActive: provider.isActive,
                                  zones: provider.zones || [],
                                  settings: provider.settings || {}
                                });
                              }}
                              className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleDeleteProvider(provider.id)}
                              className="text-red-600 hover:text-red-900 text-sm font-medium"
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}

            {/* Create/Edit Form */}
            {(isCreating || selectedProvider) && (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">
                      {selectedProvider ? 'Edit Delivery Provider' : 'Add New Delivery Provider'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => {
                        setIsCreating(false);
                        setSelectedProvider(null);
                        reset();
                      }}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <XMarkIcon className="h-6 w-6" />
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Basic Information */}
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Provider Name *
                        </label>
                        <input
                          {...register('name')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., Standard Shipping, Express Delivery"
                        />
                        {errors.name && (
                          <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Description *
                        </label>
                        <textarea
                          {...register('description')}
                          rows={3}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Describe this delivery option"
                        />
                        {errors.description && (
                          <p className="mt-1 text-xs text-red-600">{errors.description.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Logo URL
                        </label>
                        <input
                          {...register('logo')}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com/logo.png"
                        />
                        {errors.logo && (
                          <p className="mt-1 text-xs text-red-600">{errors.logo.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Estimated Delivery Time *
                        </label>
                        <input
                          {...register('estimatedDays')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="e.g., 3-5 business days, 1-2 weeks"
                        />
                        {errors.estimatedDays && (
                          <p className="mt-1 text-xs text-red-600">{errors.estimatedDays.message}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tracking URL Template
                        </label>
                        <input
                          {...register('trackingUrl')}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://tracking.example.com?tracking={tracking_number}"
                        />
                        {errors.trackingUrl && (
                          <p className="mt-1 text-xs text-red-600">{errors.trackingUrl.message}</p>
                        )}
                      </div>

                      <div className="flex items-center">
                        <input
                          {...register('isActive')}
                          type="checkbox"
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 text-sm text-gray-700">
                          Active (available for customers)
                        </label>
                      </div>
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-gray-900">Advanced Settings</h4>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          API Key
                        </label>
                        <input
                          {...register('settings.apiKey')}
                          type="password"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Provider API key"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Webhook URL
                        </label>
                        <input
                          {...register('settings.webhookUrl')}
                          type="url"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://your-app.com/webhooks/delivery"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Default Packaging
                        </label>
                        <select
                          {...register('settings.defaultPackaging')}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        >
                          <option value="">Select packaging</option>
                          <option value="envelope">Envelope</option>
                          <option value="small_box">Small Box</option>
                          <option value="medium_box">Medium Box</option>
                          <option value="large_box">Large Box</option>
                          <option value="custom">Custom</option>
                        </select>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            {...register('settings.insuranceOptions')}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Offer insurance options
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...register('settings.signatureRequired')}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Require signature on delivery
                          </label>
                        </div>

                        <div className="flex items-center">
                          <input
                            {...register('settings.saturdayDelivery')}
                            type="checkbox"
                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          />
                          <label className="ml-2 text-sm text-gray-700">
                            Saturday delivery available
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Delivery Zones */}
                <div className="bg-white shadow rounded-lg p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-lg font-medium text-gray-900">Delivery Zones</h4>
                    <button
                      type="button"
                      onClick={addZone}
                      className="inline-flex items-center px-3 py-1 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <PlusIcon className="h-4 w-4 mr-1" />
                      Add Zone
                    </button>
                  </div>

                  {zoneFields.length === 0 ? (
                    <div className="text-center py-6 text-gray-500">
                      <MapPinIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <p className="mt-2 text-sm">No delivery zones added yet</p>
                      <p className="text-xs mt-1">Add zones to define where you can deliver</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {zoneFields.map((field, index) => (
                        <div key={field.id} className="border border-gray-200 rounded-lg p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="text-sm font-medium text-gray-900">Zone {index + 1}</h5>
                            <button
                              type="button"
                              onClick={() => removeZone(index)}
                              className="text-red-600 hover:text-red-700"
                            >
                              <TrashIcon className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Zone Name *
                              </label>
                              <input
                                {...register(`zones.${index}.name`)}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="e.g., Local, Regional"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Base Rate ($) *
                              </label>
                              <input
                                {...register(`zones.${index}.baseRate`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Weight Rate ($/lb)
                              </label>
                              <input
                                {...register(`zones.${index}.weightRate`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Size Rate ($/cubic inch)
                              </label>
                              <input
                                {...register(`zones.${index}.sizeRate`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>

                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Free Shipping Threshold ($)
                              </label>
                              <input
                                {...register(`zones.${index}.freeShippingThreshold`, { valueAsNumber: true })}
                                type="number"
                                step="0.01"
                                min="0"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="0.00"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.zones && (
                    <p className="mt-2 text-xs text-red-600">{errors.zones.message}</p>
                  )}
                </div>

                {/* Form Actions */}
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreating(false);
                      setSelectedProvider(null);
                      reset();
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50"
                  >
                    {isSubmitting ? 'Saving...' : selectedProvider ? 'Update Provider' : 'Create Provider'}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Zone Summary</h3>
            <div className="space-y-4">
              {deliveryProviders.map((provider: any) => (
                <div key={provider.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{provider.name}</h4>
                  <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {provider.zones?.map((zone: any, index: number) => (
                      <div key={index} className="bg-gray-50 rounded p-3">
                        <h5 className="text-sm font-medium text-gray-900">{zone.name}</h5>
                        <div className="mt-1 text-xs text-gray-600">
                          <p>Base Rate: ${zone.baseRate}</p>
                          <p>Weight Rate: ${zone.weightRate}/lb</p>
                          {zone.freeShippingThreshold && (
                            <p>Free shipping over: ${zone.freeShippingThreshold}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="bg-white shadow rounded-lg p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delivery Settings</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <InformationCircleIcon className="flex-shrink-0 h-5 w-5 text-blue-400" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Delivery Configuration Tips
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Set competitive base rates to attract customers</li>
                      <li>Use weight-based pricing for accurate shipping costs</li>
                      <li>Offer free shipping thresholds to increase order values</li>
                      <li>Provide accurate delivery time estimates</li>
                      <li>Consider multiple delivery options for customer choice</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="fixed bottom-4 right-4 bg-red-50 border border-red-200 rounded-md p-4 max-w-md">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">
                <p>Failed to load delivery providers. Please refresh the page.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}