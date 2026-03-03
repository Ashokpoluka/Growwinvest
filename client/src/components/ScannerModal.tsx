import React, { useEffect } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X, Camera } from 'lucide-react';

interface ScannerModalProps {
    isOpen: boolean;
    onClose: () => void;
    onScanSuccess: (decodedText: string) => void;
}

const ScannerModal: React.FC<ScannerModalProps> = ({ isOpen, onClose, onScanSuccess }) => {
    useEffect(() => {
        if (!isOpen) return;

        const scanner = new Html5QrcodeScanner(
            "reader",
            { fps: 10, qrbox: { width: 250, height: 250 } },
            /* verbose= */ false
        );

        scanner.render(
            (decodedText) => {
                if (window.navigator.vibrate) {
                    window.navigator.vibrate(100);
                }
                onScanSuccess(decodedText);
                scanner.clear();
                onClose();
            },
            (_errorMessage) => {
                // Ignore errors as they fire constantly while searching for codes
            }
        );

        return () => {
            scanner.clear().catch(error => console.error("Failed to clear scanner", error));
        };
    }, [isOpen, onScanSuccess, onClose]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[300] flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/90 backdrop-blur-md" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[#1e1e1e] border border-gray-800 rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-200">
                <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-[#00d09c1a] text-[#00d09c] rounded-xl">
                            <Camera size={20} />
                        </div>
                        <h3 className="text-xl font-bold">Asset Scanner</h3>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-800 rounded-xl text-gray-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8">
                    <div id="reader" className="w-full overflow-hidden rounded-2xl border-2 border-dashed border-gray-800 bg-black/50 aspect-square flex items-center justify-center">
                        <div className="text-center space-y-4 px-6">
                            <div className="w-16 h-16 bg-gray-800/50 rounded-full flex items-center justify-center mx-auto">
                                <Camera size={32} className="text-gray-600 animate-pulse" />
                            </div>
                            <p className="text-sm text-gray-500 font-medium">Initializing high-speed optics...</p>
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <div className="flex-1 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Optical Engine</p>
                            <p className="text-xs font-bold text-[#00d09c]">QR & Barcode Ready</p>
                        </div>
                        <div className="flex-1 p-4 bg-gray-900/50 rounded-2xl border border-gray-800">
                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-xs font-bold text-blue-500">Awaiting Target</p>
                        </div>
                    </div>

                    <p className="mt-6 text-center text-[10px] text-gray-600 font-black uppercase tracking-[0.2em]">
                        Align code within the frame for instant detection
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ScannerModal;
