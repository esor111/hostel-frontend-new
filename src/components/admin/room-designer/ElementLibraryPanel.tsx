
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { elementTypes, categories, ElementType } from "./ElementTypes";

interface ElementLibraryPanelProps {
  onAddElement: (type: string) => void;
}

export const ElementLibraryPanel = ({ 
  onAddElement
}: ElementLibraryPanelProps) => {

  // Show all elements - no filtering needed
  const filteredElements = elementTypes;

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
        <div className="p-3 border-b border-gray-200 bg-white">
          <h3 className="font-semibold text-sm">Elements</h3>
          

          

        </div>

        {/* Elements List */}
        <div className="flex-1 p-2 overflow-y-auto bg-white">
          {filteredElements.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <p className="text-base font-medium mb-2">No elements available</p>
            </div>
          ) : (
            <div className="space-y-1">
              {filteredElements.map((element) => {
                return (
                  <div key={element.type}>
                      <Button
                        variant="outline"
                        className="h-9 w-full flex items-center gap-2 px-3 py-2 hover:bg-gray-50 transition-colors cursor-grab active:cursor-grabbing relative group bg-white border hover:border-gray-300"
                        onClick={() => handleElementClick(element.type)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, element.type)}
                      >
                        {/* Emoji */}
                        <div className="text-base flex-shrink-0">
                          {element.emoji}
                        </div>
                        
                        {/* Element Info */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="font-medium text-sm truncate">
                            {element.label}
                          </div>
                        </div>
                        
                        {/* Add Icon */}
                        <Plus className="h-3 w-3 text-gray-400 group-hover:text-gray-600 flex-shrink-0" />
                      </Button>
                    </div>

                );
              })}
            </div>
          )}


        </div>


      </div>
  );
};

export { elementTypes };
