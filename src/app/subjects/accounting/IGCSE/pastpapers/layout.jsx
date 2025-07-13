const subjectName = 'Accounting';
const examCode = 'ACC';
const syllabusType = 'IGCSE';
const refName = subjectName;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refsyllabusType} ${refName}`,
  description:
    `Access a vast repository of past papers for ${refsyllabusType} ${refName}, organized by year and session for easy browsing. Whether practicing under timed conditions or reviewing marking schemes, this is your one-stop destination for exam preparation — streamlined, reliable, and always up to date`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refsyllabusType} ${refName}`,
    description:
      `Access a vast repository of past papers for ${refsyllabusType} ${refName}, organized by year and session for easy browsing. Whether practicing under timed conditions or reviewing marking schemes, this is your one-stop destination for exam preparation — streamlined, reliable, and always up to date`,
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
      `Access a vast repository of past papers for ${refsyllabusType} ${refName}, organized by year and session for easy browsing. Whether practicing under timed conditions or reviewing marking schemes, this is your one-stop destination for exam preparation — streamlined, reliable, and always up to date`,
    images: ["https://eduvance-website-copy.vercel.app/SmallLogo.svg"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}