'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, RefreshCw, CheckCircle, XCircle, Loader2, QrCode, Unplug, Phone } from 'lucide-react';

// WhatsApp Icon Component
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  );
}

type ConnectionStatus = 
  | 'not_configured'
  | 'connecting'
  | 'connected'
  | 'disconnected'
  | 'need_scan'
  | 'logged_out'
  | 'expired'
  | 'needs_phone';

interface StatusData {
  status: ConnectionStatus;
  phoneNumber?: string;
  sessionName?: string;
  message?: string;
}

export function WhatsAppConnect() {
  const [status, setStatus] = useState<ConnectionStatus>('disconnected');
  const [phoneNumber, setPhoneNumber] = useState<string | null>(null);
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [sessionName, setSessionName] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isFetchingQR, setIsFetchingQR] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const qrRetryRef = useRef<number>(0);

  // Fetch current status
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch('/api/wasender/status');
      const data: StatusData = await response.json();

      if (response.ok && data.status) {
        setStatus(data.status);
        setPhoneNumber(data.phoneNumber || null);
        setSessionName(data.sessionName || null);
        setError(null);

        // If connected, stop polling
        if (data.status === 'connected') {
          if (pollingRef.current) {
            clearInterval(pollingRef.current);
            pollingRef.current = null;
          }
          setQrCode(null);
        }
      }
    } catch {
      console.error('Error fetching status');
    }
  }, []);

  // Fetch QR code with retry logic
  const fetchQRCode = useCallback(async (retryCount = 0): Promise<boolean> => {
    setIsFetchingQR(true);
    try {
      const response = await fetch('/api/wasender/qrcode');
      const data = await response.json();

      console.log('QR code response:', data);

      if (response.ok && data.qrCode) {
        setQrCode(data.qrCode);
        setStatus(data.status || 'need_scan');
        setIsFetchingQR(false);
        qrRetryRef.current = 0;
        return true;
      } else if (data.error) {
        console.log('QR error:', data.error);
        // Retry up to 5 times with increasing delay
        if (retryCount < 5 && data.retryable !== false) {
          qrRetryRef.current = retryCount + 1;
          const delay = (retryCount + 1) * 2000; // 2s, 4s, 6s, 8s, 10s
          console.log(`Retrying QR fetch in ${delay}ms (attempt ${retryCount + 2})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          return fetchQRCode(retryCount + 1);
        }
        // QR might not be available if already connected
        if (data.needsReconnect) {
          await fetchStatus();
        }
      }
      setIsFetchingQR(false);
      return false;
    } catch (err) {
      console.error('Error fetching QR code:', err);
      setIsFetchingQR(false);
      return false;
    }
  }, [fetchStatus]);

  // Initial load
  useEffect(() => {
    const init = async () => {
      setIsLoading(true);
      await fetchStatus();
      setIsLoading(false);
    };
    init();
  }, [fetchStatus]);

  // Start polling when in need_scan or connecting status
  useEffect(() => {
    if (status === 'need_scan' || status === 'connecting') {
      // Poll status every 5 seconds
      pollingRef.current = setInterval(() => {
        fetchStatus();
      }, 5000);

      return () => {
        if (pollingRef.current) {
          clearInterval(pollingRef.current);
          pollingRef.current = null;
        }
      };
    }
  }, [status, fetchStatus]);

  // Handle connect button (with optional phone number)
  const handleConnect = async (withPhoneNumber?: string) => {
    setIsConnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/wasender/connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: withPhoneNumber }),
      });
      const data = await response.json();

      if (response.ok && data.success) {
        if (data.alreadyConnected) {
          // Session is already connected
          setStatus('connected');
          setIsConnecting(false);
          await fetchStatus();
        } else {
          setStatus('connecting');
          // Wait a moment then fetch QR code
          setTimeout(async () => {
            await fetchQRCode();
            setIsConnecting(false);
          }, 2000);
        }
      } else {
        // Check if phone number is needed
        if (data.needsPhoneNumber) {
          setStatus('needs_phone');
          setError(null);
        } else {
          setError(data.error || 'Failed to initiate connection');
        }
        setIsConnecting(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setIsConnecting(false);
    }
  };

  // Handle phone number submission
  const handlePhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneInput.trim()) {
      setError('Please enter your WhatsApp phone number');
      return;
    }
    handleConnect(phoneInput.trim());
  };

  // Handle disconnect button
  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    setError(null);

    try {
      const response = await fetch('/api/wasender/disconnect', {
        method: 'POST',
      });
      const data = await response.json();

      if (response.ok && data.success) {
        setStatus('disconnected');
        setPhoneNumber(null);
        setQrCode(null);
      } else {
        setError(data.error || 'Failed to disconnect');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsDisconnecting(false);
    }
  };

  // Handle refresh QR code
  const handleRefreshQR = async () => {
    setError(null);
    await fetchQRCode();
  };

  // Render status badge
  const renderStatusBadge = () => {
    const statusConfig: Record<ConnectionStatus, { color: string; text: string; icon: typeof CheckCircle }> = {
      connected: { color: 'bg-green-100 text-green-800', text: 'Connected', icon: CheckCircle },
      connecting: { color: 'bg-yellow-100 text-yellow-800', text: 'Connecting...', icon: Loader2 },
      need_scan: { color: 'bg-blue-100 text-blue-800', text: 'Scan QR Code', icon: QrCode },
      disconnected: { color: 'bg-gray-100 text-gray-800', text: 'Disconnected', icon: XCircle },
      logged_out: { color: 'bg-red-100 text-red-800', text: 'Logged Out', icon: XCircle },
      expired: { color: 'bg-red-100 text-red-800', text: 'Session Expired', icon: XCircle },
      not_configured: { color: 'bg-gray-100 text-gray-800', text: 'Not Configured', icon: XCircle },
      needs_phone: { color: 'bg-blue-100 text-blue-800', text: 'Enter Phone', icon: Phone },
    };

    const config = statusConfig[status] || statusConfig.disconnected;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
        <Icon className={`w-4 h-4 ${status === 'connecting' ? 'animate-spin' : ''}`} />
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-sm sm:text-base text-gray-600">Loading WhatsApp status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center shrink-0">
            <WhatsAppIcon className="w-5 h-5 text-green-600" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-semibold text-gray-900 truncate">WhatsApp Connection</h2>
            <p className="text-xs sm:text-sm text-gray-500 truncate">Connect your WhatsApp to send birthday messages</p>
          </div>
        </div>
        <div className="shrink-0">{renderStatusBadge()}</div>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Connected State */}
        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-green-50 rounded-lg overflow-hidden">
              <CheckCircle className="w-8 h-8 text-green-600 shrink-0" />
              <div className="min-w-0">
                <p className="font-medium text-green-900 truncate">WhatsApp Connected!</p>
                {phoneNumber && (
                  <p className="text-sm text-green-700 truncate">Phone: {phoneNumber}</p>
                )}
                {sessionName && (
                  <p className="text-sm text-green-700 truncate">Session: {sessionName}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Your WhatsApp is connected and ready to send birthday messages automatically.
            </p>

            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
            >
              {isDisconnecting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Unplug className="w-4 h-4" />
              )}
              {isDisconnecting ? 'Disconnecting...' : 'Disconnect WhatsApp'}
            </button>
          </div>
        )}

        {/* QR Code Loading State */}
        {(status === 'need_scan' || status === 'connecting') && !qrCode && isFetchingQR && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6 sm:py-8">
              <div className="w-full max-w-[16rem] aspect-square bg-gray-100 rounded-xl flex items-center justify-center p-4">
                <div className="text-center">
                  <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 text-blue-500 animate-spin mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">Loading QR Code...</p>
                  {qrRetryRef.current > 0 && (
                    <p className="text-xs sm:text-sm text-gray-500 mt-2">Attempt {qrRetryRef.current + 1}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Not Available State */}
        {(status === 'need_scan' || status === 'connecting') && !qrCode && !isFetchingQR && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-6 sm:py-8">
              <div className="w-full max-w-[16rem] aspect-square bg-gray-100 rounded-xl flex items-center justify-center p-4">
                <div className="text-center">
                  <QrCode className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 mx-auto mb-3 sm:mb-4" />
                  <p className="text-sm sm:text-base text-gray-600">QR Code not available</p>
                  <button
                    onClick={() => fetchQRCode()}
                    className="mt-3 sm:mt-4 flex items-center gap-2 px-4 py-2 text-sm sm:text-base text-blue-600 hover:bg-blue-50 rounded-lg transition mx-auto"
                  >
                    <RefreshCw className="w-4 h-4" />
                    Try Again
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code State */}
        {(status === 'need_scan' || status === 'connecting') && qrCode && (
          <div className="space-y-4">
            <div className="flex flex-col items-center px-4 sm:px-0">
              <div className="p-3 sm:p-4 bg-white border-2 border-gray-200 rounded-xl w-full max-w-[18rem]">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-full h-auto aspect-square"
                  onError={(e) => {
                    console.error('QR image failed to load:', qrCode?.substring(0, 100));
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="mt-4 text-center text-sm sm:text-base text-gray-600 max-w-sm">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
              <button
                onClick={handleRefreshQR}
                disabled={isFetchingQR}
                className="w-full sm:w-auto mt-4 sm:mt-3 flex items-center justify-center gap-2 px-4 py-2.5 sm:py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
              >
                {isFetchingQR ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
                {isFetchingQR ? 'Refreshing...' : 'Refresh QR Code'}
              </button>
            </div>

            <div className="p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Note:</strong> The QR code will expire after a few minutes. If it expires, click refresh to get a new one.
              </p>
            </div>
          </div>
        )}

        {/* Phone Number Input State */}
        {status === 'needs_phone' && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <Phone className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">Enter Your WhatsApp Number</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
                We need your phone number to set up the WhatsApp connection.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="max-w-md mx-auto space-y-4 w-full">
              <div>
                <label htmlFor="phone" className="block text-xs sm:text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-3 py-2.5 sm:px-4 sm:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-base sm:text-lg"
                />
                <p className="mt-1.5 text-xs text-gray-500">
                  Include country code (e.g., +91 for India, +1 for USA)
                </p>
              </div>

              <button
                type="submit"
                disabled={isConnecting || !phoneInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 sm:px-6 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Continue
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStatus('disconnected')}
                className="w-full text-gray-500 hover:text-gray-700 text-xs sm:text-sm py-2"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Disconnected / Not Configured State */}
        {(status === 'disconnected' || status === 'not_configured' || status === 'logged_out' || status === 'expired') && !qrCode && (
          <div className="space-y-4 sm:space-y-6">
            <div className="text-center py-4 sm:py-6">
              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <WhatsAppIcon className="w-7 h-7 sm:w-8 sm:h-8 text-gray-400" />
              </div>
              <h3 className="text-base sm:text-lg font-medium text-gray-900 mb-1 sm:mb-2">WhatsApp Not Connected</h3>
              <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 max-w-sm mx-auto">
                Connect your WhatsApp to enable automatic birthday message sending.
              </p>
              <button
                onClick={() => handleConnect()}
                disabled={isConnecting}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 sm:py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium text-sm sm:text-base"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <WhatsAppIcon className="w-4 h-4 sm:w-5 sm:h-5" />
                    Connect WhatsApp
                  </>
                )}
              </button>
            </div>

            <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm sm:text-base font-medium text-gray-900 mb-2">How it works:</h4>
              <ol className="text-xs sm:text-sm text-gray-600 space-y-1.5 sm:space-y-1 list-decimal list-inside pl-1">
                <li>Click &quot;Connect WhatsApp&quot; and enter your phone number</li>
                <li>Scan the QR code with WhatsApp on your phone</li>
                <li>Go to Settings → Linked Devices → Link a Device</li>
                <li>Your WhatsApp is now connected!</li>
              </ol>
            </div>
          </div>
        )}

        {/* Connecting without QR yet */}
        {status === 'connecting' && !qrCode && (
          <div className="flex flex-col items-center py-6 sm:py-8">
            <Loader2 className="w-10 h-10 sm:w-12 sm:h-12 animate-spin text-blue-600 mb-3 sm:mb-4" />
            <p className="text-sm sm:text-base text-gray-600 font-medium">Preparing connection...</p>
            <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 text-center">Please wait while we generate the QR code</p>
          </div>
        )}
      </div>
    </div>
  );
}
