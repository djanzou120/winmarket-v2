import { redirect } from 'next/navigation';

export default function AdminHomePage() {
  // Redirect to dashboard
  redirect('/dashboard');
}