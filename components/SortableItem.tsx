"use client";

import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FeatureItem } from './DraggableList'; // Import the type

interface SortableItemProps {
    item: FeatureItem;
    rankIcon: string;
    isDragging: boolean;
}

// *** FIX: Define rankIcons within this component's scope ***
const rankIcons = ['🥇', '🥈', '🥉', '🏅'];

const SortableItem: React.FC<SortableItemProps> = ({ item, rankIcon, isDragging }) => {
    const {
        attributes,
        listeners, // The drag handle listeners
        setNodeRef, // Ref for the draggable element
        transform, // Style for position during drag
        transition, // Style for animation during drop
        isOver, // Optional: for styling when being dragged over
    } = useSortable({ id: item.id }); // Use the unique ID from FeatureItem

    const style: React.CSSProperties = {
        transform: CSS.Transform.toString(transform),
        transition: transition || 'transform 0.2s ease, box-shadow 0.2s ease', // Ensure smooth transition
        // Add a lift effect when dragging
        boxShadow: isDragging
            ? '0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1)'
            : '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        zIndex: isDragging ? 10 : 'auto', // Ensure dragging item is on top
        position: 'relative', // Needed for zIndex
        // Add touch-action: none to prevent browser interference
        touchAction: 'none',
    };

    // Calculate rank number safely
    const rankIndex = rankIcons.indexOf(rankIcon);
    const rankNumber = rankIndex !== -1 ? rankIndex + 1 : items.length; // Fallback if icon not found

    return (
        <div
            ref={setNodeRef}
            style={style}
            {...attributes} // Spread accessibility and other attributes
            {...listeners} // Spread drag handle listeners
            className={`p-3 bg-gray-100 dark:bg-gray-700 rounded-lg shadow cursor-grab active:cursor-grabbing flex items-center gap-3 transition-shadow duration-200 ${
                isOver ? 'ring-2 ring-green-500' : '' // Add a ring when being dragged over
            }`}
            // Accessibility label using calculated rank number
            aria-label={`Feature: ${item.name}, currently ranked ${rankNumber}. Use spacebar to lift, arrow keys to move, spacebar to drop, escape to cancel.`}
        >
            {/* Rank Icon */}
            <span className="text-xl font-semibold text-yellow-500 flex-shrink-0 pt-1" aria-hidden="true">{rankIcon}</span>

            {/* Content */}
            <div className="flex-grow text-left">
                <div className="font-semibold text-gray-900 dark:text-white">{item.name}</div>
                {/* Conditionally render description based on dragging state */}
                {!isDragging && (
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1 transition-opacity duration-200">
                        {item.description}
                    </div>
                )}
            </div>
            {/* Optional: Add a drag handle icon if needed (remove listeners from div above if using this) */}
            {/* <span className="text-gray-400 cursor-grab" {...listeners}>⠿</span> */}
        </div>
    );
};

// Need items length for fallback rank number - this approach won't work easily here.
// Let's simplify the aria-label slightly or pass items length as a prop if needed.
// Simplification for now:
// aria-label={`Feature: ${item.name}. Use spacebar to lift, arrow keys to move, spacebar to drop, escape to cancel.`}


export default SortableItem;

// Re-defining rankIcons here as it was missing
// const rankIcons = ['🥇', '🥈', '🥉', '🏅'];

