import { useRouter, useSearchParams } from 'next/navigation';
import { googleAuthService } from '@/services/auth/googleAuthService';

interface GoogleSignInProps {
  redirect?: string | null;
}

export const GoogleSignIn = ({ redirect }: GoogleSignInProps) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectPath = redirect || searchParams?.get('redirect') || '/optimise-cv';

  const handleGoogleSignIn = async () => {
    try {
      await googleAuthService.signIn(redirectPath);
    } catch (error: any) {
      console.error('Unexpected error during sign in:', error);
    }
  };

  return (
    <div className="flex flex-col items-center space-y-4">
      <button
        onClick={handleGoogleSignIn}
        className="bg-white border rounded-md px-6 py-2 shadow-md hover:shadow-lg transition flex items-center"
      >
        <img src="/assets/google.svg" alt="Google Logo" className="w-5 h-5 mr-2" />
        Continue with Google
      </button>
      <p className="text-sm font-bold text-gray-500 text-center mt-2">
        After signing in, you'll be redirected to the home page.
      </p>
    </div>
  );
};