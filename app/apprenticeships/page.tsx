import Listings from '@/app/apprenticeships/listings'; // Import the renamed client component

export default function ApprenticeshipsPage() {
  return (
    <Listings />
  );
}

export const dynamic = 'force-dynamic'; // Add this line
