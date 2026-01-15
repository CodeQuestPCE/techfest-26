'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { toast } from 'sonner';
import api from '@/lib/api';
import { Scan, CheckCircle, XCircle, User, Calendar, Home, LogOut, QrCode, Shield, Sparkles, Camera, CameraOff, X } from 'lucide-react';
import { Html5Qrcode, Html5QrcodeScanner } from 'html5-qrcode';
import MobileMenu from '@/components/MobileMenu';

export default function QRScannerPage() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuthStore();
  const [qrHash, setQrHash] = useState('');
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [scanMode, setScanMode] = useState<'camera' | 'manual'>('camera');
  const [mounted, setMounted] = useState(false);
  const [isSecure, setIsSecure] = useState<boolean>(true);
  const [inIframe, setInIframe] = useState<boolean>(false);
  const [cameraCheckMsg, setCameraCheckMsg] = useState<string | null>(null);
  const lastScannedRef = useRef<string>('');
  const scannerRef = useRef<Html5Qrcode | Html5QrcodeScanner | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    setMounted(true);
    setIsSecure(!!(typeof window !== 'undefined' && window.isSecureContext));
    setInIframe(typeof window !== 'undefined' && window.self !== window.top);
  }, []);

  useEffect(() => {
    if (!isAuthenticated() || !['admin', 'coordinator', 'ambassador'].includes(user?.role || '')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    // Cleanup scanner on unmount
    return () => {
      if (scannerRef.current) {
        try {
          // Check if the element still exists before clearing
          const element = document.getElementById('qr-reader');
          if (element && element.parentNode) {
            // call stop() then clear() if available; attach catch if a promise is returned
            try {
              // @ts-ignore
              if (typeof scannerRef.current.stop === 'function') {
                // @ts-ignore
                const stopRes = scannerRef.current.stop();
                if (stopRes && typeof (stopRes as any).catch === 'function') {
                  (stopRes as any).catch(() => {});
                }
              }
            } catch (_) {}
            try {
              // @ts-ignore
              if (typeof scannerRef.current.clear === 'function') {
                // @ts-ignore
                const clearRes = scannerRef.current.clear();
                if (clearRes && typeof (clearRes as any).catch === 'function') {
                  (clearRes as any).catch(() => {});
                }
              }
            } catch (_) {}
          }
        } catch (error) {
          // Ignore errors during unmount
        }
        scannerRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Stop camera when switching to manual mode
    if (scanMode === 'manual' && cameraActive) {
      stopCamera();
    }
  }, [scanMode]);
  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCameraScan = async (decodedText: string) => {
    if (!decodedText || scanning) return;
    
    // Prevent duplicate scans of the same QR code
    if (decodedText === lastScannedRef.current) return;
    lastScannedRef.current = decodedText;
    
    await processQRCode(decodedText);
    
    // Reset after 3 seconds to allow re-scanning
    setTimeout(() => {
      lastScannedRef.current = '';
    }, 3000);
  };

  const startCamera = async () => {
    if (!mounted) {
      toast.error('Please wait for page to load');
      return;
    }

    try {
      // Clear any existing scanner first
      if (scannerRef.current) {
        try {
          const element = document.getElementById('qr-reader');
          if (element && element.parentNode) {
            try {
              // @ts-ignore
              await scannerRef.current.clear();
            } catch (_) {
              // ignore
            }
          }
        } catch (e) {
          console.log('Error clearing previous scanner:', e);
        }
        scannerRef.current = null;
      }

      // Set camera active first to render the div
      setCameraActive(true);

      // Wait for React to render the element with multiple attempts
      let element = null;
      let attempts = 0;
      while (!element && attempts < 5) {
        await new Promise(resolve => setTimeout(resolve, 100));
        element = document.getElementById('qr-reader');
        attempts++;
      }

      if (!element) {
        console.error('QR reader element not found after multiple attempts');
        setCameraActive(false);
        toast.error('Scanner initialization failed. Please refresh and try again.');
        return;
      }

      // Clear any previous content
      element.innerHTML = '';

      // Ensure camera permission is requested explicitly so we can give clear feedback
      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
        toast.error('Camera access is not supported by this browser.');
        setCameraActive(false);
        return;
      }

      try {
        // Request camera permission preferring the back camera on mobile
        const tempStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
        tempStream.getTracks().forEach((t) => t.stop());
        setCameraCheckMsg('Permission granted');
      } catch (err: any) {
        console.error('User denied camera permission or camera not available:', err);
        setCameraCheckMsg(err?.message || 'Permission request failed');
        if (err && err.name === 'NotAllowedError') {
          toast.error('Camera permission denied. Please allow camera access in your browser settings.');
        } else if (err && err.name === 'NotFoundError') {
          toast.error('No camera device found. Please connect a camera and try again.');
        } else {
          toast.error('Unable to access camera. Please check permissions and try again.');
        }
        setCameraActive(false);
        return;
      }

      // Prefer back-facing camera when available
      let cameraId: string | null = null;
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length) {
          // Try to pick a camera with 'back' or 'rear' in label, otherwise the first camera
          const preferred = cameras.find((c: any) => /back|rear|environment/i.test(c.label || '')) || cameras[0];
          cameraId = preferred.id || null;
        }
      } catch (e) {
        // ignore, will fallback to default
        console.warn('Unable to enumerate cameras, falling back to default.');
      }

      try {
        const html5Qr = new Html5Qrcode('qr-reader');

        // Responsive qrbox size
        const containerWidth = element.clientWidth || element.getBoundingClientRect().width || 300;
        const qrboxSize = Math.min(360, Math.max(200, Math.floor(containerWidth * 0.7)));

        const config = {
          fps: 15,
          qrbox: qrboxSize,
          experimentalFeatures: { useBarCodeDetectorIfSupported: false },
          verbose: false,
        } as any;

        const cameraArg = cameraId || { facingMode: { ideal: 'environment' } };

        await html5Qr.start(
          cameraArg,
          config,
          (decodedText) => {
            handleCameraScan(decodedText);
          },
          (errorMessage) => {
            // scanning errors are frequent; ignore or log if needed
          }
        );

        scannerRef.current = html5Qr;
        toast.success('Camera started successfully!');
      } catch (err) {
        console.error('Failed to start Html5Qrcode:', err);
        toast.error('Failed to start camera. Please refresh and try again.');
        setCameraActive(false);
      }
    } catch (error) {
      console.error('Failed to start camera:', error);
      toast.error('Failed to start camera. Please check camera permissions.');
      setCameraActive(false);
      scannerRef.current = null;
    }
  };

  const stopCamera = async () => {
    try {
      if (scannerRef.current) {
        try {
          // If using Html5Qrcode instance, stop the camera first then clear
          // @ts-ignore
          if (typeof scannerRef.current.stop === 'function') {
            try {
              // @ts-ignore
              const stopRes = scannerRef.current.stop();
              if (stopRes && typeof (stopRes as any).catch === 'function') {
                (stopRes as any).catch(() => {});
              }
            } catch (_) {}
          }
          // clear UI
          // @ts-ignore
          if (typeof scannerRef.current.clear === 'function') {
            try {
              // @ts-ignore
              const clearRes = scannerRef.current.clear();
              if (clearRes && typeof (clearRes as any).catch === 'function') {
                (clearRes as any).catch(() => {});
              }
            } catch (_) {}
          }
        } catch (e) {
          // fallback: attempt to stop any active video tracks
          try {
            const videos = document.querySelectorAll('video');
            videos.forEach((v: any) => {
              try { v.srcObject?.getTracks?.()?.forEach((t: any) => t.stop()); } catch (_) {}
            });
          } catch (_) {}
        }
        scannerRef.current = null;
      }
      setCameraActive(false);
      setResult(null); // Clear previous results
      lastScannedRef.current = '';
      toast.info('Camera stopped');
    } catch (error) {
      console.error('Error stopping camera:', error);
      scannerRef.current = null;
      setCameraActive(false);
    }
  };

  const toggleCamera = () => {
    if (cameraActive) {
      stopCamera();
    } else {
      setResult(null);
      lastScannedRef.current = '';
      startCamera();
    }
  };

  const processQRCode = async (qrCode: string) => {
    try {
      setScanning(true);
      setResult(null);
      
      // Parse QR code - it's a JSON string with {registrationId, qrHash}
      let qrHash = qrCode;
      try {
        const parsed = JSON.parse(qrCode);
        if (parsed.qrHash) {
          qrHash = parsed.qrHash;
        }
      } catch (e) {
        // If not JSON, use as is (backward compatibility)
        qrHash = qrCode;
      }
      
      const response = await api.post('/checkin/validate', { qrHash });
      setResult(response.data);
      toast.success('✅ Check-in successful!');
      
      // Play success sound (optional)
      if (typeof window !== 'undefined') {
        const audio = new Audio('/success-sound.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || 'Invalid QR code';
      toast.error(errorMsg);
      setResult({ success: false, message: errorMsg });
    } finally {
      setScanning(false);
    }
  };

  const handleScan = async () => {
    if (!qrHash.trim()) {
      toast.error('Please enter QR code');
      return;
    }
    await processQRCode(qrHash);
    setQrHash(''); // Clear input after scan
  };

  if (!isAuthenticated() || !['admin', 'coordinator', 'ambassador'].includes(user?.role || '')) {
    return null;
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="animate-spin h-12 w-12 text-purple-600 mx-auto mb-4" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
          <p className="text-gray-600">Loading Scanner...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
        <nav className="container mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
            <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600" />
            EventHub
          </Link>
          <div className="hidden lg:flex items-center gap-6">
            <Link href="/events" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Browse Events
            </Link>
            <Link href="/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
              Dashboard
            </Link>
            {user?.role === 'ambassador' && (
              <Link href="/ambassador/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Ambassador
              </Link>
            )}
            {user?.role === 'admin' && (
              <Link href="/admin/dashboard" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Admin Panel
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'coordinator') && (
              <Link href="/create-event" className="text-gray-700 hover:text-purple-600 font-medium transition-colors">
                Create Event
              </Link>
            )}
            {(user?.role === 'admin' || user?.role === 'coordinator' || user?.role === 'ambassador') && (
              <Link href="/admin/scanner" className="text-purple-600 font-semibold">
                Scanner
              </Link>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Logout
            </button>
          </div>
          <MobileMenu
            isAuthenticated={isAuthenticated()}
            userRole={user?.role}
            onLogout={handleLogout}
          />
        </nav>
      </header>

      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-6 transform hover:rotate-12 transition-transform">
              <QrCode className="w-10 h-10 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">QR Code Scanner</h1>
            <p className="text-gray-600">Scan attendee QR codes for event check-in</p>
          </div>

          {/* Scan Mode Toggle */}
          <div className="flex gap-4 mb-6">
            <button
              onClick={() => { 
                setScanMode('camera'); 
                setResult(null); 
                setQrHash('');
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                scanMode === 'camera'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <Camera className="w-5 h-5" />
              Camera Scanner
            </button>
            <button
              onClick={() => { 
                setScanMode('manual'); 
                setResult(null);
              }}
              className={`flex-1 py-3 px-4 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                scanMode === 'manual'
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-purple-300'
              }`}
            >
              <Scan className="w-5 h-5" />
              Manual Entry
            </button>
          </div>

          {/* Camera Scanner */}
          {scanMode === 'camera' && (
            <div className="bg-white rounded-2xl shadow-2xl p-6 mb-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-900">Live Camera Scanner</h3>
                <button
                  onClick={toggleCamera}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    cameraActive
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:shadow-lg text-white'
                  }`}
                >
                  {cameraActive ? (
                    <>
                      <CameraOff className="w-4 h-4" />
                      Stop Camera
                    </>
                  ) : (
                    <>
                      <Camera className="w-4 h-4" />
                      Start Camera
                    </>
                  )}
                </button>
              </div>

              {/* Camera environment checks */}
              {!isSecure && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800 font-semibold">Insecure context: Camera access requires HTTPS or localhost.</p>
                </div>
              )}
              {inIframe && (
                <div className="mb-4 p-3 bg-yellow-50 border-l-4 border-yellow-300 rounded">
                  <p className="text-sm text-yellow-800 font-semibold">Page is in an iframe — some browsers block camera access inside iframes. Open in a top-level tab.</p>
                </div>
              )}
              <div className="mb-4 flex items-center gap-3">
                <button
                  onClick={async () => {
                    setCameraCheckMsg(null);
                    try {
                      if (!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)) {
                        setCameraCheckMsg('getUserMedia not supported');
                        return;
                      }
                      const s = await navigator.mediaDevices.getUserMedia({ video: { facingMode: { ideal: 'environment' } } });
                      s.getTracks().forEach((t) => t.stop());
                      setCameraCheckMsg('Permission granted');
                    } catch (e: any) {
                      setCameraCheckMsg(e?.message || 'Permission denied');
                    }
                  }}
                  className="px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium"
                >
                  Check Camera Access
                </button>
                {cameraCheckMsg && <span className="text-sm text-gray-700">{cameraCheckMsg}</span>}
              </div>

              {/* Upload QR Image from device storage */}
              <div className="mb-4 flex items-center gap-3">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    try {
                      toast('Decoding image...');

                      // 1) Try Html5Qrcode.scanFile (if provided by the lib)
                      try {
                        // @ts-ignore
                        if (Html5Qrcode && typeof (Html5Qrcode as any).scanFile === 'function') {
                          // @ts-ignore
                          const decoded = await (Html5Qrcode as any).scanFile(f, true);
                          const decodedText = Array.isArray(decoded) ? decoded[0] : decoded;
                          if (decodedText) {
                            handleCameraScan(decodedText);
                            return;
                          }
                        }
                      } catch (err) {
                        console.warn('Html5Qrcode.scanFile failed:', err);
                      }

                      // 2) Draw image to canvas and try BarcodeDetector (modern browsers)
                      const url = URL.createObjectURL(f);
                      const img = new Image();
                      img.src = url;
                      await new Promise((res, rej) => { img.onload = res; img.onerror = rej; });
                      const canvas = document.createElement('canvas');
                      canvas.width = img.naturalWidth || img.width;
                      canvas.height = img.naturalHeight || img.height;
                      const ctx = canvas.getContext('2d');
                      if (!ctx) throw new Error('Canvas context unavailable');
                      ctx.drawImage(img, 0, 0);

                      // Try browser BarcodeDetector first
                      try {
                        // @ts-ignore
                        if (typeof (window as any).BarcodeDetector === 'function') {
                          // @ts-ignore
                          const detector = new (window as any).BarcodeDetector({ formats: ['qr_code'] });
                          // @ts-ignore
                          const results = await detector.detect(canvas);
                          if (results && results.length) {
                            const val = results[0].rawValue || results[0].raw_value || results[0].rawdata;
                            if (val) {
                              handleCameraScan(val.toString());
                              URL.revokeObjectURL(url);
                              return;
                            }
                          }
                        }
                      } catch (bdErr) {
                        console.warn('BarcodeDetector failed:', bdErr);
                      }

                      // 3) Fallback: try Html5Qrcode.decodeFromCanvas (if available in this version)
                      try {
                        // @ts-ignore
                        if (Html5Qrcode && typeof (Html5Qrcode as any).decodeFromCanvas === 'function') {
                          // @ts-ignore
                          const r = await (Html5Qrcode as any).decodeFromCanvas(canvas);
                          if (r) {
                            handleCameraScan(r);
                            URL.revokeObjectURL(url);
                            return;
                          }
                        }
                      } catch (e) {
                        console.warn('decodeFromCanvas failed', e);
                      }

                      URL.revokeObjectURL(url);
                      toast.error('Unable to decode QR from the selected image');
                    } catch (err: any) {
                      console.error('Error decoding file:', err);
                      toast.error('Failed to decode image');
                    } finally {
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-4 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm font-medium"
                >
                  Upload QR Image
                </button>
                <p className="text-sm text-gray-600">or scan using camera</p>
              </div>

              {cameraActive ? (
                <div className="relative">
                  <div id="qr-reader" style={{ width: '100%', minHeight: '400px' }}></div>
                  {scanning && (
                    <div className="absolute inset-0 bg-black/50 rounded-xl flex items-center justify-center z-50">
                      <div className="bg-white rounded-lg px-6 py-4 flex items-center gap-3">
                        <svg className="animate-spin h-6 w-6 text-purple-600" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="font-semibold text-gray-900">Processing...</span>
                      </div>
                    </div>
                  )}
                  <div className="mt-3 bg-blue-50 rounded-lg p-3 text-sm text-blue-800">
                    <p className="font-semibold mb-1">📱 Camera Tips:</p>
                    <ul className="space-y-1 text-xs">
                      <li>• Hold QR code steady within frame</li>
                      <li>• Ensure good lighting conditions</li>
                      <li>• Keep QR code 10-30cm from camera</li>
                      <li>• Auto-detection will scan instantly</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="aspect-video rounded-xl border-4 border-dashed border-gray-300 flex flex-col items-center justify-center bg-gray-50">
                  <Camera className="w-16 h-16 text-gray-400 mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">Camera Ready</p>
                  <p className="text-gray-500 text-sm">Click "Start Camera" to begin scanning</p>
                </div>
              )}
            </div>
          )}

          {/* Manual Scanner Input */}
          {scanMode === 'manual' && (
            <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Manual QR Entry</h3>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Enter QR Code Hash
                </label>
                <input
                  type="text"
                  value={qrHash}
                  onChange={(e) => setQrHash(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleScan()}
                  placeholder="Paste or type QR hash..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-purple-500 transition-colors font-mono text-sm"
                />
              </div>

              <button
                onClick={handleScan}
                disabled={scanning || !qrHash.trim()}
                className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-bold rounded-lg hover:shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center gap-2"
              >
                {scanning ? (
                  <>
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Validating...
                  </>
                ) : (
                  <>
                    <Scan className="w-5 h-5" />
                    Validate Check-in
                  </>
                )}
              </button>
            </div>
          )}

          {/* Result Display */}
          {result && (
            <div className={`bg-white rounded-2xl shadow-2xl p-8 mb-6 animate-in fade-in duration-300 ${result.success ? 'border-4 border-green-400' : 'border-4 border-red-400'}`}>
              <div className="text-center">
                {result.success ? (
                  <>
                    <div className="relative">
                      <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4 animate-bounce" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-24 h-24 bg-green-400 rounded-full animate-ping opacity-20"></div>
                      </div>
                    </div>
                    <h2 className="text-3xl font-bold text-green-600 mb-2">✅ Valid Check-in</h2>
                    {result.data && (
                      <div className="mt-6 space-y-4 text-left">
                        <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border-2 border-gray-200">
                          <div className="flex items-center gap-2 mb-2">
                            <User className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-700">Attendee Details</span>
                          </div>
                          <p className="text-gray-900 font-bold text-lg">{result.data.registration?.user?.name || result.data.user?.name}</p>
                          <p className="text-gray-600 text-sm">{result.data.registration?.user?.email || result.data.user?.email}</p>
                        </div>

                        <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200">
                          <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-5 h-5 text-purple-600" />
                            <span className="font-semibold text-gray-700">Event Details</span>
                          </div>
                          <p className="text-gray-900 font-bold text-lg">{result.data.registration?.event?.title || result.data.event?.title}</p>
                          <p className="text-purple-700 text-sm font-semibold">
                            Type: {(
                              result.data.registration?.registrationType || result.data.event?.eventType || result.data.event?.type || ''
                            ).toString().toUpperCase()}
                          </p>
                        </div>

                        {result.data.checkInTime && (
                          <div className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300">
                            <p className="text-green-700 font-bold flex items-center gap-2">
                              <CheckCircle className="w-5 h-5" />
                              Checked in: {new Date(result.data.checkInTime).toLocaleString()}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                    {scanMode === 'camera' && cameraActive && (
                      <button
                        onClick={() => setResult(null)}
                        className="mt-4 px-6 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all"
                      >
                        Scan Next
                      </button>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative">
                      <XCircle className="w-20 h-20 text-red-500 mx-auto mb-4 animate-pulse" />
                    </div>
                    <h2 className="text-3xl font-bold text-red-600 mb-2">❌ Invalid QR Code</h2>
                    <p className="text-gray-700 mt-4 font-semibold">{result.message}</p>
                    {scanMode === 'camera' && cameraActive && (
                      <button
                        onClick={() => setResult(null)}
                        className="mt-4 px-6 py-2 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-all"
                      >
                        Try Again
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Instructions */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
            <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5" />
              📝 Quick Guide
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">📷 Camera Mode:</h4>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Click "Start Camera" button</li>
                  <li>• Point camera at QR code</li>
                  <li>• Auto-scans when detected</li>
                  <li>• Instant validation feedback</li>
                </ul>
              </div>
              <div>
                <h4 className="font-semibold text-blue-800 mb-2">⌨️ Manual Mode:</h4>
                <ul className="space-y-1 text-blue-700 text-sm">
                  <li>• Enter/paste QR hash code</li>
                  <li>• Press Enter or click button</li>
                  <li>• Useful for pre-printed codes</li>
                  <li>• Works without camera access</li>
                </ul>
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-blue-200">
              <p className="text-blue-800 text-sm font-semibold">✓ Green = Successful | ✗ Red = Invalid/Used</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
