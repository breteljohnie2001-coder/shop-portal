'use client';

import { useRef } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface ImageUploaderProps {
    previewUrl: string | null;
    onImageSelect: (file: File | null) => void;
    disabled?: boolean;
}

export default function ImageUploader({ previewUrl, onImageSelect, disabled }: ImageUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        onImageSelect(file);
    };

    const handleRemove = () => {
        onImageSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    return (
        <div>
            <label className="block text-xs font-medium text-neutral-400 mb-1">
                Product Image <span className="text-neutral-600">(Auto-compressed to WebP)</span>
            </label>

            <input
                type="file"
                ref={fileInputRef}
                accept="image/*"
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
                <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={disabled}
                    className="w-full h-24 rounded-xl border border-dashed border-neutral-800 bg-neutral-900/50 hover:bg-neutral-900 flex flex-col items-center justify-center gap-1.5 transition text-neutral-400 hover:text-neutral-200"
                >
                    <Upload className="h-5 w-5 text-emerald-400" />
                    <span className="text-xs">Click to upload product image</span>
                </button>
            )}
        </div>
    );
}