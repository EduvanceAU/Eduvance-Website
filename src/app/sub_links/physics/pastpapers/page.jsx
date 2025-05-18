import Link from "next/link";

const sessions = [
  { label: "January", value: "January" },
  { label: "May/June", value: "May%2FJune" },
  { label: "Oct/Nov", value: "October%2FNovember" },
];

const years = Array.from({ length: 10 }, (_, i) => 2015 + i).concat(2024);

const units = [
  { name: "Mechanics and Materials", code: "WPH11/01", unit: "Unit 1" },
  { name: "Waves and Electricity", code: "WPH12/01", unit: "Unit 2" },
  { name: "Practical Skills in Physics I", code: "WPH13/01", unit: "Unit 3" },
];

const generatePearsonLink = (subject, session, year) => {
  const subjectFormatted = subject.replace(" ", "%20");
  return `https://qualifications.pearson.com/en/support/support-topics/exams/past-papers.html?Qualification-Family=International-Advanced-Level&Qualification-Subject=${subjectFormatted}&Status=Pearson-UK:Status%2FLive&Specification-Code=Pearson-UK:Specification-Code%2Fial18-${subject.toLowerCase()}&Exam-Series=${session}-${year}`;
};

export default function PastPapersPage() {
  const subject = "Physics";

  return (
    <main className="min-h-screen bg-white flex flex-col items-center py-10 px-4">
      <h1 className="text-5xl font-bold text-[#153064] mb-8 w-full max-w-6xl text-left tracking-[-0.035em]" style={{ fontFamily: 'Poppins, sans-serif' }}>
        IAL Physics Past Papers
      </h1>

      <div className="w-full max-w-6xl space-y-10">
        {years.map((year) => (
          <div key={year}>
            <h2 className="text-2xl font-semibold text-[#153064] mb-4 text-left tracking-tight" style={{ fontFamily: 'Poppins, sans-serif' }}>
              {year}
            </h2>

            {sessions.map((session) => (
              <div key={`${year}-${session.label}`} className="mb-4">
                <h3 className="text-lg tracking-tighter font-medium text-[#153064] mb-2 text-left" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  {session.label} Session
                </h3>

                <div className="w-[660px] bg-blue-100 rounded-t flex justify-between items-center px-4 py-2 mb-1 text-[#153064]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  <span className="font-semibold text-sm text-left w-[120px]">Exam</span>
                  <span className="font-semibold text-sm text-left w-[270px]">Marking Scheme</span>
                </div>

                <div className="grid grid-cols-[minmax(0,_220px)_minmax(0,_220px)] gap-x-40 gap-y-2">
                  {units.map((unit) => (
                    <>
                      <Link
                        key={`qp-${year}-${session.label}-${unit.unit}`}
                        href={generatePearsonLink(subject, session.value, year)}
                        className="text-blue-600 font-medium hover:underline text-left max-w-[250px]"
                        target="_blank"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {`${session.label} ${year} ${unit.unit}: ${unit.name} ${unit.code} (QP)`}
                      </Link>

                      <Link
                        key={`ms-${year}-${session.label}-${unit.unit}`}
                        href={generatePearsonLink(subject, session.value, year)}
                        className="text-blue-600 font-medium hover:underline text-left max-w-[250px]"
                        target="_blank"
                        style={{ fontFamily: 'Poppins, sans-serif' }}
                      >
                        {`${session.label} ${year} ${unit.unit}: ${unit.name} ${unit.code} (MS)`}
                      </Link>

                      {/* Divider spanning both columns */}
                      <div className="col-span-2 h-px bg-gray-300"></div>
                    </>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </main>
  );
}
