'use client'
import React, { useState } from 'react';
import { Button } from '@nextui-org/button';
import { showErrorToast, showSuccessToast, showLoadingToast, handleAsyncWithErrorHandling } from '@/utils/errorHandler';

const ErrorTestComponent: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  const testNetworkError = () => {
    const networkError = new Error('Network Error');
    (networkError as Error & { code?: string }).code = 'NETWORK_ERROR';
    showErrorToast(networkError, 'Test Network');
  };

  const testSiigoAuthError = () => {
    const authError = new Error('Authentication failed');
    (authError as Error & { response?: { status: number; data: { message: string } } }).response = { status: 401, data: { message: 'Invalid credentials' } };
    showErrorToast(authError, 'Test Auth');
  };

  const testValidationError = () => {
    const validationError = new Error('VALIDATION_ERROR: Missing required fields');
    showErrorToast(validationError, 'Test Validation');
  };

  const testSuccessToast = () => {
    showSuccessToast('Test operation completed successfully!');
  };

  const testLoadingToast = () => {
    showLoadingToast('Testing loading state...');
    setTimeout(() => {
      showSuccessToast('Loading completed!');
    }, 2000);
  };

  const testAsyncErrorHandling = async () => {
    await handleAsyncWithErrorHandling(
      async () => {
        // Simular operación que falla
        await new Promise(resolve => setTimeout(resolve, 1000));
        throw new Error('Simulated async operation failure');
      },
      'Test Async Operation'
    );
  };

  const testComponentError = () => {
    // Esto debería ser capturado por ErrorBoundary
    throw new Error('Component error for ErrorBoundary test');
  };

  if (!isVisible) {
    return (
      <Button 
        size="sm" 
        color="warning" 
        variant="ghost"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        🧪 Test Errors
      </Button>
    );
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white shadow-lg rounded-lg p-4 border max-w-xs">
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-sm font-semibold">Error Testing</h3>
        <Button 
          size="sm" 
          isIconOnly
          variant="light"
          onClick={() => setIsVisible(false)}
        >
          ✕
        </Button>
      </div>
      
      <div className="space-y-2">
        <Button 
          size="sm" 
          color="danger" 
          variant="flat"
          onClick={testNetworkError}
          className="w-full text-xs"
        >
          Network Error
        </Button>
        
        <Button 
          size="sm" 
          color="danger" 
          variant="flat"
          onClick={testSiigoAuthError}
          className="w-full text-xs"
        >
          Auth Error
        </Button>
        
        <Button 
          size="sm" 
          color="warning" 
          variant="flat"
          onClick={testValidationError}
          className="w-full text-xs"
        >
          Validation Error
        </Button>
        
        <Button 
          size="sm" 
          color="success" 
          variant="flat"
          onClick={testSuccessToast}
          className="w-full text-xs"
        >
          Success Toast
        </Button>
        
        <Button 
          size="sm" 
          color="primary" 
          variant="flat"
          onClick={testLoadingToast}
          className="w-full text-xs"
        >
          Loading Toast
        </Button>
        
        <Button 
          size="sm" 
          color="secondary" 
          variant="flat"
          onClick={testAsyncErrorHandling}
          className="w-full text-xs"
        >
          Async Error
        </Button>
        
        <Button 
          size="sm" 
          color="danger" 
          variant="solid"
          onClick={testComponentError}
          className="w-full text-xs"
        >
          Component Error
        </Button>
      </div>
      
      <p className="text-xs text-gray-500 mt-2">
        Only visible in development
      </p>
    </div>
  );
};

export default ErrorTestComponent;
