'use client';

import { useCallback, useRef, useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { Upload, X, FileText, Image, Loader2 } from 'lucide-react';

interface DropzoneProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  previewUrl: string | null;
  onRemoveFile: () => void;
  isDragActive: boolean;
  setDragActive: (active: boolean) => void;
  acceptedTypes: string[];
  maxSize: number;
}

export function Dropzone({
  onFileSelect,
  selectedFile,
  previewUrl,
  onRemoveFile,
  isDragActive,
  setDragActive,
  acceptedTypes,
  maxSize,
}: DropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewError, setPreviewError] = useState(false);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, [setDragActive]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, [setDragActive]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect, setDragActive]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <Image className="h-8 w-8" />;
    if (type === 'application/pdf') return <FileText className="h-8 w-8 text-red-500" />;
    return <FileText className="h-8 w-8" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} o`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
  };

  if (selectedFile && previewUrl) {
    const isImage = selectedFile.type.startsWith('image/');

    return (
      <div className="relative rounded-xl border-2 border-green-500 bg-green-50 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isImage && previewUrl && !previewError ? (
              <img
                src={previewUrl}
                alt="Aperçu"
                className="h-16 w-16 rounded-lg object-cover"
                onError={() => setPreviewError(true)}
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-lg bg-muted">
                {getFileIcon(selectedFile.type)}
              </div>
            )}
            <div className="min-w-0">
              <p className="font-medium truncate max-w-xs">{selectedFile.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onRemoveFile}
            className="p-2 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-colors"
            aria-label="Supprimer le fichier"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
          <Upload className="h-3 w-3" />
          Fichier prêt à être envoyé
        </p>
      </div>
    );
  }

  return (
    <div
      ref={inputRef}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={cn(
        'relative rounded-xl border-2 border-dashed p-6 text-center transition-all',
        isDragActive
          ? 'border-primary bg-primary/5'
          : 'border-muted hover:border-primary/50'
      )}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedTypes.join(',')}
        onChange={handleFileChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        aria-label="Choisir un fichier"
      />

      <div className="space-y-3">
        <div className="flex h-16 w-16 items-center justify-center rounded-full mx-auto bg-muted">
          <Upload className={cn('h-8 w-8', isDragActive ? 'text-primary' : 'text-muted-foreground')} />
        </div>

        <div>
          <p className={cn('font-medium', isDragActive ? 'text-primary' : 'text-foreground')}>
            {isDragActive ? 'Déposez le fichier ici' : 'Cliquez ou déposez un fichier'}
          </p>
          <p className="text-sm text-muted-foreground mt-1">
            Formats : {acceptedTypes.map(t => t.replace('application/', '').replace('image/', '')).join(', ')} • Max {formatFileSize(maxSize)}
          </p>
        </div>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-2 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:text-primary/80"
        >
          <Upload className="h-4 w-4" />
          Parcourir
        </button>
      </div>
    </div>
  );
}