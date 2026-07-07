import { Suspense } from 'react';
import HasilClient from './HasilClient';

const Page = () => {
  return (
    <Suspense fallback={<div>Memuat hasil...</div>}>
      <HasilClient />
    </Suspense>
  );
};

export default Page;