import imageCompression from 'browser-image-compression';

export async function compressImageToWebP(file: File): Promise<File> {
    const options = {
        maxSizeMB: 0.2, // Target: under 200 KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: 'image/webp',
    };

    try {
        const compressedBlob = await imageCompression(file, options);
        // Return as a standard File object named with .webp extension
        return new File([compressedBlob], `${Date.now()}.webp`, {
            type: 'image/webp',
        });
    } catch (error) {
        console.error('Image compression failed:', error);
        throw error;
    }
}