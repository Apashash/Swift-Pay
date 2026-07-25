import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { PaymentForm } from '@/components/home/PaymentForm';

export default function SendPayment() {
  return (
    <DashboardLayout>
      <div className="p-4 lg:p-8 max-w-xl mx-auto">
        <PaymentForm />
      </div>
    </DashboardLayout>
  );
}
