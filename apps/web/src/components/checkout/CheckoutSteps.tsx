'use client';

import React from 'react';
import { CheckIcon } from '@heroicons/react/24/solid';

export interface CheckoutStep {
  id: string;
  name: string;
  description: string;
  status: 'current' | 'complete' | 'upcoming';
}

interface CheckoutStepsProps {
  steps: CheckoutStep[];
  currentStep: string;
  onStepClick?: (stepId: string) => void;
  className?: string;
}

export const CheckoutSteps: React.FC<CheckoutStepsProps> = ({
  steps,
  currentStep,
  onStepClick,
  className = '',
}) => {
  const currentStepIndex = steps.findIndex(step => step.id === currentStep);

  return (
    <div className={`bg-white border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <nav aria-label="Progress">
          {/* Mobile Progress Bar */}
          <div className="sm:hidden">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Step {currentStepIndex + 1} of {steps.length}
              </span>
              <span className="text-sm text-gray-500">
                {steps[currentStepIndex]?.name}
              </span>
            </div>
            <div className="mt-4">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((currentStepIndex + 1) / steps.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Desktop Steps */}
          <ol className="hidden sm:flex items-center justify-center space-x-8">
            {steps.map((step, stepIndex) => {
              const isComplete = stepIndex < currentStepIndex;
              const isCurrent = step.id === currentStep;
              const isClickable = onStepClick && (isComplete || stepIndex <= currentStepIndex + 1);

              return (
                <li key={step.id} className="flex items-center">
                  <div
                    className={`flex flex-col items-center ${
                      isClickable ? 'cursor-pointer' : ''
                    }`}
                    onClick={isClickable ? () => onStepClick(step.id) : undefined}
                  >
                    {/* Step Circle */}
                    <div
                      className={`relative flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200 ${
                        isComplete
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : isCurrent
                          ? 'border-blue-600 text-blue-600 bg-white'
                          : 'border-gray-300 text-gray-500 bg-white'
                      } ${
                        isClickable && !isCurrent
                          ? 'hover:border-blue-500 hover:text-blue-500'
                          : ''
                      }`}
                    >
                      {isComplete ? (
                        <CheckIcon className="w-5 h-5" />
                      ) : (
                        <span className="text-sm font-medium">{stepIndex + 1}</span>
                      )}

                      {/* Current Step Pulse */}
                      {isCurrent && (
                        <div className="absolute inset-0 rounded-full border-2 border-blue-600 animate-ping opacity-30" />
                      )}
                    </div>

                    {/* Step Content */}
                    <div className="mt-3 text-center">
                      <p
                        className={`text-sm font-medium transition-colors ${
                          isComplete || isCurrent
                            ? 'text-gray-900'
                            : 'text-gray-500'
                        } ${
                          isClickable && !isCurrent ? 'hover:text-blue-600' : ''
                        }`}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1 max-w-24 leading-tight">
                        {step.description}
                      </p>
                    </div>
                  </div>

                  {/* Connector Line */}
                  {stepIndex < steps.length - 1 && (
                    <div className="ml-8 mr-8">
                      <div
                        className={`h-0.5 w-16 transition-colors duration-300 ${
                          stepIndex < currentStepIndex
                            ? 'bg-blue-600'
                            : 'bg-gray-300'
                        }`}
                      />
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>
    </div>
  );
};

export default CheckoutSteps;