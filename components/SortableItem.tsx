"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FeatureItem } from './DraggableList'; // Assuming FeatureItem is exported from DraggableList or moved to a types file

interface SortableItemProps {
    item: FeatureItem;
    rankIcon: string;
    isDragging: boolean; // To control description visibility
}

const SortableItem: React.FC<SortableItemProps> = ({ item, rankIcon, isDragging }) => {
    const {
        attributes,
        listeners, // The drag handle listeners
        setNodeRef, // Ref for the draggable element
        transform, // Style for position during drag
        transition, // Style for animation during drop
        isOver, // Optional: for styling when being dragged over
    } = useSortable({ id: item.id }); // Use the unique ID from FeatureItem

    const style = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'none', // Add default transition
        // Add a slight lift effect when dragging
        boxShadow: isDragging ? '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)' : undefined,
        zIndex: isDragging ? 10 : undefined, // Ensure dragging item is on top
        scale: isDragging ? 1.03 : 1, // Slightly larger when dragging
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes} // Spread accessibility and other attributes
            {...listeners} // Spread drag handle listeners
            className={`p-3 rounded shadow cursor-grab active:cursor-grabbing transition-all duration-200 flex items-start gap-3 
                ${isDragging ? 'bg-green-100 dark:bg-green-900 ring-2 ring-green-500' : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'}
                `}
        >
            {/* Rank Icon */}
            <span className="text-xl pt-1 select-none">{rankIcon || '🏅'}</span>
            {/* Content */}
            <div className="text-left flex-1"> {/* Added flex-1 to take remaining space */}
                <span className="font-semibold select-none">{item.name}</span>
                {/* Show description only when NOT dragging */}
                {!isDragging && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 select-none">
                        {item.description}
                    </p>
                )}
            </div>
        </div>
    );
};

export default SortableItem;
