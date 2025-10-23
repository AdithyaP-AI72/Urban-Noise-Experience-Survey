"use client";

import React, { useState, useEffect } from 'react';
import {
    DndContext,
    closestCenter,
    PointerSensor,
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
    // *** FIX: Ensure this prop expects string[] ***
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

    const sensors = useSensors(
        useSensor(PointerSensor),
        useSensor(KeyboardSensor, {
            coordinateGetter: sortableKeyboardCoordinates,
        })
    );

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
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
                // *** FIX: Pass only the array of names ***
                onOrderChange(newItems.map(item => item.name));
                return newItems; // Update local state
            });
        }
    };

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
        >
            <SortableContext
                items={items.map(item => item.id)}
                strategy={verticalListSortingStrategy}
            >
                <div className="space-y-3 mb-6 p-4 border border-dashed rounded-lg max-w-md mx-auto">
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

