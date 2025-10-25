"use client";

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    // Import TouchSensor
    PointerSensor,
    TouchSensor, // <-- Import TouchSensor
    KeyboardSensor,
    useSensor,
    useSensors,
    DragStartEvent,
    DragEndEvent,
} from '@dnd-kit/core';
import {
    SortableContext,
    verticalListSortingStrategy,
    arrayMove,
    sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import SortableItem from './SortableItem';

// Define and EXPORT the structure for each feature
export interface FeatureItem {
    id: string;
    name: string;
    description: string;
    icon: string;
}

interface DraggableListProps {
    initialItems: FeatureItem[];
    onOrderChange: (newOrderNames: string[]) => void;
}

const rankIcons = ['🥇', '🥈', '🥉', '🏅'];

const DraggableList: React.FC<DraggableListProps> = ({ initialItems, onOrderChange }) => {
    const [items, setItems] = useState<FeatureItem[]>(initialItems);
    const [activeId, setActiveId] = useState<string | null>(null);

    useEffect(() => {
        const currentIds = items.map(i => i.id).join(',');
        const initialIds = initialItems.map(i => i.id).join(',');
        if (currentIds !== initialIds) {
            setItems(initialItems);
        }
    }, [initialItems, items]);

    // *** UPDATED SENSOR CONFIGURATION ***
    const sensors = useSensors(
        // Configure PointerSensor (handles mouse and touch generally)
        useSensor(PointerSensor, {
             // Require a small delay and distance before activating drag
             // Helps prevent accidental drags when scrolling on touch devices
            activationConstraint: {
                delay: 100, // milliseconds
                tolerance: 5, // pixels
            },
        }),
        // Explicitly add TouchSensor (might improve compatibility on some devices)
        useSensor(TouchSensor, {
             // Same activation constraint for touch
             activationConstraint: {
                delay: 100,
                tolerance: 5,
            },
        }),
        // Keep KeyboardSensor for accessibility
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
        // Optional: Add haptic feedback on mobile if desired
        if (navigator.vibrate) {
            navigator.vibrate(50); // Vibrate for 50ms
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        setActiveId(null);
        const { active, over } = event;

        if (over && active.id !== over.id) {
            setItems((currentItems) => {
                const oldIndex = currentItems.findIndex(item => item.id === active.id);
                const newIndex = currentItems.findIndex(item => item.id === over.id);

                if (oldIndex === -1 || newIndex === -1) {
                    console.error("DraggableList: Could not find dragged item indices during reorder.");
                    return currentItems;
                }

                const newItems = arrayMove(currentItems, oldIndex, newIndex);
                onOrderChange(newItems.map(item => item.name));
                return newItems;
            });
        }
    };

    return (
        <DndContext
            sensors={sensors} // Use updated sensors
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                {/* Apply touch-action:none to the container of sortable items */}
                {/* This helps prevent browser scroll interference */}
                <div className="space-y-3 mb-6 p-4 border border-dashed rounded-lg max-w-md mx-auto touch-none"> {/* <-- Added touch-none */}
                    {items.map((item, index) => (
                        <SortableItem
                            key={item.id}
                            item={item}
                            rankIcon={rankIcons[index] || '🏅'}
                            isDragging={activeId === item.id}
                        />
                    ))}
                </div>
            </SortableContext>
        </DndContext>
    );
};

export default DraggableList;

