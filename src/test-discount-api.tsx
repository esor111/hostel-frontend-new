import React from 'react';
import { useDiscounts } from './hooks/useDiscounts';

export const TestDiscountAPI = () => {
  const { discounts, loading, error, stats } = useDiscounts();

  if (loading) return <div>Loading discounts...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h2>Discount API Test</h2>
      <div className="mb-4">
        <h3>Stats:</h3>
        <pre>{JSON.stringify(stats, null, 2)}</pre>
      </div>
      <div>
        <h3>Discounts ({discounts.length}):</h3>
        <pre>{JSON.stringify(discounts, null, 2)}</pre>
      </div>
    </div>
  );
};