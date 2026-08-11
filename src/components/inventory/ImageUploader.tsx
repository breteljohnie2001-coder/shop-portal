'use client';

import { useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

interface ImageUploaderProps {
    previewUrl: string | null;
    onImageSelect: (file: File | null) => void;
    disabled?: boolean;
}

export default function ImageUploader({ previewUrl, onImageSelect, disabled }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const cameraInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onImageSelect(file);
    };

    const handleRemove = () => {
        onImageSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        if (cameraInputRef.current) cameraInputRef.current.value = '';
    };

    return (
        <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
                Product Image <span className="text-neutral-600">(Auto-compressed to WebP)</span>
            </label>

            {/* Hidden file input (gallery / files) */}
            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {/* Hidden camera input */}
            <input
                type="file"
                ref={cameraInputRef}
                accept="image/*"
                capture="environment"   // prefers rear camera on mobile
                onChange={handleFileChange}
                className="hidden"
                disabled={disabled}
            />

            {previewUrl ? (
                <div className="relative h-32 w-full rounded-xl border border-neutral-800 bg-neutral-900 overflow-hidden flex items-center justify-center">
                    <img src={previewUrl} alt="Preview" className="h-full object-contain" />
                    <button
                        type="button"
                        onClick={handleRemove}
                        disabled={disabled}
                        className="absolute top-2 right-2 rounded-full bg-neutral-950/80 p-1 text-neutral-400 hover:text-white border border-neutral-700"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-2">
                    {/* Upload from gallery / files */}
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={disabled}
                        className="h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center gap-1.5 transition text-neutral-400 hover:text-neutral-200"
                    >
                        <Upload className="h-5 w-5 text-emerald-400" />
                        <span className="text-xs">Upload image</span>
                    </button>

                    {/* Take a photo */}
                    <button
                        type="button"
                        onClick={() => cameraInputRef.current?.click()}
                        disabled={disabled}
                        className="h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center gap-1.5 transition text-neutral-400 hover:text-neutral-200"
                    >
                        <Camera className="h-5 w-5 text-sky-400" />
                        <span className="text-xs">Take photo</span>
                    </button>
                </div>
            )}
        </div>
    );
}