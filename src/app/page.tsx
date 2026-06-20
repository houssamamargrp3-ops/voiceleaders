import { redirect } from 'next/navigation';

export default function HomePage() {
  // توجيه المستخدم مباشرة إلى واجهة التطبيق (Home Feed)
  redirect('/feed');
}
