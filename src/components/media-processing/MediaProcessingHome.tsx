'use client';

import React, { useMemo, useRef, useState } from 'react';
import { Upload, FileVideo, X, CheckCircle2, Loader2, Download } from 'lucide-react';

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const value = bytes / Math.pow(1024, index);

  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 2)} ${units[index]}`;
}

function getOutputFileName(fileName: string) {
  if (!fileName) return 'output.mp4';
  return fileName.replace(/\.[^.]+$/, '.mp4');
}

function downloadBlobFile(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');

  anchor.href = url;
  anchor.download = fileName;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  URL.revokeObjectURL(url);
}

type UploadState = 'idle' | 'uploading' | 'success';

export default function MediaProcessingHome() {
  const inputRef = useRef<HTMLInputElement | null>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadState, setUploadState] = useState<UploadState>('idle');
  const [progress, setProgress] = useState(0);
  const [resultName, setResultName] = useState('');

  const fileInfo = useMemo(() => {
    if (!selectedFile) return null;

    return {
      name: selectedFile.name,
      size: formatBytes(selectedFile.size),
      type: selectedFile.type || 'Unknown',
    };
  }, [selectedFile]);

  const resetState = () => {
    setSelectedFile(null);
    setIsDragging(false);
    setUploadState('idle');
    setProgress(0);
    setResultName('');

    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  const handleFile = (file: File | null) => {
    if (!file) return;

    setSelectedFile(file);
    setUploadState('idle');
    setProgress(0);
    setResultName(getOutputFileName(file.name));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;
    handleFile(file);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    const file = event.dataTransfer.files?.[0] ?? null;
    handleFile(file);
  };

  const handleFakeUpload = async () => {
    if (!selectedFile || uploadState === 'uploading') return;

    setUploadState('uploading');
    setProgress(0);

    for (let value = 0; value <= 100; value += 5) {
      setProgress(value);
      await new Promise((resolve) => setTimeout(resolve, 120));
    }

    setUploadState('success');
  };

  const handleDownloadTestFile = () => {
    if (!selectedFile) return;

    // This is only a UI flow test.
    // The downloaded file is still the original file bytes.
    // Only the file name is changed to .mp4 for demo purposes.
    downloadBlobFile(selectedFile, resultName || selectedFile.name);
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8">
          <p className="mb-2 inline-flex rounded-full border border-slate-800 bg-slate-900 px-3 py-1 text-xs text-slate-300">
            Basic test UI
          </p>

          <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Media Processing Studio
          </h1>

          <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400 sm:text-base">
            Màn test cơ bản để chọn file MOV, chạy thử tiến trình và hiện nút tải file test sau khi hoàn tất.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 shadow-2xl shadow-black/20 sm:p-6">
            <div
              onDragOver={(event) => {
                event.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
              className={[
                'flex min-h-80 cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed p-6 text-center transition',
                isDragging
                  ? 'border-sky-400 bg-sky-500/10'
                  : 'border-slate-700 bg-slate-950/60 hover:border-slate-500 hover:bg-slate-950',
              ].join(' ')}
            >
              <input
                ref={inputRef}
                type="file"
                accept=".mov,video/quicktime,video/*"
                className="hidden"
                onChange={handleInputChange}
              />

              <div className="mb-4 rounded-2xl border border-slate-800 bg-slate-900 p-4">
                <Upload className="h-10 w-10" />
              </div>

              <h2 className="text-xl font-medium">Kéo thả file vào đây</h2>

              <p className="mt-2 max-w-md text-sm text-slate-400">
                Hoặc bấm để chọn file từ máy. Đây là UI test nên hiện tại mới mô phỏng tiến trình xử lý.
              </p>

              <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
                <span className="rounded-full border border-slate-800 px-3 py-1">MOV</span>
                <span className="rounded-full border border-slate-800 px-3 py-1">MP4 output</span>
                <span className="rounded-full border border-slate-800 px-3 py-1">Basic upload flow</span>
              </div>
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <div className="mb-4 flex items-center gap-3">
                <div className="rounded-2xl border border-slate-800 bg-slate-950 p-3">
                  <FileVideo className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="font-medium">Thông tin file</h3>
                  <p className="text-sm text-slate-400">Hiển thị file đang chọn để test.</p>
                </div>
              </div>

              {!fileInfo ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm text-slate-400">
                  Chưa có file nào được chọn.
                </div>
              ) : (
                <div className="space-y-3 rounded-2xl border border-slate-800 bg-slate-950/70 p-4 text-sm">
                  <div>
                    <p className="mb-1 text-slate-400">Tên file</p>
                    <p className="break-all font-medium text-slate-100">{fileInfo.name}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="mb-1 text-slate-400">Dung lượng</p>
                      <p className="font-medium text-slate-100">{fileInfo.size}</p>
                    </div>

                    <div>
                      <p className="mb-1 text-slate-400">MIME type</p>
                      <p className="break-all font-medium text-slate-100">{fileInfo.type}</p>
                    </div>
                  </div>

                  <div>
                    <p className="mb-1 text-slate-400">Tên file đầu ra dự kiến</p>
                    <p className="break-all font-medium text-emerald-400">{resultName}</p>
                  </div>
                </div>
              )}

              <div className="mt-4 flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={handleFakeUpload}
                  disabled={!selectedFile || uploadState === 'uploading'}
                  className="inline-flex items-center justify-center rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-slate-950 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {uploadState === 'uploading' ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Đang test...
                    </>
                  ) : (
                    'Chạy tiến trình test'
                  )}
                </button>

                <button
                  type="button"
                  onClick={resetState}
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-200 transition hover:bg-slate-800"
                >
                  <X className="mr-2 h-4 w-4" />
                  Xóa file
                </button>
              </div>

              {uploadState === 'success' && selectedFile && (
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={handleDownloadTestFile}
                    className="inline-flex items-center justify-center rounded-2xl border border-emerald-700 bg-emerald-900/10 px-4 py-2.5 text-sm font-medium text-emerald-300 transition hover:bg-emerald-900/20"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Tải file test
                  </button>

                  <p className="mt-2 text-xs leading-5 text-slate-400">
                    Đây chỉ là tải file test theo luồng UI. File tải về vẫn là dữ liệu gốc của file đã chọn, chưa phải MP4 convert thật.
                  </p>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-slate-800 bg-slate-900/70 p-5 sm:p-6">
              <h3 className="mb-4 font-medium">Trạng thái xử lý</h3>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/70 p-4">
                <div className="mb-2 flex items-center justify-between text-sm">
                  <span className="text-slate-400">Tiến trình</span>
                  <span className="font-medium text-slate-100">{progress}%</span>
                </div>

                <div className="h-2 overflow-hidden rounded-full bg-slate-800">
                  <div
                    className="h-full rounded-full bg-white transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="mt-4 text-sm">
                  {uploadState === 'idle' && (
                    <p className="text-slate-400">
                      Sẵn sàng để test chọn file và chạy tiến trình mô phỏng.
                    </p>
                  )}

                  {uploadState === 'uploading' && (
                    <p className="text-sky-300">Đang giả lập upload / convert...</p>
                  )}

                  {uploadState === 'success' && (
                    <div className="flex items-start gap-2 text-emerald-300">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
                      <p>Tiến trình test đã hoàn tất. Bạn có thể bấm nút tải file test.</p>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}