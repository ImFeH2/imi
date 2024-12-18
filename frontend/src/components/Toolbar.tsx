import {LayoutTemplate, Redo, RotateCw, Save, Settings, Sidebar, Undo} from 'lucide-react';

interface ToolbarProps {
    showSidebar: boolean;
    setShowSidebar: (show: boolean) => void;
    showProperties: boolean;
    setShowProperties: (show: boolean) => void;
    showPageSettings: boolean;
    setShowPageSettings: (show: boolean) => void;
    canUndo: boolean;
    canRedo: boolean;
    onUndo: () => void;
    onRedo: () => void;
    onSave: () => void;
    onLoad: () => void;
    isSaving: boolean;
    isLoading: boolean;
    onSaveAsComponent?: () => void;
}

export function Toolbar({
                            showSidebar,
                            setShowSidebar,
                            showProperties,
                            setShowProperties,
                            showPageSettings,
                            setShowPageSettings,
                            canUndo,
                            canRedo,
                            onUndo,
                            onRedo,
                            onSave,
                            onLoad,
                            isSaving,
                            isLoading,
                            onSaveAsComponent
                        }: ToolbarProps) {
    return (
        <div className="fixed top-0 left-0 right-0 h-12 bg-white border-b flex items-center px-4 z-10">
            <div className="flex items-center space-x-2">
                <button
                    onClick={() => setShowSidebar(!showSidebar)}
                    className={`p-2 hover:bg-gray-100 rounded ${showSidebar ? 'bg-gray-100' : ''}`}
                >
                    <Sidebar size={20}/>
                </button>
                <button
                    onClick={() => setShowProperties(!showProperties)}
                    className={`p-2 hover:bg-gray-100 rounded ${showProperties ? 'bg-gray-100' : ''}`}
                >
                    <Settings size={20}/>
                </button>
                <button
                    onClick={() => setShowPageSettings(!showPageSettings)}
                    className={`p-2 hover:bg-gray-100 rounded ${showPageSettings ? 'bg-gray-100' : ''}`}
                >
                    <LayoutTemplate size={20}/>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-2"/>

                <button
                    onClick={onUndo}
                    disabled={!canUndo}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                    <Undo size={20}/>
                </button>
                <button
                    onClick={onRedo}
                    disabled={!canRedo}
                    className="p-2 hover:bg-gray-100 rounded disabled:opacity-50"
                >
                    <Redo size={20}/>
                </button>

                <div className="h-6 w-px bg-gray-300 mx-2"/>

                <button
                    onClick={onSave}
                    disabled={isSaving}
                    className={`p-2 hover:bg-gray-100 rounded flex items-center space-x-1
                        ${isSaving ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <Save size={20}/>
                    {isSaving && (
                        <div className="ml-1 w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"/>
                    )}
                </button>

                {onSaveAsComponent && (
                    <>
                        <div className="h-6 w-px bg-gray-300 mx-2"/>
                        <button
                            onClick={onSaveAsComponent}
                            className="p-2 hover:bg-gray-100 rounded flex items-center space-x-1"
                            title="Save as Custom Component"
                        >
                            <Save size={20}/>
                            <span className="text-sm">Save as Component</span>
                        </button>
                    </>
                )}

                <button
                    onClick={onLoad}
                    disabled={isLoading}
                    className={`p-2 hover:bg-gray-100 rounded flex items-center space-x-1
                        ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                    <RotateCw size={20}/>
                    {isLoading && (
                        <div className="ml-1 w-4 h-4 border-2 border-gray-600 border-t-transparent rounded-full animate-spin"/>
                    )}
                </button>
            </div>
        </div>
    );
}
