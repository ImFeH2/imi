import React, {useEffect, useRef, useState} from 'react';
import {Element, PageSettings} from '../types';
import {ElementRenderer} from './ElementRenderer';
import {useElementInteraction} from '../hooks/useElementInteraction';

interface CanvasProps {
    elements: Element[];
    pageSettings: PageSettings;
    selectedElement: Element | null;
    onElementSelect: (element: Element | null) => void;
    onElementDelete: (id: number) => void;
    setElements: (elements: Element[]) => void;
    addToHistory: (elements: Element[]) => void;
}

const Canvas = ({
                    elements,
                    pageSettings,
                    selectedElement,
                    onElementSelect,
                    onElementDelete,
                    setElements,
                    addToHistory
                }: CanvasProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLDivElement>(null);
    const [scale, setScale] = useState(1);
    const [isDragging, setIsDragging] = useState(false);
    const [position, setPosition] = useState({x: 0, y: 0});
    const lastPosition = useRef({x: 0, y: 0});
    const [isMouseOverElement, setIsMouseOverElement] = useState(false);

    const {handleMouseDown, handleDragStart} = useElementInteraction(
        elements,
        setElements,
        addToHistory,
        scale,
        position
    );

    useEffect(() => {
        const handleMouseLeave = () => {
            setIsMouseOverElement(false);
        };

        const elements = document.querySelectorAll('.element-container');
        elements.forEach(element => {
            element.addEventListener('mouseleave', handleMouseLeave);
        });

        return () => {
            elements.forEach(element => {
                element.removeEventListener('mouseleave', handleMouseLeave);
            });
        };
    }, [elements]);

    useEffect(() => {
        const calculateInitialScale = () => {
            if (!containerRef.current) return;

            const containerWidth = containerRef.current.clientWidth - 64;
            const containerHeight = containerRef.current.clientHeight - 64;
            const pageWidth = pageSettings.responsive ? 1200 : pageSettings.width;
            const pageHeight = pageSettings.responsive ? 800 : pageSettings.height;

            const scaleX = containerWidth / pageWidth;
            const scaleY = containerHeight / pageHeight;
            const newScale = Math.min(scaleX, scaleY, 1);

            setScale(newScale);

            const scaledWidth = pageWidth * newScale;
            const scaledHeight = pageHeight * newScale;
            const x = (containerWidth - scaledWidth) / 2;
            const y = (containerHeight - scaledHeight) / 2;
            setPosition({x, y});
        };

        calculateInitialScale();
        window.addEventListener('resize', calculateInitialScale);
        return () => window.removeEventListener('resize', calculateInitialScale);
    }, [pageSettings]);

    const handleWheel = (e: React.WheelEvent) => {
        if (isMouseOverElement) return;

        e.preventDefault();
        const rect = containerRef.current?.getBoundingClientRect();
        if (!rect) return;

        const mouseX = e.clientX - rect.left - position.x;
        const mouseY = e.clientY - rect.top - position.y;

        const delta = e.deltaY * -0.001;
        const newScale = Math.min(Math.max(0.1, scale + delta), 2);

        const scaleDiff = newScale - scale;
        const newX = position.x - (mouseX * scaleDiff);
        const newY = position.y - (mouseY * scaleDiff);

        setScale(newScale);
        setPosition({x: newX, y: newY});
    };

    const handleCanvasClick = (e: React.MouseEvent) => {
        if (e.target === containerRef.current || e.target === canvasRef.current) {
            onElementSelect(null);
            setIsMouseOverElement(false);
        }
    };

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.target === containerRef.current || e.target === canvasRef.current) {
            e.preventDefault();
            setIsDragging(true);
            document.body.style.cursor = 'grabbing';
            lastPosition.current = {
                x: e.clientX - position.x,
                y: e.clientY - position.y
            };
        }
    };

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (isDragging) {
            const newX = e.clientX - lastPosition.current.x;
            const newY = e.clientY - lastPosition.current.y;
            setPosition({x: newX, y: newY});
        }
    };

    const handleCanvasMouseUp = () => {
        if (isDragging) {
            setIsDragging(false);
            document.body.style.cursor = 'default';
        }
        setIsMouseOverElement(false);
    };

    useEffect(() => {
        if (isDragging) {
            const handleGlobalMouseMove = (e: MouseEvent) => {
                const newX = e.clientX - lastPosition.current.x;
                const newY = e.clientY - lastPosition.current.y;
                setPosition({x: newX, y: newY});
            };

            const handleGlobalMouseUp = () => {
                setIsDragging(false);
                document.body.style.cursor = 'default';
                setIsMouseOverElement(false);
            };

            document.addEventListener('mousemove', handleGlobalMouseMove);
            document.addEventListener('mouseup', handleGlobalMouseUp);

            return () => {
                document.removeEventListener('mousemove', handleGlobalMouseMove);
                document.removeEventListener('mouseup', handleGlobalMouseUp);
            };
        }
    }, [isDragging]);

    const getCanvasStyle = () => {
        const baseStyle: React.CSSProperties = {
            position: 'absolute',
            backgroundColor: pageSettings.bgColor,
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
            transition: isDragging ? 'none' : 'transform 0.1s ease',
            width: pageSettings.responsive ? '1200px' : `${pageSettings.width}px`,
            height: pageSettings.responsive ? '800px' : `${pageSettings.height}px`,
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)'
        };
        return baseStyle;
    };

    return (
        <div
            ref={containerRef}
            className="relative w-full h-full overflow-hidden bg-gray-100"
            onWheel={handleWheel}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
            onClick={handleCanvasClick}
            style={{cursor: isDragging ? 'grabbing' : 'grab'}}
        >
            {/* Zoom indicator */}
            <div className="absolute right-4 bottom-4 bg-white px-2 py-1 rounded shadow text-sm z-10">
                {Math.round(scale * 100)}%
            </div>

            {/* Canvas */}
            <div
                ref={canvasRef}
                className="bg-white rounded-lg"
                style={getCanvasStyle()}
            >
                {/* Elements */}
                {elements.map(element => (
                    <ElementRenderer
                        key={element.id}
                        element={element}
                        isSelected={selectedElement?.id === element.id}
                        isPreview={false}
                        onSelect={() => onElementSelect(element)}
                        onDelete={() => onElementDelete(element.id)}
                        onMouseDown={(e, corner) => {
                            setIsMouseOverElement(true);
                            handleMouseDown(e, element.id, corner);
                        }}
                        onDragStart={(e) => {
                            setIsMouseOverElement(true);
                            handleDragStart(e, element.id);
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Canvas;