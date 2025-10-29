import { UserButton } from "@clerk/nextjs";
import { getCandidates } from "./actions";
import { CandidatesDataTable } from "./_components/candidates-data-table";

export default async function DashboardPage() {
  const { candidates, error } = await getCandidates();

  if (error) {
    return <div className="text-red-500 text-center mt-10">{error}</div>;
  }

  return (
    <div className="container mx-auto p-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold">HR Dashboard</h1>
        <UserButton afterSignOutUrl="/" />
      </header>

      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-4">All Candidates</h2>
        {candidates ? (
          <CandidatesDataTable data={candidates} />
        ) : (
          <p>No candidates found.</p>
        )}
      </div>
    </div>
  );
}
