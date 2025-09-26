import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Info, Sparkles, CheckCircle } from "lucide-react";

interface RoomDimensions {
  length: number;
  width: number;
  height: number;
}

interface RoomTheme {
  name: string;
  wallColor: string;
  floorColor: string;
  wallTexture?: string;
  floorTexture?: string;
}

interface RoomSetupWizardProps {
  onComplete: (setup: { dimensions: RoomDimensions; theme: RoomTheme }) => void;
  initialData?: { dimensions: RoomDimensions; theme: RoomTheme };
}

export const RoomSetupWizard = ({ onComplete, initialData }: RoomSetupWizardProps) => {
  const [dimensions, setDimensions] = useState<RoomDimensions>(
    initialData?.dimensions || { length: 10, width: 10, height: 10 }
  );
  
  const defaultTheme: RoomTheme = {
    name: 'Modern',
    wallColor: '#F8F9FA',
    floorColor: '#E9ECEF'
  };

  const handleComplete = () => {
    onComplete({ dimensions, theme: initialData?.theme || defaultTheme });
  };

  const isValidDimensions = () => {
    return dimensions.length >= 6 && dimensions.width >= 6 && dimensions.height >= 7;
  };

  const getDimensionStatus = (value: number, min: number, type: string) => {
    if (value < min) return { status: 'error', message: `Too small (min ${min}ft)` };
    if (value > (type === 'height' ? 15 : 60)) return { status: 'warning', message: `Very large` };
    return { status: 'success', message: 'Good' };
  };

  return (
    <TooltipProvider>
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-500" />
            Create your perfect room layout
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Room Dimensions */}
          <div className="space-y-6">
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold mb-2">Room Dimensions</h3>
                <p className="text-gray-600">Set your room's basic measurements</p>
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Input Controls */}
                <div className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Length (ft)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Minimum 6ft recommended</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={dimensions.length}
                        onChange={(e) => setDimensions({...dimensions, length: Number(e.target.value)})}
                        min="6"
                        max="60"
                        step="0.5"
                        className={`text-center ${
                          getDimensionStatus(dimensions.length, 6, 'length').status === 'error' 
                            ? 'border-red-300 focus:border-red-500' 
                            : getDimensionStatus(dimensions.length, 6, 'length').status === 'success'
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-yellow-300 focus:border-yellow-500'
                        }`}
                      />
                      <div className="text-xs mt-1">
                        <span className={`${
                          getDimensionStatus(dimensions.length, 6, 'length').status === 'error' 
                            ? 'text-red-500' 
                            : getDimensionStatus(dimensions.length, 6, 'length').status === 'success'
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        }`}>
                          {getDimensionStatus(dimensions.length, 6, 'length').message}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Width (ft)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Minimum 6ft recommended</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={dimensions.width}
                        onChange={(e) => setDimensions({...dimensions, width: Number(e.target.value)})}
                        min="6"
                        max="60"
                        step="0.5"
                        className={`text-center ${
                          getDimensionStatus(dimensions.width, 6, 'width').status === 'error' 
                            ? 'border-red-300 focus:border-red-500' 
                            : getDimensionStatus(dimensions.width, 6, 'width').status === 'success'
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-yellow-300 focus:border-yellow-500'
                        }`}
                      />
                      <div className="text-xs mt-1">
                        <span className={`${
                          getDimensionStatus(dimensions.width, 6, 'width').status === 'error' 
                            ? 'text-red-500' 
                            : getDimensionStatus(dimensions.width, 6, 'width').status === 'success'
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        }`}>
                          {getDimensionStatus(dimensions.width, 6, 'width').message}
                        </span>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Label>Height (ft)</Label>
                        <Tooltip>
                          <TooltipTrigger>
                            <Info className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Standard ceiling height 8-10ft</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                      <Input
                        type="number"
                        value={dimensions.height}
                        onChange={(e) => setDimensions({...dimensions, height: Number(e.target.value)})}
                        min="7"
                        max="15"
                        step="0.5"
                        className={`text-center ${
                          getDimensionStatus(dimensions.height, 7, 'height').status === 'error' 
                            ? 'border-red-300 focus:border-red-500' 
                            : getDimensionStatus(dimensions.height, 7, 'height').status === 'success'
                            ? 'border-green-300 focus:border-green-500'
                            : 'border-yellow-300 focus:border-yellow-500'
                        }`}
                      />
                      <div className="text-xs mt-1">
                        <span className={`${
                          getDimensionStatus(dimensions.height, 7, 'height').status === 'error' 
                            ? 'text-red-500' 
                            : getDimensionStatus(dimensions.height, 7, 'height').status === 'success'
                            ? 'text-green-500'
                            : 'text-yellow-500'
                        }`}>
                          {getDimensionStatus(dimensions.height, 7, 'height').message}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Presets */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Quick Presets</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ length: 12, width: 10, height: 9 })}
                        className="text-xs"
                      >
                        Small Room
                        <br />
                        <span className="text-gray-500">12×10×9 ft</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ length: 20, width: 16, height: 10 })}
                        className="text-xs"
                      >
                        Medium Room
                        <br />
                        <span className="text-gray-500">20×16×10 ft</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ length: 30, width: 20, height: 10 })}
                        className="text-xs"
                      >
                        Large Room
                        <br />
                        <span className="text-gray-500">30×20×10 ft</span>
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => setDimensions({ length: 40, width: 30, height: 12 })}
                        className="text-xs"
                      >
                        Dormitory
                        <br />
                        <span className="text-gray-500">40×30×12 ft</span>
                      </Button>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center gap-2 text-blue-800 mb-2">
                      <CheckCircle className="h-4 w-4" />
                      <span className="font-medium">Room Summary</span>
                    </div>
                    <p className="text-blue-700">
                      {dimensions.length}ft × {dimensions.width}ft × {dimensions.height}ft 
                      <br />
                      <span className="text-sm">Floor Area: {(dimensions.length * dimensions.width).toFixed(1)} sq feet</span>
                      <br />
                      <span className="text-sm">Volume: {(dimensions.length * dimensions.width * dimensions.height).toFixed(1)} cubic feet</span>
                    </p>
                  </div>
                </div>

                {/* Real-time Visual Preview */}
                <div className="space-y-4">
                  <div className="text-center">
                    <h4 className="font-medium text-gray-700 mb-2">Live Preview</h4>
                    <p className="text-sm text-gray-500">Real-time room visualization</p>
                  </div>
                  
                  {/* 2D Floor Plan Preview */}
                  <div className="bg-white border-2 border-gray-200 rounded-lg p-4">
                    <div className="text-xs text-gray-500 mb-2 text-center">Floor Plan (Top View)</div>
                    <div className="flex items-center justify-center" style={{ minHeight: '200px' }}>
                      <div className="relative">
                        {/* Room outline */}
                        <div
                          className="border-4 border-purple-400 bg-purple-50 relative"
                          style={{
                            width: `${Math.max(80, Math.min(200, dimensions.length * 3))}px`,
                            height: `${Math.max(60, Math.min(150, dimensions.width * 3))}px`,
                          }}
                        >
                          {/* Grid pattern */}
                          <div 
                            className="absolute inset-0 opacity-20"
                            style={{
                              backgroundImage: `
                                linear-gradient(to right, #9333ea 1px, transparent 1px),
                                linear-gradient(to bottom, #9333ea 1px, transparent 1px)
                              `,
                              backgroundSize: '10px 10px'
                            }}
                          />
                          
                          {/* Dimension labels */}
                          <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-purple-600">
                            {dimensions.length}ft
                          </div>
                          <div className="absolute -left-8 top-1/2 transform -translate-y-1/2 -rotate-90 text-xs font-medium text-purple-600">
                            {dimensions.width}ft
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Room Size Indicator */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-3 rounded-lg">
                    <div className="text-center">
                      <div className="text-sm font-medium text-gray-700">Room Category</div>
                      <div className="text-lg font-bold text-purple-600">
                        {dimensions.length * dimensions.width < 100 ? 'Compact' :
                         dimensions.length * dimensions.width < 200 ? 'Standard' :
                         dimensions.length * dimensions.width < 400 ? 'Spacious' : 'Large'}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        {dimensions.length * dimensions.width < 100 ? 'Perfect for 1-2 beds' :
                         dimensions.length * dimensions.width < 200 ? 'Ideal for 2-4 beds' :
                         dimensions.length * dimensions.width < 400 ? 'Great for 4-8 beds' : 'Suitable for 8+ beds'}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              onClick={handleComplete}
              disabled={!isValidDimensions()}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <CheckCircle className="h-4 w-4 mr-2" />
              Start Designing
            </Button>
          </div>
        </CardContent>
      </Card>
    </TooltipProvider>
  );
};