'use client';

import { useState } from 'react';
import { useQuery } from '@apollo/client';
import { gql } from '@apollo/client';
import Link from 'next/link';
import {
  CheckCircleIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChevronRightIcon,
  PlayIcon,
  BookOpenIcon,
  CameraIcon,
  TruckIcon,
  ChartBarIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

// GraphQL query to check seller setup progress
const SELLER_SETUP_PROGRESS_QUERY = gql`
  query SellerSetupProgress {
    me {
      id
      profile {
        bio
        address
        city
        country
      }
    }
    myProducts(pagination: { limit: 1, offset: 0 }) {
      totalCount
    }
    myDeliveryProviders {
      id
    }
  }
`;

interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  href: string;
  icon: React.ComponentType<any>;
  completed: boolean;
  priority: 'high' | 'medium' | 'low';
  estimatedTime: string;
}

export function SellerOnboarding() {
  const [activeStep, setActiveStep] = useState<string | null>(null);

  const { data, loading } = useQuery(SELLER_SETUP_PROGRESS_QUERY, {
    errorPolicy: 'all'
  });

  if (loading) {
    return (
      <div className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate completion status based on data
  const hasProfile = Boolean(data?.me?.profile?.bio && data?.me?.profile?.address);
  const hasProducts = (data?.myProducts?.totalCount || 0) > 0;
  const hasDelivery = (data?.myDeliveryProviders?.length || 0) > 0;

  const steps: OnboardingStep[] = [
    {
      id: 'profile',
      title: 'Complete Your Profile',
      description: 'Add your business information, bio, and contact details',
      href: '/settings/profile',
      icon: UserGroupIcon,
      completed: hasProfile,
      priority: 'high',
      estimatedTime: '5 min'
    },
    {
      id: 'products',
      title: 'Add Your First Product',
      description: 'List your first product with photos and detailed descriptions',
      href: '/dashboard/seller/products/new',
      icon: CameraIcon,
      completed: hasProducts,
      priority: 'high',
      estimatedTime: '15 min'
    },
    {
      id: 'delivery',
      title: 'Set Up Delivery Options',
      description: 'Configure shipping rates and delivery zones for your products',
      href: '/dashboard/seller/delivery',
      icon: TruckIcon,
      completed: hasDelivery,
      priority: 'high',
      estimatedTime: '10 min'
    },
    {
      id: 'verification',
      title: 'Verify Your Account',
      description: 'Complete identity verification to start selling',
      href: '/dashboard/verification',
      icon: CheckCircleIcon,
      completed: false, // This would come from API
      priority: 'medium',
      estimatedTime: '24 hours'
    },
    {
      id: 'analytics',
      title: 'Explore Analytics Dashboard',
      description: 'Learn how to track your sales and performance',
      href: '/dashboard/seller/analytics',
      icon: ChartBarIcon,
      completed: false,
      priority: 'low',
      estimatedTime: '5 min'
    }
  ];

  const completedSteps = steps.filter(step => step.completed).length;
  const progressPercentage = (completedSteps / steps.length) * 100;

  const highPrioritySteps = steps.filter(step => !step.completed && step.priority === 'high');
  const isStoreReady = completedSteps >= 3; // Profile, products, and delivery

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold">Welcome to WinMarket!</h2>
            <p className="mt-1 text-blue-100">
              Let's set up your seller account to start earning
            </p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{Math.round(progressPercentage)}%</div>
            <div className="text-sm text-blue-100">Complete</div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Store Readiness Alert */}
      {isStoreReady ? (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex">
            <CheckCircleIcon className="flex-shrink-0 h-5 w-5 text-green-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-green-800">
                Your store is ready to go live! 🎉
              </h3>
              <div className="mt-2 text-sm text-green-700">
                <p>
                  You've completed the essential setup steps. Your products are now visible to customers.
                  Continue improving your store by completing the remaining steps.
                </p>
              </div>
            </div>
          </div>
        </div>
      ) : highPrioritySteps.length > 0 && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex">
            <ExclamationTriangleIcon className="flex-shrink-0 h-5 w-5 text-yellow-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                Complete setup to start selling
              </h3>
              <div className="mt-2 text-sm text-yellow-700">
                <p>
                  You have {highPrioritySteps.length} essential step{highPrioritySteps.length !== 1 ? 's' : ''} remaining.
                  Complete these to make your products visible to customers.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Steps */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Setup Checklist</h3>
          <p className="mt-1 text-sm text-gray-500">
            Complete these steps to optimize your seller experience
          </p>
        </div>

        <div className="divide-y divide-gray-200">
          {steps.map((step) => {
            const Icon = step.icon;
            const isActive = activeStep === step.id;

            return (
              <div
                key={step.id}
                className={`p-6 hover:bg-gray-50 transition-colors ${
                  isActive ? 'bg-blue-50' : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      step.completed
                        ? 'bg-green-100 text-green-600'
                        : step.priority === 'high'
                        ? 'bg-red-100 text-red-600'
                        : step.priority === 'medium'
                        ? 'bg-yellow-100 text-yellow-600'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {step.completed ? (
                        <CheckCircleIcon className="w-6 h-6" />
                      ) : (
                        <Icon className="w-6 h-6" />
                      )}
                    </div>

                    <div className="ml-4">
                      <div className="flex items-center">
                        <h4 className={`text-sm font-medium ${
                          step.completed ? 'text-green-900' : 'text-gray-900'
                        }`}>
                          {step.title}
                        </h4>
                        {step.priority === 'high' && !step.completed && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                            Required
                          </span>
                        )}
                        {step.completed && (
                          <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            Complete
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-gray-500">{step.description}</p>
                      <div className="mt-1 flex items-center text-xs text-gray-400">
                        <span>Estimated time: {step.estimatedTime}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {step.completed ? (
                      <Link
                        href={step.href}
                        className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                      >
                        Review
                      </Link>
                    ) : (
                      <Link
                        href={step.href}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                      >
                        {step.priority === 'high' ? 'Start Now' : 'Complete'}
                        <ChevronRightIcon className="ml-1 h-4 w-4" />
                      </Link>
                    )}
                  </div>
                </div>

                {/* Expanded Content */}
                {isActive && (
                  <div className="mt-4 pl-14">
                    <div className="bg-white border border-gray-200 rounded-lg p-4">
                      <h5 className="font-medium text-gray-900">Getting Started</h5>
                      <p className="mt-1 text-sm text-gray-600">
                        This step is {step.priority} priority and will take approximately {step.estimatedTime} to complete.
                      </p>
                      <div className="mt-3 flex space-x-3">
                        <Link
                          href={step.href}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <PlayIcon className="mr-1 h-3 w-3" />
                          Get Started
                        </Link>
                        <button
                          onClick={() => setActiveStep(null)}
                          className="text-xs text-gray-500 hover:text-gray-700"
                        >
                          Collapse
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Help Resources */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center">
          <BookOpenIcon className="h-6 w-6 text-blue-500" />
          <h3 className="ml-3 text-lg font-medium text-gray-900">
            Need Help Getting Started?
          </h3>
        </div>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <a
            href="/help/seller-guide"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <BookOpenIcon className="h-5 w-5 text-blue-500" />
              <h4 className="ml-2 font-medium text-gray-900">Seller Guide</h4>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Complete guide to selling on WinMarket
            </p>
          </a>

          <a
            href="/help/video-tutorials"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <PlayIcon className="h-5 w-5 text-blue-500" />
              <h4 className="ml-2 font-medium text-gray-900">Video Tutorials</h4>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Step-by-step video guides
            </p>
          </a>

          <a
            href="/help/contact"
            className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
          >
            <div className="flex items-center">
              <UserGroupIcon className="h-5 w-5 text-blue-500" />
              <h4 className="ml-2 font-medium text-gray-900">Get Support</h4>
            </div>
            <p className="mt-2 text-sm text-gray-600">
              Chat with our seller success team
            </p>
          </a>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <div className="flex">
          <InformationCircleIcon className="flex-shrink-0 h-5 w-5 text-blue-400" />
          <div className="ml-3">
            <h3 className="text-sm font-medium text-blue-800">
              Pro Tips for Success
            </h3>
            <div className="mt-2 text-sm text-blue-700">
              <ul className="list-disc list-inside space-y-1">
                <li>Use high-quality photos to showcase your products</li>
                <li>Write detailed descriptions to build customer trust</li>
                <li>Respond to customer questions quickly</li>
                <li>Keep your inventory updated to avoid overselling</li>
                <li>Offer competitive shipping rates and fast delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}