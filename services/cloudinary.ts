const CLOUDINARY_CLOUD_NAME = 'dzhee09z6';
const CLOUDINARY_UPLOAD_PRESET = 'unsigned_preset';

export const uploadToCloudinary = async (file: File): Promise<string> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload file to Cloudinary');
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    throw error;
  }
};

/**
 * Upload ảnh từ URL (Pixabay) lên Cloudinary
 * @param imageUrl - URL của ảnh từ Pixabay
 * @param folder - Folder trong Cloudinary (optional)
 * @returns URL của ảnh trên Cloudinary
 */
export const uploadImageFromUrl = async (imageUrl: string, folder: string = 'vocabulary'): Promise<string> => {
  const formData = new FormData();
  formData.append('file', imageUrl);
  formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
  formData.append('folder', folder);

  try {
    const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Failed to upload image from URL to Cloudinary: ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    return data.secure_url;
  } catch (error) {
    console.error('Error uploading image from URL to Cloudinary:', error);
    throw error;
  }
};
