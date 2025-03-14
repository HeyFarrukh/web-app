import SavedApprenticeships from '@/components/saved-apprenticeships';

export default function SavedApprenticeshipsPage() {
  return <SavedApprenticeships />;
}

export const dynamic = 'force-dynamic'; // Always SSR this page
