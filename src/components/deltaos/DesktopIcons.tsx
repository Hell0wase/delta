import { PinnedItem } from '@/types/deltaos';
import { Gamepad2, LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

interface DesktopIconsProps {
  pinnedItems: PinnedItem[];
  onOpenItem: (item: PinnedItem) => void;
}

export const DesktopIcons = ({ pinnedItems, onOpenItem }: DesktopIconsProps) => {
  if (!pinnedItems || pinnedItems.length === 0) {
    return null;
  }

  const renderIcon = (item: PinnedItem) => {
    if (item.isImage) {
      return (
        <img 
          src={item.icon} 
          alt={item.name}
          className="w-8 h-8 object-contain"
        />
      );
    }
    
    // For custom games, always use Gamepad2
    if (item.type === 'customGame') {
      return <Gamepad2 className="h-7 w-7 text-white" />;
    }
    
    // For emoji icons (apps and delta games), render as text
    return (
      <span className="text-3xl leading-none">
        {item.icon}
      </span>
    );
  };

  return (
    <div className="absolute top-4 left-4 flex flex-col gap-4 z-0">
      {pinnedItems.map((item, index) => (
        <div
          key={item.id}
          className="group cursor-pointer flex flex-col items-center w-24 p-3 rounded-xl hover:bg-white/10 dark:hover:bg-black/20 transition-all duration-300 animate-bounce-in"
          onClick={() => onOpenItem(item)}
          onDoubleClick={() => onOpenItem(item)}
          data-testid={`desktop-icon-${item.id}`}
          style={{
            animationDelay: `${index * 0.1}s`,
          }}
        >
          <div 
            className="w-14 h-14 mb-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-violet-700 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-200"
            style={{
              willChange: 'transform',
            }}
          >
            {renderIcon(item)}
          </div>
          <span className="text-xs text-center text-white dark:text-white font-medium line-clamp-2 drop-shadow-lg group-hover:text-white transition-colors duration-300" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.9)' }}>
            {item.name}
          </span>
        </div>
      ))}
    </div>
  );
};
