import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Upload, X, Image as ImageIcon, Loader2, Eye } from 'lucide-react';
import { toast } from 'sonner';
import ImageUploadService, { UploadedImage } from '@/services/imageUploadService';

interface ImageUploadProps {
  onImagesUploaded: (imageUrls: string[]) => void;
  existingImages?: string[];
  maxImages?: number;
  disabled?: boolean;
  className?: string;
}

interface PreviewImage {
  file: File;
  previewUrl: string;
  uploading: boolean;
  uploaded: boolean;
  uploadedData?: UploadedImage;
  error?: string;
  showStatus?: boolean;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  onImagesUploaded,
  existingImages = [],
  maxImages = 10,
  disabled = false,
  className = '',
}) => {
  const [previewImages, setPreviewImages] = useState<PreviewImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate total images (existing + new)
  const totalImages = existingImages.length + previewImages.length;
  const canAddMore = totalImages < maxImages;

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const remainingSlots = maxImages - totalImages;

    if (fileArray.length > remainingSlots) {
      toast.error(`You can only upload ${remainingSlots} more image(s). Maximum ${maxImages} images allowed.`);
      return;
    }

    // Create preview images
    const newPreviewImages: PreviewImage[] = fileArray.map(file => ({
      file,
      previewUrl: ImageUploadService.createPreviewUrl(file),
      uploading: false,
      uploaded: false,
    }));

    setPreviewImages(prev => [...prev, ...newPreviewImages]);

    // Auto-upload immediately after selection
    setTimeout(() => {
      autoUploadImages(newPreviewImages);
    }, 100);
  }, [maxImages, totalImages]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (disabled) return;
    
    const files = e.dataTransfer.files;
    handleFileSelect(files);
  }, [disabled, handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  // Auto-upload function for immediate upload after selection
  const autoUploadImages = async (imagesToUpload: PreviewImage[]) => {
    if (imagesToUpload.length === 0) return;

    setUploading(true);

    try {
      // Mark images as uploading
      setPreviewImages(prev => prev.map(img => 
        imagesToUpload.some(uploadImg => uploadImg.file === img.file) 
          ? { ...img, uploading: true, error: undefined } 
          : img
      ));

      // Upload all selected images
      const filesToUpload = imagesToUpload.map(img => img.file);
      const uploadedResults = await ImageUploadService.uploadImages(filesToUpload);

      // Update preview images with upload results
      setPreviewImages(prev => {
        const updated = prev.map((img) => {
          const uploadIndex = imagesToUpload.findIndex(uploadImg => uploadImg.file === img.file);
          if (uploadIndex !== -1 && uploadedResults[uploadIndex]) {
            console.log(`✅ Auto-uploaded image:`, img.file.name);
            return {
              ...img,
              uploading: false,
              uploaded: true,
              uploadedData: uploadedResults[uploadIndex],
              error: undefined,
            };
          }
          return img;
        });
        
        return updated;
      });

      // Combine existing images with newly uploaded images
      const allImageUrls = [
        ...existingImages,
        ...uploadedResults.map(img => img.fileUrl),
      ];

      onImagesUploaded(allImageUrls);
      
      // Show success message but auto-hide it quickly
      toast.success(`${uploadedResults.length} image(s) uploaded!`, { duration: 2000 });
      
      // Auto-hide success status after 3 seconds
      setTimeout(() => {
        setPreviewImages(prev => prev.map(img => 
          img.uploaded ? { ...img, showStatus: false } : img
        ));
      }, 3000);
      
    } catch (error) {
      console.error('Auto-upload error:', error);
      
      // Mark failed uploads
      setPreviewImages(prev => prev.map(img => 
        imagesToUpload.some(uploadImg => uploadImg.file === img.file) 
          ? { 
              ...img, 
              uploading: false, 
              uploaded: false,
              error: error instanceof Error ? error.message : 'Upload failed' 
            } 
          : img
      ));
      
      toast.error('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const uploadImages = async () => {
    const unuploadedImages = previewImages.filter(img => !img.uploaded && !img.uploading);
    
    if (unuploadedImages.length === 0) {
      toast.info('No new images to upload');
      return;
    }

    await autoUploadImages(unuploadedImages);
  };

  const removePreviewImage = (index: number) => {
    setPreviewImages(prev => {
      const imageToRemove = prev[index];
      // Revoke the preview URL to free memory
      ImageUploadService.revokePreviewUrl(imageToRemove.previewUrl);
      return prev.filter((_, i) => i !== index);
    });
  };

  const removeExistingImage = (index: number) => {
    const updatedImageUrls = existingImages.filter((_, i) => i !== index);
    onImagesUploaded(updatedImageUrls);
    toast.info('Image removed');
  };

  const openFileDialog = () => {
    if (disabled || !canAddMore) return;
    fileInputRef.current?.click();
  };

  const hasUnuploadedImages = previewImages.some(img => !img.uploaded);

  // Debug effect to monitor state changes
  useEffect(() => {
    console.log('🔄 Preview images state changed:', previewImages.map(img => ({
      name: img.file.name,
      uploading: img.uploading,
      uploaded: img.uploaded,
      hasError: !!img.error
    })));
  }, [previewImages]);

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`
          border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${disabled ? 'border-gray-200 bg-gray-50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}
          ${!canAddMore ? 'opacity-50' : ''}
        `}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
      >
        <div className="flex flex-col items-center space-y-2">
          <Upload className={`h-8 w-8 ${disabled ? 'text-gray-400' : 'text-gray-500'}`} />
          <div>
            <p className="text-sm font-medium text-gray-700">
              {canAddMore ? 'Drop images here or click to browse' : `Maximum ${maxImages} images reached`}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              JPEG, PNG, WebP up to 10MB each • {totalImages}/{maxImages} images
            </p>
          </div>
          {canAddMore && !disabled && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={openFileDialog}
              className="mt-2"
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Select Images
            </Button>
          )}
        </div>
      </div>

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/jpeg,image/jpg,image/png,image/webp"
        onChange={(e) => handleFileSelect(e.target.files)}
        className="hidden"
        disabled={disabled || !canAddMore}
      />

      {/* Existing Images */}
      {existingImages.length > 0 && (
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-2">Current Images</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingImages.map((image, index) => (
              <Card key={`existing-${index}`} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={image}
                      alt={`Room image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-200 flex items-center justify-center">
                      <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-2">
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => window.open(image, '_blank')}
                          className="h-8 w-8 p-0"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {!disabled && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeExistingImage(index)}
                            className="h-8 w-8 p-0"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge variant="secondary" className="mt-1 text-xs">
                    Uploaded
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Preview Images */}
      {previewImages.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <h4 className="text-sm font-medium text-gray-700">Images</h4>
            {/* Only show upload button if there are failed uploads that need retry */}
            {previewImages.some(img => img.error && !img.uploaded) && (
              <Button
                onClick={uploadImages}
                disabled={uploading || disabled}
                size="sm"
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Retrying...
                  </>
                ) : (
                  <>
                    <Upload className="h-4 w-4 mr-2" />
                    Retry Failed
                  </>
                )}
              </Button>
            )}
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {previewImages.map((image, index) => (
              <Card key={`preview-${index}`} className="relative group">
                <CardContent className="p-2">
                  <div className="aspect-square relative overflow-hidden rounded-md">
                    <img
                      src={image.previewUrl}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Upload Status Overlay */}
                    {(image.uploading || (image.error && !image.uploaded)) && (
                      <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        {image.uploading ? (
                          <Loader2 className="h-6 w-6 text-white animate-spin" />
                        ) : image.error ? (
                          <div className="text-center text-white text-xs p-2">
                            <X className="h-4 w-4 mx-auto mb-1" />
                            <p>Failed</p>
                          </div>
                        ) : null}
                      </div>
                    )}
                    
                    {/* Success Overlay for uploaded images */}
                    {image.uploaded && (
                      <div className="absolute inset-0 bg-green-600 bg-opacity-20 flex items-center justify-center">
                        <div className="bg-green-600 rounded-full p-1">
                          <svg className="h-4 w-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      </div>
                    )}

                    {/* Remove Button */}
                    {!image.uploading && (
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => removePreviewImage(index)}
                        className="absolute top-1 right-1 h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  
                  {/* Status Badge - Only show for uploading or failed states */}
                  <div className="mt-1">
                    {image.uploading ? (
                      <Badge variant="secondary" className="text-xs">
                        Uploading...
                      </Badge>
                    ) : image.error ? (
                      <Badge variant="destructive" className="text-xs">
                        Failed
                      </Badge>
                    ) : image.uploaded && image.showStatus !== false ? (
                      <Badge variant="default" className="text-xs bg-green-600">
                        ✓ Uploaded
                      </Badge>
                    ) : null}
                  </div>
                  
                  {/* Error Message */}
                  {image.error && (
                    <p className="text-xs text-red-600 mt-1 truncate" title={image.error}>
                      {image.error}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Upload Instructions */}
      {previewImages.length === 0 && existingImages.length === 0 && (
        <div className="text-center py-4">
          <ImageIcon className="h-12 w-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No images uploaded yet</p>
          <p className="text-xs text-gray-400 mt-1">
            Add room images to help guests visualize the space
          </p>
        </div>
      )}
    </div>
  );
};

export default ImageUpload;