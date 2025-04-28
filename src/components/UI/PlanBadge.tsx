import React from 'react';
import { PlanType } from '../../types';

interface PlanBadgeProps {
  plan: PlanType;
}

const PlanBadge: React.FC<PlanBadgeProps> = ({ plan }) => {
  const getPlanStyles = () => {
    switch (plan) {
      case 'free':
        return 'bg-gray-200 text-gray-700';
      case 'pro': // Updated case
        return 'bg-primary/10 text-primary'; // Using primary color for Pro
      case 'enterprise': // Updated case
        return 'bg-secondary/10 text-secondary'; // Using secondary color for Enterprise
      default:
        return 'bg-gray-200 text-gray-700';
    }
  };

  const getPlanName = () => {
    switch (plan) {
      case 'free':
        return 'Free';
      case 'pro': // Updated case
        return 'Pro';
      case 'enterprise': // Updated case
        return 'Enterprise';
      default:
        return 'Free';
    }
  };

  return (
    <span
      className={`ml-2 text-xs px-1.5 py-0.5 rounded ${getPlanStyles()}`}
    >
      {getPlanName()}
    </span>
  );
};

export default PlanBadge;
