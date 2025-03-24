import React, { ReactNode } from 'react';

interface Props {
  content: string;
  children: ReactNode;
  placement?: 'top' | 'bottom';
}

const Tooltip = ({ content, children, placement = 'top' }: Props) => {
  const getPlacementClasses = () => {
    switch (placement) {
      case 'bottom':
        return {
          tooltip: 'bottom-auto top-full mb-0 mt-2',
          arrow: 'bottom-auto top-0 -translate-y-full border-t-0 border-b-4'
        };
      default:
        return {
          tooltip: 'top-auto bottom-full mt-0 mb-2',
          arrow: 'top-auto bottom-0 translate-y-full border-b-0 border-t-4'
        };
    }
  };

  const placementClasses = getPlacementClasses();

  return (
    <div className="relative group">
      {children}
      <div className={`absolute left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap z-50 ${placementClasses.tooltip}`}>
        {content}
        <div className={`absolute left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent ${placementClasses.arrow} border-gray-900`}></div>
      </div>
    </div>
  );
};

export default Tooltip;