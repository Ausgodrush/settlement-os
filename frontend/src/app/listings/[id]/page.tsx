import ListingDetailClient from './ListingDetailClient';
import { MOCK_LISTINGS } from '@/lib/mockListings';

export function generateStaticParams() {
  return MOCK_LISTINGS.map((l) => ({ id: l.id }));
}

export default function ListingDetailPage({ params }: { params: { id: string } }) {
  return <ListingDetailClient id={params.id} />;
}
