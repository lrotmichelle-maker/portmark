import { Header } from './header';
import { Content } from './content';
import { Footer } from './footer';

export default function JobCard({ job, onApply }: { job: any; onApply?: (job: any) => void }) {
  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 flex flex-col justify-between h-full hover:border-zinc-700 transition-all duration-200 shadow-xl">
      <div>
        <Header 
          name={job.employerName} 
          handle={job.handle || '@company'} 
          rating={job.rating || 5.0} 
          daysRemaining={job.daysRemaining} 
          niche={job.title} 
          maxSalary={job.maxSalary} 
        />
        <div className="my-4">
          <Content 
            title={job.title} 
            requiredPeople={job.requiredPeople} 
            applicants={job.applicants} 
            accepted={job.accepted} 
            description={job.description} 
            requirements={job.requirements} 
          />
        </div>
      </div>
      <Footer status={job.status} onApply={() => onApply?.(job)} />
    </div>
  );
}