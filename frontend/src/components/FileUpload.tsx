import React, { useCallback, useState } from 'react';
import { Upload, FileType, AlertTriangle } from 'lucide-react';

interface FileUploadProps {
  onFileLoaded: (file: File) => void;
  isLoading: boolean;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onFileLoaded, isLoading }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    setError(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.csv') || file.type.includes('csv') || file.type.includes('text')) {
        onFileLoaded(file);
      } else {
        setError("Invalid file type. Please upload a Burp Suite CSV export.");
      }
    }
  }, [onFileLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    setError(null);
    if (e.target.files && e.target.files[0]) {
       onFileLoaded(e.target.files[0]);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-20">
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg transition-all duration-300
          ${isDragging 
            ? 'border-cyan-500 bg-cyan-950/20' 
            : 'border-slate-700 bg-slate-900 hover:border-slate-500 hover:bg-slate-800'}
        `}
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
            {isLoading ? (
                 <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500 mb-4"></div>
            ) : (
                <Upload className={`w-12 h-12 mb-4 ${isDragging ? 'text-cyan-400' : 'text-slate-400'}`} />
            )}
          <p className="mb-2 text-sm text-slate-300">
            <span className="font-semibold">Click to upload</span> or drag and drop
          </p>
          <p className="text-xs text-slate-500">Burp Suite Intruder CSV Export</p>
        </div>
        <input 
            id="dropzone-file" 
            type="file" 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleChange}
            disabled={isLoading}
        />
      </div>
      {error && (
        <div className="mt-4 p-4 bg-red-900/20 border border-red-800 rounded flex items-center gap-2 text-red-200">
          <AlertTriangle className="w-5 h-5" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
};