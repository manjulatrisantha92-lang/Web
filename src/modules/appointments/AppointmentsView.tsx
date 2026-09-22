import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Appointment } from '../../types';
import {
  Calendar,
  Clock,
  User,
  Scissors,
  Plus,
  MessageCircle,
  CheckCircle,
  AlertCircle,
  Search,
  Sparkles,
  DollarSign,
  Phone
} from 'lucide-react';

export const AppointmentsView: React.FC = () => {
  const {
    currentTenant,
    appointments,
    addAppointment,
    updateAppointmentStatus,
    openWhatsAppDialog,
  } = useApp();

  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [showBookModal, setShowBookModal] = useState(false);

  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('+94 77 ');
  const [service, setService] = useState('Bridal Dressing & Makeup');
  const [staff, setStaff] = useState('Natasha Silva');
  const [date, setDate] = useState('2026-09-22');
  const [startTime, setStartTime] = useState('14:00');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [price, setPrice] = useState(15000);
  const [advancePayment, setAdvancePayment] = useState(5000);

  const staffList = ['Natasha Silva', 'Dinesh Perera', 'Kaveen Fernando'];

  const filteredAppointments = appointments.filter((a) => {
    const matchStaff = selectedStaff === 'all' || a.staff === selectedStaff;
    const matchStatus = selectedStatus === 'all' || a.status === selectedStatus;
    return matchStaff && matchStatus;
  });

  const handleBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const newAppt = addAppointment({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      staff,
      service,
      date,
      startTime,
      durationMinutes: Number(durationMinutes) || 45,
      price: Number(price) || 0,
      advancePayment: Number(advancePayment) || 0,
      status: 'confirmed',
      whatsappReminderSent: false,
    });

    setShowBookModal(false);

    // Prompt to send booking WhatsApp confirmation
    const msg = `Hi ${customerName}, your appointment for *${service}* with *${staff}* at ${currentTenant.name} is confirmed for ${date} at ${startTime}. Advance paid: ${currentTenant.currencySymbol}${advancePayment}. See you soon!`;
    openWhatsAppDialog(customerPhone, customerName, msg, 'Send Salon Booking WhatsApp Confirmation');
  };

  const getStatusClass = (status: Appointment['status']) => {
    switch (status) {
      case 'booked':
        return 'bg-stone-100 text-stone-800 border-stone-200';
      case 'confirmed':
        return 'bg-sky-100 text-sky-800 border-sky-200';
      case 'in_progress':
        return 'bg-amber-100 text-amber-800 border-amber-200 animate-pulse';
      case 'completed':
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'cancelled':
        return 'bg-rose-100 text-rose-800 border-rose-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-bold text-stone-900">Salon Appointments & Calendar</h1>
            <span className="text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full font-semibold">
              Industry Module
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-0.5">
            Manage stylist schedules, bridal & hair appointments, and WhatsApp automated reminders for <strong>{currentTenant.name}</strong>.
          </p>
        </div>

        <button
          onClick={() => setShowBookModal(true)}
          className="flex items-center space-x-1.5 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-bold shadow-xs transition-transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Book Appointment</span>
        </button>
      </div>

      {/* Filter Chips Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Stylist:</span>
          <button
            onClick={() => setSelectedStaff('all')}
            className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
              selectedStaff === 'all' ? 'bg-purple-600 text-white font-bold' : 'bg-stone-100 text-stone-700'
            }`}
          >
            All Stylists
          </button>
          {staffList.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStaff(s)}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors ${
                selectedStaff === s ? 'bg-purple-600 text-white font-bold' : 'bg-stone-100 text-stone-700'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <span className="font-bold text-stone-500 uppercase tracking-wider text-[10px]">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 text-stone-700 font-medium"
          >
            <option value="all">All Statuses</option>
            <option value="confirmed">Confirmed</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="booked">Booked</option>
          </select>
        </div>
      </div>

      {/* Appointments List / Table */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
        <div className="divide-y divide-stone-100 text-xs">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center text-stone-400">
              No appointments scheduled matching the selected filters.
            </div>
          ) : (
            filteredAppointments.map((appt) => {
              const advance = appt.advancePayment || 0;
              const balance = appt.price - advance;
              return (
                <div
                  key={appt.id}
                  className="p-4 hover:bg-stone-50/70 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="flex items-start space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0">
                      <Scissors className="w-5 h-5" />
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-stone-900 text-sm">{appt.customerName}</span>
                        <span className={`px-2 py-0.2 rounded-full font-bold uppercase text-[10px] border ${getStatusClass(appt.status)}`}>
                          {appt.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div className="text-[11px] text-stone-500">
                        Service: <strong className="text-stone-800">{appt.service}</strong> with <span className="font-medium text-purple-700">{appt.staff}</span>
                      </div>
                      <div className="flex items-center space-x-3 text-[11px] text-stone-400">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          <span>{appt.date}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3 text-stone-400" />
                          <span>{appt.startTime} ({appt.durationMinutes} mins)</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Phone className="w-3 h-3 text-stone-400" />
                          <span>{appt.customerPhone}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center justify-between md:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="font-mono font-bold text-stone-900 text-sm">
                        {currentTenant.currencySymbol}{appt.price.toLocaleString()}
                      </div>
                      <div className="text-[10px] text-stone-400">
                        Paid: {currentTenant.currencySymbol}{advance.toLocaleString()} • Bal: <span className="text-rose-600 font-bold">{currentTenant.currencySymbol}{balance.toLocaleString()}</span>
                      </div>
                    </div>

                    {/* WhatsApp Action Buttons */}
                    <div className="flex items-center space-x-1.5">
                      <button
                        onClick={() => {
                          const msg = `Reminder: Hi ${appt.customerName}, your appointment for *${appt.service}* with *${appt.staff}* at ${currentTenant.name} is in 2 hours (${appt.startTime}). See you soon!`;
                          openWhatsAppDialog(appt.customerPhone, appt.customerName, msg, `2-Hour WhatsApp Reminder for ${appt.customerName}`);
                        }}
                        className="px-2.5 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded-lg text-xs font-semibold flex items-center space-x-1"
                        title="Send 2-Hour Reminder"
                      >
                        <MessageCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Reminder</span>
                      </button>

                      <button
                        onClick={() => {
                          const msg = `Thank you for visiting ${currentTenant.name}, ${appt.customerName}! We hope you loved your ${appt.service}. Please leave us a review or book your next session: https://${currentTenant.businessCode.toLowerCase()}.wcs.lk/reviews`;
                          openWhatsAppDialog(appt.customerPhone, appt.customerName, msg, `Thank You & Review Request for ${appt.customerName}`);
                        }}
                        className="px-2.5 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 rounded-lg text-xs font-medium"
                        title="Send Post-Visit Review Request"
                      >
                        Review Req
                      </button>
                    </div>

                    {/* Status Toggle */}
                    <select
                      value={appt.status}
                      onChange={(e) => updateAppointmentStatus(appt.id, e.target.value as any)}
                      className="bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 font-semibold text-xs"
                    >
                      <option value="booked">Booked</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Book Appointment Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full border border-stone-200 shadow-xl space-y-4 text-xs">
            <div className="flex items-center justify-between border-b pb-2">
              <h3 className="font-bold text-stone-900 text-sm flex items-center space-x-2">
                <Scissors className="w-4 h-4 text-purple-600" />
                <span>New Salon Appointment</span>
              </h3>
            </div>

            <form onSubmit={handleBookSubmit} className="space-y-3">
              <div>
                <label className="font-semibold text-stone-700 block mb-1">Customer Name *</label>
                <input
                  type="text"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. Michelle Perera"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div>
                <label className="font-semibold text-stone-700 block mb-1">WhatsApp Phone *</label>
                <input
                  type="text"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Stylist / Staff</label>
                  <select
                    value={staff}
                    onChange={(e) => setStaff(e.target.value)}
                    className="w-full px-2 py-2 border border-stone-300 rounded-lg"
                  >
                    {staffList.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Service Type</label>
                  <input
                    type="text"
                    value={service}
                    onChange={(e) => setService(e.target.value)}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Date</label>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-2 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Time</label>
                  <input
                    type="time"
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full px-2 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Duration (Min)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(Number(e.target.value))}
                    className="w-full px-2 py-2 border border-stone-300 rounded-lg"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Total Fee ({currentTenant.currency})</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="font-semibold text-stone-700 block mb-1">Advance Received</label>
                  <input
                    type="number"
                    value={advancePayment}
                    onChange={(e) => setAdvancePayment(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-4 py-2 border border-stone-200 rounded-lg text-stone-600"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold"
                >
                  Confirm & Send WhatsApp
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
