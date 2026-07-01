'use client';

import HasilPage from '@/components/page/hasilPage';
import { useSearchParams } from 'next/navigation';

const Page = () => {
  const searchParams = useSearchParams();

  const data = {
    akademik: searchParams.get('akademik') || '-',
    riasec: searchParams.get('riasec') || '-',
    bakat: searchParams.get('bakat') || '-',
    gabungan: searchParams.get('gabungan') || '-',
  };

  return <HasilPage data={data} />;
};

export default Page;