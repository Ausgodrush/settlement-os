import dynamic from 'next/dynamic';

const DealWorkspaceClient = dynamic(() => import('./DealWorkspaceClient'), { ssr: false });

export function generateStaticParams() {
  return [{ id: '_' }];
}

export default function DealWorkspacePage() {
  return <DealWorkspaceClient />;
}
