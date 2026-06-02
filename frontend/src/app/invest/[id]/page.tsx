import PoolDetailClient from './PoolDetailClient';
import { MOCK_POOLS } from '@/lib/investData';

export function generateStaticParams() {
  return MOCK_POOLS.map((p) => ({ id: p.id }));
}

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  return <PoolDetailClient id={params.id} />;
}
