// Root page - Redirects to landing page

import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/');
}
