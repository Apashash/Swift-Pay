export type TxStatus = 'completed' | 'pending' | 'failed';

export interface Transaction {
  id: string;
  date: string;
  recipient: string;
  recipientPhone: string;
  network: string;
  networkFlag: string;
  country: string;
  amountFCFA: number;
  amountCrypto: number;
  cryptoCurrency: string;
  rate: number;
  fee: number;
  status: TxStatus;
  txHash?: string;
}

export const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: 'TXN001',
    date: '2025-07-24T10:23:00Z',
    recipient: 'Mamadou Koné',
    recipientPhone: '+225 07 12 34 56',
    network: 'Orange Money',
    networkFlag: '🇨🇮',
    country: "Côte d'Ivoire",
    amountFCFA: 30000,
    amountCrypto: 46.25,
    cryptoCurrency: 'USDT',
    rate: 649,
    fee: 0.47,
    status: 'completed',
    txHash: '0x4a3b...c9f2',
  },
  {
    id: 'TXN002',
    date: '2025-07-22T16:45:00Z',
    recipient: 'Fatou Diallo',
    recipientPhone: '+221 77 890 12 34',
    network: 'Wave',
    networkFlag: '🇸🇳',
    country: 'Sénégal',
    amountFCFA: 15000,
    amountCrypto: 23.12,
    cryptoCurrency: 'USDT',
    rate: 649,
    fee: 0.23,
    status: 'completed',
    txHash: '0x9d1e...8a2c',
  },
  {
    id: 'TXN003',
    date: '2025-07-20T08:10:00Z',
    recipient: 'Ibrahim Traoré',
    recipientPhone: '+226 70 56 78 90',
    network: 'Moov Money',
    networkFlag: '🇧🇫',
    country: 'Burkina Faso',
    amountFCFA: 50000,
    amountCrypto: 0.0011,
    cryptoCurrency: 'BTC',
    rate: 45000000,
    fee: 0.49,
    status: 'pending',
  },
  {
    id: 'TXN004',
    date: '2025-07-18T13:30:00Z',
    recipient: 'Aïssatou Ba',
    recipientPhone: '+224 621 23 45 67',
    network: 'MTN',
    networkFlag: '🇬🇳',
    country: 'Guinée',
    amountFCFA: 20000,
    amountCrypto: 30.82,
    cryptoCurrency: 'USDT',
    rate: 649,
    fee: 0.31,
    status: 'failed',
  },
  {
    id: 'TXN005',
    date: '2025-07-15T09:00:00Z',
    recipient: 'Moussa Coulibaly',
    recipientPhone: '+223 76 12 34 56',
    network: 'Orange Money',
    networkFlag: '🇲🇱',
    country: 'Mali',
    amountFCFA: 45000,
    amountCrypto: 69.37,
    cryptoCurrency: 'USDT',
    rate: 649,
    fee: 0.70,
    status: 'completed',
    txHash: '0x2f7a...1b4d',
  },
];

export const COUNTRIES = [
  { code: 'CI', name: "Côte d'Ivoire", flag: '🇨🇮', dialCode: '+225' },
  { code: 'SN', name: 'Sénégal', flag: '🇸🇳', dialCode: '+221' },
  { code: 'ML', name: 'Mali', flag: '🇲🇱', dialCode: '+223' },
  { code: 'BF', name: 'Burkina Faso', flag: '🇧🇫', dialCode: '+226' },
  { code: 'GN', name: 'Guinée', flag: '🇬🇳', dialCode: '+224' },
  { code: 'TG', name: 'Togo', flag: '🇹🇬', dialCode: '+228' },
  { code: 'BJ', name: 'Bénin', flag: '🇧🇯', dialCode: '+229' },
  { code: 'NE', name: 'Niger', flag: '🇳🇪', dialCode: '+227' },
  { code: 'FR', name: 'France', flag: '🇫🇷', dialCode: '+33' },
  { code: 'BE', name: 'Belgique', flag: '🇧🇪', dialCode: '+32' },
  { code: 'GB', name: 'Royaume-Uni', flag: '🇬🇧', dialCode: '+44' },
  { code: 'US', name: 'États-Unis', flag: '🇺🇸', dialCode: '+1' },
  { code: 'CA', name: 'Canada', flag: '🇨🇦', dialCode: '+1' },
  { code: 'DE', name: 'Allemagne', flag: '🇩🇪', dialCode: '+49' },
  { code: 'IT', name: 'Italie', flag: '🇮🇹', dialCode: '+39' },
  { code: 'ES', name: 'Espagne', flag: '🇪🇸', dialCode: '+34' },
];
