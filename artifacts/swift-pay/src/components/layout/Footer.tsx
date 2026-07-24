import { Link } from 'wouter';
import swiftPayLogo from "@assets/swift-logo.png";
import { useTranslation } from '@/lib/i18n';

export function Footer() {
  const { t } = useTranslation();

  return (
    <footer className="border-t border-border/50 bg-background py-16 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8">

          <div className="md:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-1.5">
              <img src={swiftPayLogo} alt="SwiftPay Logo" className="w-8 h-8 object-contain" />
              <span className="text-xl font-bold tracking-tight text-foreground">
                Swift<span className="text-primary">Pay</span>
              </span>
            </Link>
            <p className="text-muted-foreground text-sm max-w-[250px]">
              {t('footer_desc')}
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer_product')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><a href="#how-it-works" className="hover:text-primary transition-colors">{t('footer_hiw')}</a></li>
              <li><a href="#networks" className="hover:text-primary transition-colors">{t('footer_networks')}</a></li>
              <li><a href="#business" className="hover:text-primary transition-colors">{t('footer_api')}</a></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_pricing')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer_company')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_about')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_careers')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_blog')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_contact')}</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">{t('footer_legal')}</h4>
            <ul className="space-y-3 text-sm text-muted-foreground">
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_terms')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_privacy')}</Link></li>
              <li><Link href="/" className="hover:text-primary transition-colors">{t('footer_compliance')}</Link></li>
            </ul>
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-border/50 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-muted-foreground text-sm">
            {t('footer_rights')}
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            {t('footer_status')}
          </div>
        </div>
      </div>
    </footer>
  );
}
