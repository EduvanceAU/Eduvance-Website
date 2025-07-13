const subjectName = 'Psychology';
const examCode = 'PSY';
const syllabusType = 'IAL';
const refName = subjectName;
const refsyllabusType = syllabusType;

export const viewport = {
  themeColor: "#4e8cff",
}

export const metadata = {
  title: `${refsyllabusType} ${refName}`,
  description:
    `Explore original resources made by the Eduvance team for ${refsyllabusType} ${refName}. They are designed with precision and purpose, these tools aim to simplify complex concepts and support your revision every step of the way.`,
  icons: {
    icon: "/BlueSolo.svg",
    shortcut: "/BlueSolo.svg",
    apple: "/BlueSolo.svg",
  },
  openGraph: {
    title: `${refsyllabusType} ${refName}`,
    description:
      `Explore original resources made by the Eduvance team for ${refsyllabusType} ${refName}. They are designed with precision and purpose, these tools aim to simplify complex concepts and support your revision every step of the way.`,
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
      `Explore original resources made by the Eduvance team for ${refsyllabusType} ${refName}. They are designed with precision and purpose, these tools aim to simplify complex concepts and support your revision every step of the way.`,
    images: ["https://eduvance-website-copy.vercel.app/SmallLogo.svg"],
  },
};

export default function RootLayout({ children }) {
  return (<>{children}</>)
}