
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Search, X } from "lucide-react";
import { elementTypes, categories, ElementType } from "./ElementTypes";

interface ElementLibraryPanelProps {
  onAddElement: (type: string) => void;
}

export const ElementLibraryPanel = ({
  onAddElement
}: ElementLibraryPanelProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+F or Cmd+F to focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Filter elements based on search query
  const filteredElements = elementTypes.filter(element =>
    element.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    element.type.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleElementClick = (elementType: string) => {
    onAddElement(elementType);
  };

  const handleDragStart = (e: React.DragEvent, elementType: string) => {
    e.dataTransfer.setData('text/plain', elementType);
    e.dataTransfer.effectAllowed = 'copy';

    // Add visual feedback
    const dragImage = e.currentTarget.cloneNode(true) as HTMLElement;
    dragImage.style.transform = 'rotate(5deg) scale(1.1)';
    dragImage.style.opacity = '0.8';
    e.dataTransfer.setDragImage(dragImage, 50, 50);
  };

  return (
    <div className="w-72 bg-white border-r border-gray-200 h-full flex flex-col shadow-lg">
      <div className="p-4 border-b border-gray-200 bg-white">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-lg">Elements</h3>
          {searchQuery && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              {filteredElements.length} found
            </span>
          )}
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            ref={searchInputRef}
            type="text"
            placeholder="Search elements... (Ctrl+F)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10 h-9 text-sm"
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                setSearchQuery("");
              }
            }}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery("")}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-gray-100"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>

      {/* Elements List */}
      <div className="flex-1 p-3 overflow-y-auto bg-white">
        {filteredElements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            {searchQuery ? (
              <>
                <Search className="h-8 w-8 mx-auto mb-3 text-gray-300" />
                <p className="text-base font-medium mb-2">No elements found</p>
                <p className="text-sm">Try searching for "bed", "door", or "window"</p>
              </>
            ) : (
              <p className="text-base font-medium mb-2">No elements available</p>
            )}
          </div>
        ) : (
          <div className="space-y-2">
            {filteredElements.map((element) => {
              return (
                <div key={element.type}>
                  <Button
                    variant="outline"
                    className="h-14 w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 hover:border-purple-200 transition-all duration-200 cursor-grab active:cursor-grabbing relative group bg-white border-gray-200 hover:shadow-sm"
                    onClick={() => handleElementClick(element.type)}
                    draggable
                    onDragStart={(e) => handleDragStart(e, element.type)}
                  >
                    {/* Emoji - Bigger */}
                    <div className="text-2xl flex-shrink-0">
                      {element.emoji}
                    </div>

                    {/* Element Info - More spacious */}
                    <div className="flex-1 text-left min-w-0">
                      <div className="font-semibold text-base truncate text-gray-900">
                        {element.label}
                      </div>
                      <div className="text-xs text-gray-500 mt-0.5">
                        Click or drag to add
                      </div>
                    </div>

                    {/* Add Icon - Bigger */}
                    <Plus className="h-5 w-5 text-gray-400 group-hover:text-purple-600 flex-shrink-0 transition-colors" />
                  </Button>
                </div>

              );
            })}
          </div>
        )}

        {/* Quick Stats */}
        {filteredElements.length > 0 && (
          <div className="mt-4 pt-3 border-t border-gray-100">
            <p className="text-xs text-gray-500 text-center">
              {filteredElements.length} element{filteredElements.length !== 1 ? 's' : ''} available
              {searchQuery && ` for "${searchQuery}"`}
            </p>
          </div>
        )}
      </div>


    </div>
  );
};

export { elementTypes };
