// function BookingSummary({ bookingData, currentService, isConfirmation }) {
//   // Format date (giống HTML version)
//   const formatDate = (dateString) => {
//     if (!dateString) return '-';
//     const date = new Date(dateString + 'T00:00:00');
//     return date.toLocaleDateString('vi-VN', {
//       weekday: 'long',
//       year: 'numeric',
//       month: 'long',
//       day: 'numeric'
//     });
//   };

//   return (
//     <div className={`booking-summary ${isConfirmation ? 'confirmation' : ''}`}>
//       <h3>Scheduling information</h3>

//       <div className="summary-section">
//         <div className="summary-item">
//           <span className="label">Customer:</span>
//           <span className="value">{bookingData.name || '-'}</span>
//         </div>

//         <div className="summary-item">
//           <span className="label">Phone:</span>
//           <span className="value">{bookingData.phone || '-'}</span>
//         </div>

//         {bookingData.email && (
//           <div className="summary-item">
//             <span className="label">Email:</span>
//             <span className="value">{bookingData.email}</span>
//           </div>
//         )}
//       </div>

//       <div className="summary-divider"></div>

//       <div className="summary-section">
//         <div className="summary-item">
//           <span className="label">Service:</span>
//           <span className="value highlight">{currentService?.name || '-'}</span>
//         </div>

//         <div className="summary-item">
//           <span className="label">Duration:</span>
//           <span className="value">{currentService?.duration || '-'} minutes</span>
//         </div>

//         <div className="summary-item">
//           <span className="label">date:</span>
//           <span className="value">{formatDate(bookingData.date)}</span>
//         </div>

//         <div className="summary-item">
//           <span className="label">Time:</span>
//           <span className="value">{bookingData.time || '-'}</span>
//         </div>

//         {bookingData.notes && (
//           <div className="summary-item notes">
//             <span className="label">Notes:</span>
//             <span className="value">{bookingData.notes}</span>
//           </div>
//         )}
//       </div>

//       <div className="summary-divider"></div>

//       <div className="summary-total">
//         <span className="label">Total amount:</span>
//         <span className="value">
//           {currentService ? currentService.price.toLocaleString('vi-VN') : '0'} VND
//         </span>
//       </div>
//     </div>
//   );
// }

// export default BookingSummary;

// components/booking/BookingSummary.js
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';

export default function BookingSummary({ bookingData, onEdit, onConfirm, isSubmitting }) {
  const { service, selectedDate, selectedTime, selectedStaff, customerInfo } = bookingData;

  if (!service || !selectedDate || !selectedTime) {
    return (
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
      </div>
    );
  }

  // Format date
  const formattedDate = format(new Date(selectedDate), 'EEEE, dd/MM/yyyy', { locale: vi });

  // Calculate end time
  const [hours, minutes] = selectedTime.split(':').map(Number);
  const startDate = new Date();
  startDate.setHours(hours, minutes, 0);
  const endDate = new Date(startDate.getTime() + service.duration * 60000);
  const endTime = `${endDate.getHours().toString().padStart(2, '0')}:${endDate.getMinutes().toString().padStart(2, '0')}`;

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-6 py-4">
        <h2 className="text-2xl font-bold">Xác nhận đặt lịch</h2>
        <p className="text-pink-100 text-sm mt-1">Vui lòng kiểm tra thông tin trước khi xác nhận</p>
      </div>

      <div className="p-6 space-y-6">
        {/* Service Info */}
        <div className="border-b pb-4">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-gray-500 uppercase tracking-wide">Dịch vụ</p>
              <h3 className="text-xl font-bold text-gray-900 mt-1">{service.name}</h3>
              <p className="text-gray-600 text-sm mt-1">{service.description}</p>
              <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  ⏱️ {service.duration} phút
                </span>
                <span className="flex items-center gap-1">
                  📂 {service.category}
                </span>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-pink-600">
                {service.price.toLocaleString('vi-VN')}₫
              </p>
            </div>
          </div>
        </div>

        {/* Date & Time */}
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Thời gian</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-2">
              <span className="text-2xl">📅</span>
              <div>
                <p className="font-semibold text-gray-900">{formattedDate}</p>
                <p className="text-sm text-gray-600">
                  {selectedTime} - {endTime} ({service.duration} phút)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Staff */}
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Nhân viên</p>
          {selectedStaff ? (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center text-xl">
                👤
              </div>
              <div>
                <p className="font-semibold text-gray-900">{selectedStaff.name}</p>
                <p className="text-sm text-gray-600">{selectedStaff.specialization}</p>
              </div>
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-4 text-center">
              <p className="text-gray-600">🎲 Nhân viên bất kỳ có sẵn</p>
            </div>
          )}
        </div>

        {/* Customer Info */}
        <div className="border-b pb-4">
          <p className="text-sm text-gray-500 uppercase tracking-wide mb-2">Thông tin liên hệ</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-gray-500">👤 Họ tên:</span>
              <span className="font-medium">{customerInfo.name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-500">📱 Số điện thoại:</span>
              <span className="font-medium">{customerInfo.phone}</span>
            </div>
            {customerInfo.notes && (
              <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                <p className="text-sm text-gray-500 mb-1">💬 Ghi chú:</p>
                <p className="text-gray-700">{customerInfo.notes}</p>
              </div>
            )}
          </div>
        </div>

        {/* Total */}
        <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-700">Tổng cộng</span>
            <span className="text-3xl font-bold text-pink-600">
              {service.price.toLocaleString('vi-VN')}₫
            </span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onEdit}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Chỉnh sửa
          </button>
          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-lg font-semibold hover:from-pink-600 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Đang xử lý...
              </span>
            ) : (
              '✓ Xác nhận đặt lịch'
            )}
          </button>
        </div>

        {/* Note */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p className="text-sm text-amber-800">
            ℹ️ <strong>Lưu ý:</strong> Sau khi xác nhận, chúng tôi sẽ liên hệ với bạn để xác nhận lịch hẹn trong vòng 30 phút.
          </p>
        </div>
      </div>
    </div>
  );
}