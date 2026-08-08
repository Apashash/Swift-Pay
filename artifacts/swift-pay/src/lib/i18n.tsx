import { createContext, useContext, useState } from 'react';

export type Lang = 'fr' | 'en';

export const translations = {
  fr: {
    // Navbar
    nav_howItWorks: 'Comment ça marche',
    nav_networks: 'Réseaux supportés',
    nav_business: 'Pour les entreprises',
    nav_signIn: 'Connexion',
    nav_getStarted: 'Commencer',
    nav_menu_login: 'Connexion',
    nav_menu_login_desc: 'Accéder à votre compte',
    nav_menu_register: 'Inscription',
    nav_menu_register_desc: 'Créer un nouveau compte',
    nav_menu_transactions: 'Transactions',
    nav_menu_transactions_desc: 'Voir votre historique',
    nav_menu_business: 'Pour les entreprises',
    nav_menu_business_desc: 'Accès API & entreprise',
    nav_menu_support: 'Support',
    nav_menu_support_desc: "Obtenir l'aide de notre équipe",
    nav_tagline: 'Paiements. Simplifiés.',

    // Hero
    hero_line1: 'Payez en crypto.',
    hero_line2: 'Recevez en FCFA.',
    hero_desc: "Envoyez de la crypto depuis n'importe où. Le destinataire reçoit son Mobile Money en quelques secondes. Aucune connaissance en crypto requise.",
    hero_cta: 'Commencer',
    hero_learn: 'En savoir plus',
    hero_stat1: '< 20s Confirmation',
    hero_stat2: 'Inscription rapide',
    hero_stat3: 'Disponible 24h/24',
    // Payment form
    form_title: "Dépenser les crypto",
    form_destination: 'Destination',
    form_network: 'Réseau mobile',
    form_amount: 'Montant à recevoir',
    form_payWith: 'Payer en crypto',
    form_youPay: 'Vous payez',
    form_fee: 'Frais',
    form_generate: 'Générer le paiement',
    form_secure: 'Processus sécurisé, chiffré de bout en bout',

    // HowItWorks
    hiw_title: 'Comment ça fonctionne',
    hiw_subtitle: "Un pont fluide et entièrement automatisé de votre portefeuille crypto vers un téléphone en Afrique de l'Ouest.",
    hiw_step1_title: 'Entrez les détails',
    hiw_step1_desc: 'Choisissez le pays, l\'opérateur, le numéro du destinataire et le montant en FCFA.',
    hiw_step2_title: 'Devis instantané',
    hiw_step2_desc: 'La plateforme calcule le montant en crypto, 1% de frais fixes et le taux en temps réel.',
    hiw_step3_title: 'Payez en sécurité',
    hiw_step3_desc: 'Envoyez la crypto à l\'adresse générée ou scannez le QR code.',
    hiw_step4_title: 'Confirmation réseau',
    hiw_step4_desc: 'Vérification blockchain Lightning ou BEP-20 (généralement < 5s).',
    hiw_step5_title: 'Conversion auto',
    hiw_step5_desc: 'MarcSwitch convertit instantanément la crypto en monnaie locale.',
    hiw_step6_title: 'Paiement Mobile',
    hiw_step6_desc: 'L\'API déclenche un virement direct sur le compte Mobile Money du destinataire.',
    hiw_step7_title: 'Confirmation',
    hiw_step7_desc: 'L\'expéditeur et le destinataire reçoivent un SMS/reçu instantané.',

    // ExampleStory
    ex_badge: 'Impact concret',
    ex_title: 'De Paris à Abidjan en 20 secondes.',
    ex_desc: 'Ali en France possède 50 USDT. Sa mère à Abidjan a besoin de 30 000 FCFA. Elle ne sait pas ce qu\'est la crypto, et elle n\'a pas à le savoir.',
    ex_step1_title: 'Ali ouvre MarcSwitch',
    ex_step1_desc: 'Sélectionne Orange Money CI, entre son numéro et 30 000 FCFA.',
    ex_step2_title: 'Paye 46,25 USDT',
    ex_step2_desc: 'Envoie des USDT BEP-20 depuis son appli Binance vers le QR code fourni.',
    ex_step3_title: 'La mère reçoit les FCFA',
    ex_step3_desc: 'Son téléphone vibre avec un versement Orange Money de exactement 30 000 FCFA.',
    ex_receipt_title: 'Transfert effectué',
    ex_sent: 'Envoyé',
    ex_rate: 'Taux',
    ex_fee: 'Frais (1%)',
    ex_delivered: 'Reçu',

    // UsageModes
    um_title: 'Simple quand vous voulez.\nPuissant quand vous en avez besoin.',
    um_guest_title: 'Sans compte',
    um_guest_desc: 'Parfait pour les virements rapides ponctuels. Aucune inscription, aucune vérification d\'identité requise.',
    um_guest_feat1: 'Jusqu\'à 50 000 FCFA par transaction',
    um_guest_feat2: 'Zéro processus d\'inscription',
    um_guest_feat3: 'Payez instantanément via QR code',
    um_guest_cta: 'Envoyer de l\'argent',
    um_verified_title: 'Compte vérifié',
    um_verified_desc: 'Pour les utilisateurs réguliers et les entreprises. Débloquez toute la puissance de MarcSwitch.',
    um_verified_feat1: 'Montants illimités',
    um_verified_feat2: 'Enregistrez vos bénéficiaires',
    um_verified_feat3: 'Historique & exports complets',
    um_verified_feat4: 'Accès à l\'API marchande',
    um_verified_cta: 'Créer un compte',

    // SupportedNetworks
    sn_title: 'Un réseau massif,\ndisponible instantanément.',
    sn_desc: 'Nous avons intégré les principaux opérateurs télécom de la région UEMOA pour que vous n\'ayez pas à gérer le routage.',
    sn_crypto: 'Crypto acceptée',
    sn_countries: 'Pays supportés',

    // ForBusinesses
    fb_badge: 'API Développeur',
    fb_title: 'Acceptez la crypto.\nEncaissez en FCFA.',
    fb_desc: 'Les boutiques e-commerce et les entreprises locales peuvent intégrer MarcSwitch pour accepter des paiements crypto mondiaux. Votre client paie en USDT, vous recevez des FCFA directement sur votre Mobile Money ou compte bancaire instantanément.',
    fb_feat1: 'Aucune gestion de portefeuille crypto',
    fb_feat2: 'Zéro exposition à la volatilité',
    fb_feat3: 'Webhooks pour l\'exécution instantanée des commandes',
    fb_cta1: 'Accès API',
    fb_cta2: 'Documentation',

    // Footer
    footer_desc: 'Le pont le plus rapide entre le monde crypto et le mobile money en Afrique de l\'Ouest. Paiements. Simplifiés.',
    footer_product: 'Produit',
    footer_hiw: 'Comment ça marche',
    footer_networks: 'Réseaux supportés',
    footer_api: 'API Entreprise',
    footer_pricing: 'Tarifs',
    footer_company: 'Entreprise',
    footer_about: 'À propos',
    footer_careers: 'Carrières',
    footer_blog: 'Blog',
    footer_contact: 'Contact',
    footer_legal: 'Légal',
    footer_terms: "Conditions d'utilisation",
    footer_privacy: 'Politique de confidentialité',
    footer_compliance: 'Conformité & KYC',
    footer_rights: '© 2025 MarcSwitch. Tous droits réservés.',
    footer_status: 'Tous les systèmes opérationnels',
  },
  en: {
    // Navbar
    nav_howItWorks: 'How it works',
    nav_networks: 'Supported networks',
    nav_business: 'For businesses',
    nav_signIn: 'Sign In',
    nav_getStarted: 'Get started',
    nav_menu_login: 'Login',
    nav_menu_login_desc: 'Access your account',
    nav_menu_register: 'Registration',
    nav_menu_register_desc: 'Create a new account',
    nav_menu_transactions: 'Transactions',
    nav_menu_transactions_desc: 'View your history',
    nav_menu_business: 'For businesses',
    nav_menu_business_desc: 'API & enterprise access',
    nav_menu_support: 'Support',
    nav_menu_support_desc: 'Get help from our team',
    nav_tagline: 'Payments. Simplified.',

    // Hero
    hero_line1: 'Pay in crypto.',
    hero_line2: 'Receive in FCFA.',
    hero_desc: 'Send crypto from anywhere. The recipient gets Mobile Money in seconds. No crypto knowledge required on the receiving end.',
    hero_cta: 'Get started',
    hero_learn: 'Learn more',
    hero_stat1: '< 20s Confirmation',
    hero_stat2: 'Fast Sign-up',
    hero_stat3: '24/7 Available',
    // Payment form
    form_title: 'Spend Crypto',
    form_destination: 'Destination',
    form_network: 'Mobile Network',
    form_amount: 'Amount to Receive',
    form_payWith: 'Pay With Crypto',
    form_youPay: 'You pay',
    form_fee: 'Fee',
    form_generate: 'Generate Payment',
    form_secure: 'Secure, end-to-end encrypted process',

    // HowItWorks
    hiw_title: 'How the magic happens',
    hiw_subtitle: 'A seamless, fully automated bridge from your crypto wallet straight to a phone in West Africa.',
    hiw_step1_title: 'Enter details',
    hiw_step1_desc: 'Choose country, operator, recipient number and amount in FCFA.',
    hiw_step2_title: 'Instant quote',
    hiw_step2_desc: 'Platform calculates crypto amount, 1% flat fee, and real-time rate.',
    hiw_step3_title: 'Pay securely',
    hiw_step3_desc: 'Send crypto to the generated address or scan the QR code.',
    hiw_step4_title: 'Network confirm',
    hiw_step4_desc: 'Lightning or BEP-20 blockchain verification (usually < 5s).',
    hiw_step5_title: 'Auto-convert',
    hiw_step5_desc: 'MarcSwitch instantly converts the crypto into local fiat.',
    hiw_step6_title: 'Mobile payout',
    hiw_step6_desc: "API triggers direct payment to the recipient's Mobile Money account.",
    hiw_step7_title: 'Confirmation',
    hiw_step7_desc: 'Both sender and receiver get an instant SMS/receipt.',

    // ExampleStory
    ex_badge: 'Real-world impact',
    ex_title: 'From Paris to Abidjan in 20 seconds.',
    ex_desc: "Ali in France has 50 USDT. His mother in Abidjan needs 30 000 FCFA. She doesn't know what crypto is, and she shouldn't have to.",
    ex_step1_title: 'Ali opens MarcSwitch',
    ex_step1_desc: 'Selects Orange Money CI, enters her number and 30 000 FCFA.',
    ex_step2_title: 'Pays 46.25 USDT',
    ex_step2_desc: 'Sends BEP-20 USDT from his Binance app to the provided QR code.',
    ex_step3_title: 'Mother receives FCFA',
    ex_step3_desc: 'Her phone buzzes with an Orange Money payment of exactly 30 000 FCFA.',
    ex_receipt_title: 'Transfer Complete',
    ex_sent: 'Sent',
    ex_rate: 'Rate',
    ex_fee: 'Fee (1%)',
    ex_delivered: 'Delivered',

    // UsageModes
    um_title: 'Frictionless when you want it.\nPowerful when you need it.',
    um_guest_title: 'Guest Checkout',
    um_guest_desc: 'Perfect for one-off quick transfers. No registration, no identity verification required.',
    um_guest_feat1: 'Up to 50,000 FCFA per transaction',
    um_guest_feat2: 'Zero sign-up process',
    um_guest_feat3: 'Pay instantly via QR code',
    um_guest_cta: 'Send money now',
    um_verified_title: 'Verified Account',
    um_verified_desc: 'For regular users and businesses. Unlock the full power of MarcSwitch.',
    um_verified_feat1: 'Unlimited transaction amounts',
    um_verified_feat2: 'Save beneficiary numbers',
    um_verified_feat3: 'Full transaction history & exports',
    um_verified_feat4: 'Access to Merchant API',
    um_verified_cta: 'Create an account',

    // SupportedNetworks
    sn_title: 'A massive network,\ninstantly available.',
    sn_desc: "We've integrated with the major telcos across the UEMOA region so you don't have to worry about routing.",
    sn_crypto: 'Accepted Crypto',
    sn_countries: 'Supported Countries',

    // ForBusinesses
    fb_badge: 'Developer API',
    fb_title: 'Accept crypto.\nSettle in FCFA.',
    fb_desc: 'E-commerce stores and local businesses can integrate MarcSwitch to accept global crypto payments. Your customer pays in USDT, you receive FCFA directly in your Mobile Money or bank account instantly.',
    fb_feat1: 'No crypto wallet management',
    fb_feat2: 'Zero exposure to volatility',
    fb_feat3: 'Webhooks for instant order fulfillment',
    fb_cta1: 'Get API Access',
    fb_cta2: 'Read Docs',

    // Footer
    footer_desc: "The fastest bridge between the crypto world and West African mobile money. Payments. Simplified.",
    footer_product: 'Product',
    footer_hiw: 'How it works',
    footer_networks: 'Supported networks',
    footer_api: 'Business API',
    footer_pricing: 'Pricing',
    footer_company: 'Company',
    footer_about: 'About Us',
    footer_careers: 'Careers',
    footer_blog: 'Blog',
    footer_contact: 'Contact',
    footer_legal: 'Legal',
    footer_terms: 'Terms of Service',
    footer_privacy: 'Privacy Policy',
    footer_compliance: 'Compliance & KYC',
    footer_rights: '© 2025 MarcSwitch. All rights reserved.',
    footer_status: 'All systems operational',
  },
} as const;

type TranslationKey = keyof typeof translations.fr;

interface LangContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: TranslationKey) => string;
}

const LangContext = createContext<LangContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLang] = useState<Lang>('fr');

  const t = (key: TranslationKey): string => translations[lang][key] as string;

  return (
    <LangContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LangContext.Provider>
  );
}

export function useTranslation() {
  const ctx = useContext(LangContext);
  if (!ctx) throw new Error('useTranslation must be used inside LanguageProvider');
  return ctx;
}
