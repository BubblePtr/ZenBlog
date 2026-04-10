import React from 'react';
import {
  RiInformationLine,
  RiAlertLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
} from '@remixicon/react';

const VARIANTS = {
  info: {
    icon: RiInformationLine,
    color:
      'bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 border-blue-200 dark:border-blue-800',
  },
  warning: {
    icon: RiAlertLine,
    color:
      'bg-yellow-50 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-200 border-yellow-200 dark:border-yellow-800',
  },
  success: {
    icon: RiCheckboxCircleLine,
    color:
      'bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200 border-green-200 dark:border-green-800',
  },
  error: {
    icon: RiCloseCircleLine,
    color:
      'bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200 border-red-200 dark:border-red-800',
  },
};

export default function Callout({
  type = 'info',
  title,
  children,
}: {
  type?: keyof typeof VARIANTS;
  title?: string;
  children: React.ReactNode;
}) {
  const variant = VARIANTS[type];
  const Icon = variant.icon;

  return (
    <div className={`my-6 p-4 rounded-lg border flex gap-3 ${variant.color}`}>
      <Icon size={20} className="shrink-0 mt-0.5" />
      <div className="flex-1">
        {title && <div className="font-bold mb-1">{title}</div>}
        <div className="text-sm leading-relaxed opacity-90">{children}</div>
      </div>
    </div>
  );
}
