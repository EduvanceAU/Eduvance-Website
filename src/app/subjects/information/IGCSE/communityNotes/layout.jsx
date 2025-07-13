const subjectName = 'Information';
const examCode = 'INF';
const syllabusType = 'IGCSE';
const refName = subjectName;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refsyllabusType} ${refName}`,
  description:
    `A growing collection of clear, concise notes and study guides for ${refsyllabusType} ${refName}, created entirely by students and teachers who understand what truly helps. Whether you're revising for exams or catching up on topics, these will always be useful`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refsyllabusType} ${refName}`,
    description:
      `A growing collection of clear, concise notes and study guides for ${refsyllabusType} ${refName}, created entirely by students and teachers who understand what truly helps. Whether you're revising for exams or catching up on topics, these will always be useful`,
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
    title: `${refsyllabusType} ${refName}`,
    description:
      `A growing collection of clear, concise notes and study guides for ${refsyllabusType} ${refName}, created entirely by students and teachers who understand what truly helps. Whether you're revising for exams or catching up on topics, these will always be useful`,
    images: ["https://eduvance-website-copy.vercel.app/SmallLogo.svg"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}