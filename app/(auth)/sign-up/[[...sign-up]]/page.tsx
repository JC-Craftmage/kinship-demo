import { SignUp } from '@clerk/nextjs';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="text-5xl">⛵</div>
            <span className="text-4xl font-bold text-indigo-600">Kinship</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Join the Crew!</h1>
          <p className="text-gray-600">Create an account to connect with your church family</p>
        </div>

        <SignUp
          appearance={{
            elements: {
              rootBox: 'mx-auto',
              card: 'shadow-xl',
            }
          }}
        />
      </div>
    </div>
  );
}
