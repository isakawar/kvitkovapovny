import type { Metadata } from 'next'
import { pageMetadata } from '@/lib/pageMetadata'

import { CustomBouquetWizard } from '@/components/storefront/CustomBouquetWizard'

export const metadata: Metadata = pageMetadata({
  path: '/custom-bouquet',
  title: 'Зібрати букет самостійно | Kvitkova Povnya',
  description: 'Складіть авторський букет самостійно: оберіть квіти, кольори та упаковку з доставкою по Києву.',
})

export default function CustomBouquetPage() {
  return <CustomBouquetWizard />
}
