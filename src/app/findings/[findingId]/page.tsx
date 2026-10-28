'use client';

import FindingDetailsView from '@/components/views/FindingDetailsView';

export default function FindingDetailsPage(props: { params: Promise<{ findingId: string }> }) {
  return <FindingDetailsView {...props} />;
}
