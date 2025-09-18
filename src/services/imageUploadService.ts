import { toast } from 'sonner';

export interface UploadedImage {
  fileUrl: string;
  fileUrlWithBlurHash: string;
}

export interface ImageUploadResponse {
  fileUrls: UploadedImage[];
}

export class ImageUploadService {
  private static readonly UPLOAD_URL = 'https://dev.kaha.com.np/main/api/v3/uploads/array';
  private static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
  private static readonly ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

  /**
   * Upload multiple images to kaha-main-v3 microservice
   */
  static async uploadImages(files: File[]): Promise<UploadedImage[]> {
    try {
      // Validate files
      this.validateFiles(files);

      // Create FormData
      const formData = new FormData();
      files.forEach(file => {
        formData.append('files', file);
      });

      console.log(`📤 Uploading ${files.length} images to kaha-main-v3...`);

      // Upload to kaha-main-v3 microservice
      const response = await fetch(this.UPLOAD_URL, {
        method: 'POST',
        body: formData,
        headers: {
          'accept': '*/*',
        },
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }

      const result: ImageUploadResponse = await response.json();
      
      console.log('✅ Images uploaded successfully:', result);
      
      if (!result.fileUrls || result.fileUrls.length === 0) {
        throw new Error('No file URLs returned from upload service');
      }

      return result.fileUrls;
    } catch (error) {
      console.error('❌ Error uploading images:', error);
      toast.error('Failed to upload images. Please try again.');
      throw error;
    }
  }

  /**
   * Upload a single image
   */
  static async uploadSingleImage(file: File): Promise<UploadedImage> {
    const results = await this.uploadImages([file]);
    return results[0];
  }

  /**
   * Validate files before upload
   */
  private static validateFiles(files: File[]): void {
    if (!files || files.length === 0) {
      throw new Error('No files selected for upload');
    }

    if (files.length > 10) {
      throw new Error('Maximum 10 images can be uploaded at once');
    }

    files.forEach((file, index) => {
      // Check file type
      if (!this.ALLOWED_TYPES.includes(file.type)) {
        throw new Error(`File ${index + 1}: Only JPEG, PNG, and WebP images are allowed`);
      }

      // Check file size
      if (file.size > this.MAX_FILE_SIZE) {
        throw new Error(`File ${index + 1}: File size must be less than 10MB`);
      }

      // Check if file is actually an image
      if (!file.type.startsWith('image/')) {
        throw new Error(`File ${index + 1}: Selected file is not a valid image`);
      }
    });
  }

  /**
   * Create a preview URL for a file
   */
  static createPreviewUrl(file: File): string {
    return URL.createObjectURL(file);
  }

  /**
   * Revoke a preview URL to free memory
   */
  static revokePreviewUrl(url: string): void {
    URL.revokeObjectURL(url);
  }

  /**
   * Compress image before upload (optional utility)
   */
  static async compressImage(file: File, maxWidth: number = 1920, quality: number = 0.8): Promise<File> {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              resolve(file); // Return original if compression fails
            }
          },
          file.type,
          quality
        );
      };

      img.src = URL.createObjectURL(file);
    });
  }
}

export default ImageUploadService;