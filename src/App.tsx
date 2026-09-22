import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardView } from './modules/dashboard/DashboardView';
import { PosView } from './modules/pos/PosView';
import { ProductsView } from './modules/products/ProductsView';
import { OnlineOrdersView } from './modules/onlineOrders/OnlineOrdersView';
import { AppointmentsView } from './modules/appointments/AppointmentsView';
import { FacebookMarketingView } from './modules/marketing/FacebookMarketingView';
import { ReportBuilderView } from './modules/reports/ReportBuilderView';
import { CustomFieldsView } from './modules/customFields/CustomFieldsView';
import { CompanyProfileView } from './modules/settings/CompanyProfileView';
import { UsersRolesView } from './modules/users/UsersRolesView';
import { SuperAdminView } from './modules/superAdmin/SuperAdminView';
import { InvoiceModal } from './modules/invoices/InvoiceModal';
import { WhatsAppModal } from './modules/whatsapp/WhatsAppModal';
import { SuperAdminLoginModal } from './modules/superAdmin/SuperAdminLoginModal';

const MainContent: React.FC = () => {
  const {
    activeView,
    activeInvoiceSale,
    closeInvoiceModal,
    showAdminLoginModal,
    setShowAdminLoginModal
  } = useApp();

  return (
    <div className="min-h-screen bg-stone-100 flex flex-col font-sans antialiased text-stone-900 selection:bg-amber-500 selection:text-white">
      {/* Top Header */}
      <Header />

      {/* Body: Sidebar + Main Stage */}
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />

        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8">
          <div className="max-w-7xl mx-auto">
            {activeView === 'dashboard' && <DashboardView />}
            {activeView === 'pos' && <PosView />}
            {activeView === 'products' && <ProductsView />}
            {activeView === 'online_orders' && <OnlineOrdersView />}
            {activeView === 'appointments' && <AppointmentsView />}
            {activeView === 'marketing_facebook' && <FacebookMarketingView />}
            {activeView === 'report_builder' && <ReportBuilderView />}
            {activeView === 'custom_fields' && <CustomFieldsView />}
            {activeView === 'company_profile' && <CompanyProfileView />}
            {activeView === 'users_roles' && <UsersRolesView />}
            {activeView === 'super_admin' && <SuperAdminView />}
          </div>
        </main>
      </div>

      {/* Global Invoicing and WhatsApp Delivery Modals */}
      <InvoiceModal sale={activeInvoiceSale} onClose={closeInvoiceModal} />
      <WhatsAppModal />
      <SuperAdminLoginModal
        isOpen={showAdminLoginModal}
        onClose={() => setShowAdminLoginModal(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
