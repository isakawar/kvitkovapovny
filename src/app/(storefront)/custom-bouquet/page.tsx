import type { Metadata } from 'next'

import { CustomBouquetWizard } from '@/components/storefront/CustomBouquetWizard'

export const metadata: Metadata = {
  title: 'Зібрати букет самостійно | Kvitkova Povnya',
  description: 'Складіть авторський букет самостійно: оберіть квіти, кольори та упаковку з доставкою по Києву.',
  alternates: { canonical: '/custom-bouquet' },
}

export default function CustomBouquetPage() {
  return <CustomBouquetWizard />
}
