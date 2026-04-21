'use client';

import * as React from 'react';
import { Upload, FileText, CheckCircle2, Loader2, AlertTriangle } from 'lucide-react';

type UploadStatus = 'idle' | 'uploading' | 'success' | 'error';

const FileUploadComponent: React.FC = () => {
    const [status, setStatus] = React.useState<UploadStatus>('idle');
    const [fileName, setFileName] = React.useState<string>('');

    const uploadFile = async (file: File) => {
        setFileName(file.name);
        setStatus('uploading');
        try {
            const formData = new FormData();
            formData.append('pdf', file);
            const res = await fetch('http://localhost:4000/upload/pdf', {
                method: 'POST',
                body: formData,
            });
            if (!res.ok) throw new Error('Upload failed');
            setStatus('success');
        } catch (err) {
            console.error(err);
            setStatus('error');
        }
    };

    const handleFileUpload = () => {
        const inputEl = document.createElement('input');
        inputEl.setAttribute('type', 'file');
        inputEl.setAttribute('accept', 'application/pdf');
        inputEl.addEventListener('change', () => {
            if (inputEl.files && inputEl.files.length > 0) {
                const file = inputEl.files[0];
                if (file) uploadFile(file);
            }
        });
        inputEl.click();
    };

    return (
        <div className="w-full max-w-sm flex flex-col gap-3 md:gap-4">
            <div className="bg-[#ffd60a] border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tight text-black">
                    Upload PDF
                </h1>
                <p className="text-xs md:text-sm font-bold text-black/80 mt-1">
                    Drop a document to start chatting
                </p>
            </div>

            <button
                onClick={handleFileUpload}
                disabled={status === 'uploading'}
                className="bg-[#90e0ef] border-4 border-black p-4 md:p-6 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] active:translate-x-[4px] active:translate-y-[4px] active:shadow-none transition-all disabled:opacity-70 disabled:cursor-not-allowed flex flex-col items-center justify-center gap-2 md:gap-3 cursor-pointer"
            >
                <div className="bg-white border-4 border-black w-12 h-12 md:w-16 md:h-16 flex items-center justify-center shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] rotate-[-4deg]">
                    <Upload className="w-6 h-6 md:w-7 md:h-7" strokeWidth={3} />
                </div>
                <p className="font-black uppercase text-base md:text-lg tracking-wide text-black">
                    Choose a file
                </p>
                <p className="font-bold text-[10px] md:text-xs text-black/70 uppercase">
                    PDF only
                </p>
            </button>

            {status !== 'idle' && (
                <div
                    className={`border-4 border-black p-3 shadow-[3px_3px_0px_0px_rgba(0,0,0,1)] md:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] flex items-center gap-3 ${
                        status === 'uploading'
                            ? 'bg-[#fdf0d5]'
                            : status === 'success'
                            ? 'bg-[#06d6a0]'
                            : 'bg-[#ff006e] text-white'
                    }`}
                >
                    <div className="flex-shrink-0 bg-white border-[3px] border-black w-9 h-9 flex items-center justify-center shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]">
                        {status === 'uploading' && (
                            <Loader2 className="w-4 h-4 animate-spin text-black" strokeWidth={3} />
                        )}
                        {status === 'success' && (
                            <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
                        )}
                        {status === 'error' && (
                            <AlertTriangle className="w-4 h-4 text-black" strokeWidth={3} />
                        )}
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="font-black uppercase text-xs tracking-wider">
                            {status === 'uploading' && 'Uploading...'}
                            {status === 'success' && 'Ready to chat'}
                            {status === 'error' && 'Upload failed'}
                        </p>
                        <p className="font-bold text-sm truncate">{fileName}</p>
                    </div>
                </div>
            )}

            <div className="bg-[#fdf0d5] border-4 border-black p-3 md:p-4 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] md:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4" strokeWidth={3} />
                    <p className="font-black uppercase text-xs tracking-wider">How it works</p>
                </div>
                <ol className="space-y-1.5 text-xs md:text-sm font-bold text-black/80">
                    <li className="flex gap-2">
                        <span className="bg-black text-white font-black w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                            1
                        </span>
                        <span>Upload your PDF document</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="bg-black text-white font-black w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                            2
                        </span>
                        <span>Wait for it to be indexed</span>
                    </li>
                    <li className="flex gap-2">
                        <span className="bg-black text-white font-black w-5 h-5 flex items-center justify-center text-xs flex-shrink-0">
                            3
                        </span>
                        <span>Ask questions in the chat</span>
                    </li>
                </ol>
            </div>
        </div>
    );
};

export default FileUploadComponent;
