import { WhatsAppConnect } from '@/components/dashboard/WhatsAppConnect';

export default function ConnectPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-5.5">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
            Connect WhatsApp
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Link your WhatsApp account to enable automatic birthday messaging
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="px-4 sm:px-6 md:px-8 py-4 sm:py-6 md:py-8">
        <div className="max-w-2xl">
          <WhatsAppConnect />
        </div>

        {/* Additional Info */}
        <div className="max-w-2xl mt-6 space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Frequently Asked Questions</h3>
            <div className="space-y-4 text-sm">
              <div>
                <p className="font-medium text-gray-800">Is my WhatsApp data secure?</p>
                <p className="text-gray-600 mt-1">
                  Yes! We use WaSenderAPI, a secure third-party service. Your messages are sent directly from your WhatsApp account, and we never store your personal conversations.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800">What happens if I disconnect?</p>
                <p className="text-gray-600 mt-1">
                  If you disconnect, automatic birthday messages will stop being sent. You can reconnect anytime by scanning a new QR code.
                </p>
              </div>
              <div>
                <p className="font-medium text-gray-800">When are birthday messages sent?</p>
                <p className="text-gray-600 mt-1">
                  Birthday messages are automatically sent at 12:05 AM on the recipient&apos;s birthday. Make sure your WhatsApp stays connected!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
