const subjectName = 'Accounting';
const examCode = '4AC1';
const syllabusType = 'IGCSE';
const refName = subjectName;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refsyllabusType} ${refName}`,
  description:
    `Discover clear, concise notes and study guides for ${refsyllabusType} ${refName}, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refsyllabusType} ${refName}`,
    description:
      `Discover clear, concise notes and study guides for ${refsyllabusType} ${refName}, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
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
      `Discover clear, concise notes and study guides for ${refsyllabusType} ${refName}, created by students and teachers who get what works. Ideal for exam preparation or topic review, these resources are made to support your learning every step of the way!`,
    images: ["https://www.eduvance-org.vercel.app/tempbg.png"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}