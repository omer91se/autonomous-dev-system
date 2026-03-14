import { fileTypeFromBuffer } from 'file-type';

/**
 * Allowed video MIME types
 */
const ALLOWED_VIDEO_TYPES = [
  'video/mp4',
  'video/quicktime', // .mov
  'video/x-msvideo', // .avi
  'video/x-matroska', // .mkv
  'video/webm',
];

/**
 * Maximum file size (500MB in bytes)
 */
const MAX_FILE_SIZE = 500 * 1024 * 1024;

/**
 * Validate file type using magic numbers (not just extension)
 */
export async function validateVideoFile(
  buffer: Buffer
): Promise<{ valid: boolean; error?: string; mimeType?: string }> {
  try {
    // Check file size
    if (buffer.length > MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum of 500MB (received ${Math.round(buffer.length / 1024 / 1024)}MB)`,
      };
    }

    // Check file type using magic numbers
    const fileType = await fileTypeFromBuffer(buffer);

    if (!fileType) {
      return {
        valid: false,
        error: 'Unable to determine file type. File may be corrupted or in an unsupported format.',
      };
    }

    // Verify it's a video file
    if (!ALLOWED_VIDEO_TYPES.includes(fileType.mime)) {
      return {
        valid: false,
        error: `Invalid file type: ${fileType.mime}. Only video files are allowed (MP4, MOV, AVI, MKV, WebM).`,
      };
    }

    return {
      valid: true,
      mimeType: fileType.mime,
    };
  } catch (error) {
    console.error('File validation error:', error);
    return {
      valid: false,
      error: 'Failed to validate file. Please try again.',
    };
  }
}

/**
 * Validate file from FormData
 */
export async function validateVideoFromFormData(
  file: File
): Promise<{ valid: boolean; error?: string; mimeType?: string }> {
  try {
    // Convert File to Buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return await validateVideoFile(buffer);
  } catch (error) {
    console.error('File validation error:', error);
    return {
      valid: false,
      error: 'Failed to read file. Please try again.',
    };
  }
}

/**
 * Get safe filename (sanitize and validate)
 */
export function getSafeFilename(originalName: string): string {
  if (!originalName || typeof originalName !== 'string') {
    return `video-${Date.now()}.mp4`;
  }

  // Remove any path separators and dangerous characters
  const safe = originalName
    .replace(/[^a-zA-Z0-9._-]/g, '_') // Replace unsafe chars with underscore
    .replace(/\.+/g, '.') // Remove multiple dots
    .replace(/^\.+/, '') // Remove leading dots
    .substring(0, 100); // Limit length

  // Ensure it has an extension
  if (!safe.includes('.')) {
    return `${safe}.mp4`;
  }

  return safe;
}

/**
 * Generate unique filename with timestamp
 */
export function generateUniqueFilename(originalName: string, userId: number): string {
  const safeName = getSafeFilename(originalName);
  const ext = safeName.split('.').pop() || 'mp4';
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);

  return `user-${userId}-${timestamp}-${random}.${ext}`;
}
