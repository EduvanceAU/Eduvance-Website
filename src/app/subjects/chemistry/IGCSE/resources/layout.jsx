const subjectName = 'Chemistry';
const examCode = 'CHE';
const syllabusType = 'IGCSE';
const refName = subjectName;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refsyllabusType} ${refName}`,
  description:
    `Discover original Eduvance resources for ${refsyllabusType} ${refName}, crafted to simplify tough topics and support your revision. Designed with care and clarity to help you study smarter!`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refsyllabusType} ${refName}`,
    description:
      `Discover original Eduvance resources for ${refsyllabusType} ${refName}, crafted to simplify tough topics and support your revision. Designed with care and clarity to help you study smarter!`,
    url: `https://www.eduvance-org.vercel.app/subjects/${refName}`,
    type: "website",
    images: [
      {
        url: "https://www.eduvance-org.vercel.app/tempbg.png",
        width: 1200,
        height: 630,
        alt: "Eduvance Image",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${refsyllabusType} ${refName}`,
    description:
      `Discover original Eduvance resources for ${refsyllabusType} ${refName}, crafted to simplify tough topics and support your revision. Designed with care and clarity to help you study smarter!`,
    images: ["https://www.eduvance-org.vercel.app/tempbg.png"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}