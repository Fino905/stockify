import React, { useRef, useState, useEffect } from 'react';
import { 
    Camera, 
    SwitchCamera, 
    CameraOff, 
    X, 
    Check, 
    RefreshCw, 
    AlertCircle,
    Sparkles
} from 'lucide-react';

interface CameraCaptureModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (file: File, previewUrl: string) => void;
    title?: string;
    fileNamePrefix?: string;
}

export function CameraCaptureModal({
    isOpen,
    onClose,
    onCapture,
    title = 'Ambil Foto via Kamera',
    fileNamePrefix = 'bukti-foto'
}: CameraCaptureModalProps) {
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
    const [isLoading, setIsLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [isFlashing, setIsFlashing] = useState(false);

    // Stop all active tracks
    const stopTracks = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }
    };

    // Start camera stream
    const startCamera = async (mode: 'environment' | 'user') => {
        setIsLoading(true);
        setErrorMessage(null);
        stopTracks();

        if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setErrorMessage('Browser tidak mendukung akses kamera langsung (getUserMedia). Silakan pilih file secara manual.');
            setIsLoading(false);
            return;
        }

        try {
            const constraints: MediaStreamConstraints = {
                video: {
                    facingMode: mode,
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                },
                audio: false
            };

            const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
            setStream(mediaStream);

            if (videoRef.current) {
                videoRef.current.srcObject = mediaStream;
                try {
                    await videoRef.current.play();
                } catch {
                    // Ignore autoplay restrictions
                }
            }
            setIsLoading(false);
        } catch (err: any) {
            console.error('Camera access error:', err);
            // Fallback to any video device
            try {
                const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true, audio: false });
                setStream(fallbackStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = fallbackStream;
                    await videoRef.current.play();
                }
                setIsLoading(false);
            } catch (fallbackErr: any) {
                console.error('Camera fallback failed:', fallbackErr);
                let message = 'Gagal mengakses kamera.';
                if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                    message = 'Izin kamera ditolak. Berikan izin kamera di browser Anda untuk mengambil foto langsung.';
                } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
                    message = 'Perangkat kamera tidak ditemukan pada sistem ini.';
                }
                setErrorMessage(message);
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        if (isOpen) {
            startCamera(facingMode);
        } else {
            stopTracks();
        }

        return () => {
            stopTracks();
        };
    }, [isOpen, facingMode]);

    const handleFlipCamera = () => {
        setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    };

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;

        // Visual flash feedback
        setIsFlashing(true);
        setTimeout(() => setIsFlashing(false), 200);

        const width = video.videoWidth || 1280;
        const height = video.videoHeight || 720;

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // If front camera, un-mirror the photo if needed
        if (facingMode === 'user') {
            ctx.translate(width, 0);
            ctx.scale(-1, 1);
        }

        ctx.drawImage(video, 0, 0, width, height);

        canvas.toBlob(
            (blob) => {
                if (!blob) return;

                const fileName = `${fileNamePrefix}-${Date.now()}.jpg`;
                const file = new File([blob], fileName, { type: 'image/jpeg' });
                const previewUrl = URL.createObjectURL(blob);

                stopTracks();
                onCapture(file, previewUrl);
                onClose();
            },
            'image/jpeg',
            0.9
        );
    };

    const handleClose = () => {
        stopTracks();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-gray-950/80 backdrop-blur-sm animate-in fade-in">
            <div className="bg-gray-900 text-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden border border-gray-800 flex flex-col relative max-h-[92vh]">
                {/* Header */}
                <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-900/90 z-10">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center">
                            <Camera className="w-4 h-4" />
                        </div>
                        <div>
                            <h3 className="font-bold text-sm text-white">
                                {title}
                            </h3>
                            <p className="text-[11px] text-gray-400">
                                Arahkan kamera ke barang atau bukti transaksi
                            </p>
                        </div>
                    </div>
                    <button
                        type="button"
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white p-1.5 rounded-lg hover:bg-gray-800 transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Viewfinder Area */}
                <div className="relative bg-black flex-1 min-h-[340px] max-h-[500px] flex items-center justify-center overflow-hidden">
                    {/* Live Video */}
                    <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {/* Hidden Canvas for capture */}
                    <canvas ref={canvasRef} className="hidden" />

                    {/* Camera Flash Overlay */}
                    {isFlashing && (
                        <div className="absolute inset-0 bg-white opacity-80 animate-fade-out pointer-events-none transition-opacity" />
                    )}

                    {/* Viewfinder Target Frame Overlay */}
                    {!isLoading && !errorMessage && (
                        <div className="absolute inset-8 sm:inset-12 pointer-events-none flex flex-col justify-between">
                            <div className="flex justify-between">
                                <div className="w-8 h-8 border-t-2 border-l-2 border-white/80 rounded-tl-lg" />
                                <div className="w-8 h-8 border-t-2 border-r-2 border-white/80 rounded-tr-lg" />
                            </div>
                            <div className="text-center">
                                <span className="bg-black/50 text-white text-[11px] font-semibold px-3 py-1 rounded-full backdrop-blur-xs border border-white/20 shadow-sm">
                                    Posisikan bukti di dalam kotak
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <div className="w-8 h-8 border-b-2 border-l-2 border-white/80 rounded-bl-lg" />
                                <div className="w-8 h-8 border-b-2 border-r-2 border-white/80 rounded-br-lg" />
                            </div>
                        </div>
                    )}

                    {/* Loading State */}
                    {isLoading && (
                        <div className="absolute inset-0 bg-gray-950/80 flex flex-col items-center justify-center gap-3">
                            <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
                            <span className="text-xs font-medium text-gray-300">Menghubungkan ke kamera...</span>
                        </div>
                    )}

                    {/* Error State */}
                    {errorMessage && (
                        <div className="absolute inset-0 bg-gray-950/90 flex flex-col items-center justify-center p-6 text-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-rose-900/50 text-rose-400 flex items-center justify-center border border-rose-700">
                                <CameraOff className="w-6 h-6" />
                            </div>
                            <div className="space-y-1 max-w-sm">
                                <h4 className="font-bold text-sm text-white">Kamera Tidak Tersedia</h4>
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    {errorMessage}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => startCamera(facingMode)}
                                className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-colors inline-flex items-center gap-1.5"
                            >
                                <RefreshCw className="w-3.5 h-3.5" />
                                <span>Coba Lagi</span>
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer Controls */}
                <div className="p-4 bg-gray-900 border-t border-gray-800 flex items-center justify-between">
                    {/* Flip Camera Button */}
                    <button
                        type="button"
                        onClick={handleFlipCamera}
                        disabled={isLoading || !!errorMessage}
                        className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-40 text-gray-300 hover:text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                        title="Balik Kamera Depan / Belakang"
                    >
                        <SwitchCamera className="w-4 h-4" />
                        <span className="hidden sm:inline">Balik Kamera</span>
                    </button>

                    {/* Capture Shutter Button */}
                    <button
                        type="button"
                        onClick={handleCapture}
                        disabled={isLoading || !!errorMessage}
                        className="w-16 h-16 rounded-full border-4 border-white/30 bg-white hover:bg-gray-200 active:scale-95 disabled:opacity-40 shadow-xl flex items-center justify-center transition-all cursor-pointer group"
                        title="Jepret Foto Sekarang"
                    >
                        <div className="w-11 h-11 rounded-full bg-blue-600 group-hover:bg-blue-700 flex items-center justify-center text-white transition-colors">
                            <Camera className="w-5 h-5" />
                        </div>
                    </button>

                    {/* Cancel / Close */}
                    <button
                        type="button"
                        onClick={handleClose}
                        className="px-4 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                        Batal
                    </button>
                </div>
            </div>
        </div>
    );
}

