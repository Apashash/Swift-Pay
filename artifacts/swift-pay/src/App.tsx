import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ThemeProvider } from '@/lib/theme';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { SupportButton } from '@/components/layout/SupportButton';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import VerifyTransaction from '@/pages/VerifyTransaction';
import Login from '@/pages/Login';
import Register from '@/pages/Register';
import Dashboard from '@/pages/Dashboard';
import SendPayment from '@/pages/SendPayment';
import Transactions from '@/pages/Transactions';
import TransactionDetail from '@/pages/TransactionDetail';
import Profile from '@/pages/Profile';
import { Notifications, NotificationDetail } from '@/pages/Notifications';
import PaymentLink from '@/pages/PaymentLink';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { LanguageProvider } from '@/lib/i18n';
import { AuthProvider, useAuth } from '@/lib/auth';

const queryClient = new QueryClient();

function ProtectedRoute({ component: Component }: { component: React.ComponentType }) {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  if (!isAuthenticated) {
    navigate('/connexion');
    return null;
  }
  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/verifier" component={VerifyTransaction} />
      <Route path="/connexion" component={Login} />
      <Route path="/inscription" component={Register} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} />}
      </Route>
      <Route path="/envoyer">
        {() => <ProtectedRoute component={SendPayment} />}
      </Route>
      <Route path="/transactions">
        {() => <ProtectedRoute component={Transactions} />}
      </Route>
      <Route path="/transactions/:id">
        {() => <ProtectedRoute component={TransactionDetail} />}
      </Route>
      <Route path="/profil">
        {() => <ProtectedRoute component={Profile} />}
      </Route>
      <Route path="/notifications">
        {() => <ProtectedRoute component={Notifications} />}
      </Route>
      <Route path="/notifications/:id">
        {() => <ProtectedRoute component={NotificationDetail} />}
      </Route>
      <Route path="/lien-paiement">
        {() => <ProtectedRoute component={PaymentLink} />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function AppInner() {
  const { isAuthenticated } = useAuth();
  return (
    <>
      <Router />
      {/* Only show the floating support button on public pages */}
      {!isAuthenticated && <SupportButton />}
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <QueryClientProvider client={queryClient}>
            <TooltipProvider>
              <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
                <AppInner />
              </WouterRouter>
              <Toaster />
            </TooltipProvider>
          </QueryClientProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
