'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Smartphone, RefreshCw, CheckCircle, XCircle, Loader2, QrCode, Unplug, Phone } from 'lucide-react';

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
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
          <span className="ml-3 text-gray-600">Loading WhatsApp status...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
            <Smartphone className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-gray-900">WhatsApp Connection</h2>
            <p className="text-sm text-gray-500">Connect your WhatsApp to send birthday messages</p>
          </div>
        </div>
        {renderStatusBadge()}
      </div>

      {/* Content */}
      <div className="p-6">
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        )}

        {/* Connected State */}
        {status === 'connected' && (
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-green-50 rounded-lg">
              <CheckCircle className="w-8 h-8 text-green-600" />
              <div>
                <p className="font-medium text-green-900">WhatsApp Connected!</p>
                {phoneNumber && (
                  <p className="text-sm text-green-700">Phone: {phoneNumber}</p>
                )}
                {sessionName && (
                  <p className="text-sm text-green-700">Session: {sessionName}</p>
                )}
              </div>
            </div>

            <p className="text-sm text-gray-600">
              Your WhatsApp is connected and ready to send birthday messages automatically.
            </p>

            <button
              onClick={handleDisconnect}
              disabled={isDisconnecting}
              className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-700 rounded-lg hover:bg-red-100 transition disabled:opacity-50"
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
            <div className="flex flex-col items-center py-8">
              <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 text-blue-500 animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading QR Code...</p>
                  {qrRetryRef.current > 0 && (
                    <p className="text-sm text-gray-500 mt-2">Attempt {qrRetryRef.current + 1}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* QR Code Not Available State */}
        {(status === 'need_scan' || status === 'connecting') && !qrCode && !isFetchingQR && (
          <div className="space-y-4">
            <div className="flex flex-col items-center py-8">
              <div className="w-64 h-64 bg-gray-100 rounded-xl flex items-center justify-center">
                <div className="text-center">
                  <QrCode className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">QR Code not available</p>
                  <button
                    onClick={() => fetchQRCode()}
                    className="mt-4 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition mx-auto"
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
            <div className="flex flex-col items-center">
              <div className="p-4 bg-white border-2 border-gray-200 rounded-xl">
                <img
                  src={qrCode}
                  alt="WhatsApp QR Code"
                  className="w-64 h-64"
                  onError={(e) => {
                    console.error('QR image failed to load:', qrCode?.substring(0, 100));
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <p className="mt-4 text-center text-gray-600">
                Open WhatsApp on your phone → Settings → Linked Devices → Link a Device
              </p>
              <button
                onClick={handleRefreshQR}
                disabled={isFetchingQR}
                className="mt-3 flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 rounded-lg transition disabled:opacity-50"
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
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Phone className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Enter Your WhatsApp Number</h3>
              <p className="text-gray-600 mb-6">
                We need your phone number to set up the WhatsApp connection.
              </p>
            </div>

            <form onSubmit={handlePhoneSubmit} className="max-w-md mx-auto space-y-4">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  WhatsApp Phone Number
                </label>
                <input
                  type="tel"
                  id="phone"
                  value={phoneInput}
                  onChange={(e) => setPhoneInput(e.target.value)}
                  placeholder="+91 98765 43210"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 text-lg"
                />
                <p className="mt-1 text-xs text-gray-500">
                  Include country code (e.g., +91 for India, +1 for USA)
                </p>
              </div>

              <button
                type="submit"
                disabled={isConnecting || !phoneInput.trim()}
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Continue
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setStatus('disconnected')}
                className="w-full text-gray-500 hover:text-gray-700 text-sm"
              >
                Cancel
              </button>
            </form>
          </div>
        )}

        {/* Disconnected / Not Configured State */}
        {(status === 'disconnected' || status === 'not_configured' || status === 'logged_out' || status === 'expired') && !qrCode && (
          <div className="space-y-4">
            <div className="text-center py-6">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Smartphone className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">WhatsApp Not Connected</h3>
              <p className="text-gray-600 mb-6">
                Connect your WhatsApp to enable automatic birthday message sending.
              </p>
              <button
                onClick={() => handleConnect()}
                disabled={isConnecting}
                className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 font-medium"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Smartphone className="w-5 h-5" />
                    Connect WhatsApp
                  </>
                )}
              </button>
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">How it works:</h4>
              <ol className="text-sm text-gray-600 space-y-1 list-decimal list-inside">
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
          <div className="flex flex-col items-center py-8">
            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
            <p className="text-gray-600">Preparing connection...</p>
            <p className="text-sm text-gray-500 mt-2">Please wait while we generate the QR code</p>
          </div>
        )}
      </div>
    </div>
  );
}
