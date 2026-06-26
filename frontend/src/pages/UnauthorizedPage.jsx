import { Link } from 'react-router-dom';
import { LockKeyhole } from 'lucide-react';
import Button from '../components/common/Button';

export default function UnauthorizedPage() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center p-6">
      <section className="w-full max-w-md rounded-lg border border-[#dbe3ea] bg-white p-6 text-center shadow-card">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-[#fcebeb] text-[#a32d2d]">
          <LockKeyhole className="h-5 w-5" />
        </span>
        <h1 className="mt-4 text-lg font-semibold text-[#172033]">Access denied</h1>
        <p className="mt-2 text-sm leading-6 text-[#64748b]">Access denied. You do not have permission to view this page.</p>
        <Link to="/dashboard" className="mt-5 inline-flex">
          <Button>Back to dashboard</Button>
        </Link>
      </section>
    </div>
  );
}
