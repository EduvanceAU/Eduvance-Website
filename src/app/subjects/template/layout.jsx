const subjectName = '{subjectName}';
const examCode = '{examCode}';
const syllabusType = '{syllabusType}';
const refName = subjectName;
const refexamCode = examCode;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refName} - ${refexamCode}`,
  description:
    `Explore a complete collection of learning tools tailored for ${refsyllabusType} ${refName} (${refexamCode}) — including curated revision resources, official past papers, and student-shared notes. Whether you're brushing up on key concepts, preparing for upcoming exams, or looking for simplified explanations from peers, this page brings everything together in one place to help you study smarter and stay ahead.`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refName} - ${refexamCode}`,
    description:
      `Explore a complete collection of learning tools tailored for ${refsyllabusType} ${refName} (${refexamCode}) — including curated revision resources, official past papers, and student-shared notes. Whether you're brushing up on key concepts, preparing for upcoming exams, or looking for simplified explanations from peers, this page brings everything together in one place to help you study smarter and stay ahead.`,
    url: `https://eduvance-website-copy.vercel.app/subjects/${refName}`,
    type: "website",
    images: [
      {
        url: "https://eduvance-website-copy.vercel.app/SmallLogo.svg",
        width: 40,
        height: 40,
        alt: "Eduvance Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${refName} - ${refexamCode}`,
    description:
      `Explore a complete collection of learning tools tailored for ${refsyllabusType} ${refName} (${refexamCode}) — including curated revision resources, official past papers, and student-shared notes. Whether you're brushing up on key concepts, preparing for upcoming exams, or looking for simplified explanations from peers, this page brings everything together in one place to help you study smarter and stay ahead.`,
    images: ["https://eduvance-website-copy.vercel.app/SmallLogo.svg"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}