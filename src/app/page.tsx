"use client";
import Image from 'next/image';
import Link from "next/link";
import { useState, useRef, useEffect } from 'react';
import { Home } from '@/components/homenav'
import ArrowR from '@/assets/png/ArrowR.png'
import bgCrypto from '@/assets/png/bgCrypto.png'
import BiggerLogo from '@/assets/png/BiggerLogo.png'
import discordLogo from '@/assets/png/discordLogo.png'
import DocWidgets from '@/assets/png/DocWidgets.png'
import EduvanceFooter from '@/assets/png/EduvanceFooter.png'
import Headline from '@/assets/png/Headline.png'
import Page from '@/assets/png/Page.png'
import WhiteDiscordLogo from '@/assets/png/WhiteDiscordLogo.png'
import QuotationMarks from '@/assets/png/QuotationMarks.png'
// Reusable components
const TestimonialCard = ({ content, icon, headline, rotation, imageClassName }) => (
  <div className={`bg-gradient-to-r from-[#347BFF] to-[#2566E2] border border-white rounded-xl p-6 ${rotation} w-full mx-2 md:mx-0 h-full`}>
    <p className="text-white text-sm font-light leading-relaxed">
      {content}
    </p>
    <div className="flex items-center mt-4">
      <Image src={icon} alt={headline} width={24} height={24} className={`w-6 h-6 mr-2 ${imageClassName}`} />
      <h3 className="text-white font-semibold text-md">{headline}</h3>
    </div>
  </div>
);

interface ScrollingColumnProps {
  direction: "scroll-up" | "scroll-down";
  speed?: number;
  count?: number;
  className?: string;
}

const ScrollingColumn: React.FC<ScrollingColumnProps> = ({ direction, count = 15, className }) => {
  const isUp = direction === "scroll-up";
  const items = new Array(count).fill(0);

  return (
    <div className={`relative h-[800px] w-[150px] overflow-hidden ${className}`}>
      <div className={`flex flex-col gap-4 ${isUp ? "scroll-up" : "scroll-down"}`}>
        {items.map((_, i) => (
          <Image
            key={i}
            src={Page}
            className="rounded-2xl w-full object-cover"
            alt={`scroll-page-${i}`}
          />
        ))}
        {items.map((_, i) => (
          <Image
            key={`dup-${i}`}
            src={Page}
            className="rounded-2xl w-full object-cover"
            alt={`scroll-page-dup-${i}`}
          />
        ))}
      </div>
    </div>
  );
};

export default function Main() {
  const[member_count, setmembercount] = useState("")
  useEffect(() =>{
    fetch("/api/members")
    .then(response => response.json())
    .then(data => {setmembercount(data.count)})
  }, [])

  return (
    <>
      <Home/>
      {/* Hero Section */}
      <section className="w-full min-h-screen flex flex-col relative pt-16">
        {/* Gradient Box in Background */}
        <div className="flex text-center flex-col gap-4 items-center justify-center absolute w-[95vw] h-[85vh] bg-gradient-to-b from-[#4E8CFF] to-[#0C60FB] rounded-2xl shadow-xl z-0 left-1/2 transform -translate-x-1/2 mb-[-50px] overflow-hidden" >
          

            <Image src={Headline} alt="Headline" className="w-[800px] h-auto z-10" />

            <h3 className="font-semibold text-white leading-[22px] text-xl max-w-[550px] z-10">
              Education drives progress. Eduvance helps you learn, revise, and stay ahead in your academic journey
            </h3>

            {/* Discord Button */}
            <a
              aria-label='join-discord-server'
              href="https://discord.gg/eduvance"
              target="_blank"
              rel="noopener noreferrer"
              className="z-20"
            >
            <button className="group cursor-pointer bg-white hover:bg-[#143166] hover:text-white text-[#428CF9] border-5 border-[#639afe] px-9 py-4 rounded-[16px] text-xl poppins-semibold shadow-lg flex items-center gap-5">
              <div className="relative w-9 h-9">
                <Image src={discordLogo} alt="Discord" fill className="object-contain opacity-100 group-hover:opacity-0 transition-opacity duration-20"/>
                <Image src={WhiteDiscordLogo} alt="Discord Hover" fill className="object-contain opacity-0 group-hover:opacity-100 transition-opacity duration-20"/>
              </div>
              Join our Discord Server
            </button>

            </a>
            {/* Decorative Images (Positioned with absolute so they don't mess layout) */}
            <Image
              src={bgCrypto}
              alt="Decorative Crypto"
              className="absolute left-1/2 transform -translate-x-1/2 w-full h-auto z-10"
            />
            <Image
              src={DocWidgets}
              alt="DocWidgets"
              className="absolute top-[70%] sm:top-[90%] w-[300px] sm:w-[300px] h-auto transform sm:-translate-y-40 translate-y-10 left-[-20px] z-0"
            />

          
        </div>
      </section>

      {/* Scrolling Papers Section */}
      <section className="w-full overflow-hidden py-16 relative top-[-80px]">
        <div className="overflow-hidden h-[800px] w-full flex justify-center relative"> {/* Added 'relative' here */}
          {/* Top Blur Overlay */}
          <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-white to-transparent z-10"></div> {/* Adjust 'from-white' to your background color if needed */}

          <div className="flex flex-row gap-x-8 md:gap-x-16">
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
            <ScrollingColumn direction="scroll-up" />
            <ScrollingColumn direction="scroll-down" />
          </div>

          {/* Bottom Blur Overlay */}
          <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-white to-transparent z-10"></div> {/* Adjust 'from-white' to your background color if needed */}
        </div>
      </section>

      {/* Study Materials Section */}
      <section className="w-full py-24 relative top-[-500px]">
        <div className="relative flex items-center justify-center text-center top-[-200px]">
          {/* Blurred Background */}
          <div className="w-[350px] h-[250px]  sm:w-[700px] sm:h-[500px] rounded-full bg-white blur-2xl opacity-100 absolute" />

          {/* Heading + Button */}
          <div className="relative flex flex-col z-10 max-w-xl mx-auto justify-center items-center">
            <h1
              className="text-2xl w-[250px] sm:text-4xl font-semibold tracking-[-0.05em] text-black text-center"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Study Materials to level up your revision
            </h1>

            <h3 className="mt-4 font-[600] text-[#878787] tracking-[-0.5px] text-m sm:text-xl text-center w-[250px] leading-tight sm:w-[550px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              Find revision resources for your Exam Board and Subject
            </h3>

            <Link href="/resources" className="inline-block mt-6">
              <button className="cursor-pointer bg-[#2D74F8] hover:bg-[#143166] text-[#FFFFFF] px-6 py-2 rounded-[50px] text-xl poppins-semibold shadow-lg flex items-center gap-2">
                Explore Resources
                <Image src={ArrowR} alt="Arrow Right" className="w-6 h-auto" />
              </button>
            </Link>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="w-full py-24 relative -mt-[600px]">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <div
              className="inline-block px-6 py-0.6 border-2 border-[#4B89FD] rounded-full text-black font-semibold tracking-[-0.7px] text-lg mb-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Trusted by {member_count} Students worldwide and counting!
            </div>

            <Image
              src={QuotationMarks}
              alt="QuotationMarks"
              className="hidden min-[830px]:block w-[1200px] h-auto mx-auto absolute left-1/2 transform -translate-x-1/2 -translate-y-0 z-0"
            />

            <h1
              className="font-semibold text-3xl tracking-tighter sm:text-5xl sm:tracking-[-3px] sm:max-w-[550px] max-w-[350px] mx-auto z-20"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Complete Academic Support Ecosystem
            </h1>

            <h3
              className="font-medium text-[21px] tracking-[-0.7px] leading-[20px] max-w-[520px] mx-auto mt-8"
              style={{ fontFamily: 'Poppins, sans-serif' }}
            >
              Connect instantly with like-minded learners. Ask questions, share resources, and stay motivated — all in one place
            </h3>


            <a
              href="https://discord.gg/Eduvance"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block mt-15 "
            >
              <button
                className="cursor-pointer bg-[#3F82FD] hover:bg-[#143166] text-white border-5 border-[#B1CCFF] border-opacity-50 px-9 py-3 rounded-full text-xl poppins-semibold flex items-center gap-5"
                style={{ fontFamily: 'Poppins, sans-serif' }}
              >
                <Image src={WhiteDiscordLogo} alt="Discord" className="w-9 h-auto" />
                Join the community
              </button>
            </a>
          </div>

          <div className="relative">
            <div className="flex flex-col lg:flex-row  items-stretch  mt-24">
              <TestimonialCard
                content="Bro Eduvance.au is actually carrying rn 😭 the new UI? chef's kiss fr 💅🏻 admin panel finally usable (we made it y'all 😭). Mobile still kinda crunchy ngl but overall? smooth ✨ Sidebar's clean, Discord login bangs 🔥 flow's tight. Devs cooking hard at 3am 🔥 pls fix the scroll bug before I cry again 😩. Love this team fr 🤍"
                icon="/map.png"
                headline="Mapleon, Senior Moderator"
                rotation="rotate-[-2deg]"
                imageClassName="rounded-full"
              />

              <TestimonialCard
                content="Eduvance is seriously one of the slickest, most community-driven edu platforms out there. Every design and feature feels intentional—mobile's clean. But honestly, it's the people that make it—staff actually know regulars, and feedback turns into real changes. It's not just a notes dump, it's a whole vibe. From early server boosts to now helping thousands, Eduvance is straight-up him"
                icon="/maryam.png"
                headline="Maryam, Head Moderator"
                rotation="rotate-[1deg]"
                imageClassName="rounded-full"
              />

              <TestimonialCard
                content="Eduvance.au has grown into way more than just a past papers site—it’s a full ecosystem now. From responsive mobile layouts to secret side projects (that we barely keep under wraps), the devs really care about UX, not just content. Whether it’s skilled roles, server boosts, or the legit Minecraft server coming soon, it all builds this weird but productive culture. People move on, but the impact stays real."
                icon="/bio.png"
                headline="Biomeac, Co-Founder"
                rotation="rotate-[-1.5deg]"
                imageClassName="rounded-full"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer Section */}
      <footer className="w-full bg-[#357BFD] pt-15 sm:pt-24 pb-8">
        <div className="container mx-auto px-4 relative">
          <Image src={EduvanceFooter} alt="Footer" className="h-auto w-[1900px] mx-auto transform sm:-translate-y-5 -translate-y-[31px]" />

          <div className="rounded-2xl p-6 max-w-[1850px] mx-auto h-[920px] sm:h-[920px] lg:h-[520px] bg-gradient-to-b from-[#FFFFFF] via-[#FAFCFF] to-[#357BFD] flex flex-col lg:flex-row gap-8 shadow-[0px_-10px_30px_#357BFD40] translate-y-[-40px]">
            {/* Left Column */}
            <div className="w-full lg:w-1/3 flex flex-col items-start mt-[6px]">
              <Image src={BiggerLogo} alt="Bigger logo" className="w-auto h-15 object-contain mb-4" />
              <p className="text-[#757575] text-base leading-5 tracking-tight font-medium" style={{ fontFamily: 'Poppins, sans-serif' }}>
                A thriving student-led community built for learners across IGCSE and IALs (AS+ A2). From revision and learning resources to solving your doubts, we're here to make education easier, smarter, and more connected
              </p>
            </div>

            {/* Right Column - 3 Inner Columns */}
            <div className="w-full lg:w-2/3 grid grid-cols-1 sm:grid-cols-3 gap-1 mt-[20px]">
              {/* Column 1 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Navigation</h3>
                <Link href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Home</Link>
                <Link href="/resources" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Resources</Link>
                <Link href="/pastPapers" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Past Papers</Link>
                <Link href="#" className="hidden text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Match with a Tutor</Link>
                <Link href='/staffAccess' className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}> Staff Page</Link>
                <Link href="#" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>About Eduvance</Link>
              </div>

              {/* Column 2 */}
              <div className="flex flex-col">
                <h3 className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Legal Info</h3>
                <a href="/guidelines" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Community Guidelines</a>
                <a href="/terms" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Terms of Services</a>
                <a href="/privacy" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Privacy Policy</a>
              </div>

              {/* Column 3 */}
              <div className="flex flex-col">
                <p className="text-black tracking-[-0.6px] text-lg font-[550] mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>Join the Community</p>
                <div className='flex gap-2 items-center justify-start'>
                  <a aria-label='discord' href="https://discord.gg/eduvance-community-983670206889099264" className='w-6'><svg className="hover:fill-[#0c60fb] cursor-pointer" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Discord</title><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg></a>
                  <a aria-label='instagram' href="https://www.instagram.com/eduvance.au/" className='w-6'><svg className="hover:fill-[#0c60fb] cursor-pointer" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Instagram</title><path d="M7.0301.084c-1.2768.0602-2.1487.264-2.911.5634-.7888.3075-1.4575.72-2.1228 1.3877-.6652.6677-1.075 1.3368-1.3802 2.127-.2954.7638-.4956 1.6365-.552 2.914-.0564 1.2775-.0689 1.6882-.0626 4.947.0062 3.2586.0206 3.6671.0825 4.9473.061 1.2765.264 2.1482.5635 2.9107.308.7889.72 1.4573 1.388 2.1228.6679.6655 1.3365 1.0743 2.1285 1.38.7632.295 1.6361.4961 2.9134.552 1.2773.056 1.6884.069 4.9462.0627 3.2578-.0062 3.668-.0207 4.9478-.0814 1.28-.0607 2.147-.2652 2.9098-.5633.7889-.3086 1.4578-.72 2.1228-1.3881.665-.6682 1.0745-1.3378 1.3795-2.1284.2957-.7632.4966-1.636.552-2.9124.056-1.2809.0692-1.6898.063-4.948-.0063-3.2583-.021-3.6668-.0817-4.9465-.0607-1.2797-.264-2.1487-.5633-2.9117-.3084-.7889-.72-1.4568-1.3876-2.1228C21.2982 1.33 20.628.9208 19.8378.6165 19.074.321 18.2017.1197 16.9244.0645 15.6471.0093 15.236-.005 11.977.0014 8.718.0076 8.31.0215 7.0301.0839m.1402 21.6932c-1.17-.0509-1.8053-.2453-2.2287-.408-.5606-.216-.96-.4771-1.3819-.895-.422-.4178-.6811-.8186-.9-1.378-.1644-.4234-.3624-1.058-.4171-2.228-.0595-1.2645-.072-1.6442-.079-4.848-.007-3.2037.0053-3.583.0607-4.848.05-1.169.2456-1.805.408-2.2282.216-.5613.4762-.96.895-1.3816.4188-.4217.8184-.6814 1.3783-.9003.423-.1651 1.0575-.3614 2.227-.4171 1.2655-.06 1.6447-.072 4.848-.079 3.2033-.007 3.5835.005 4.8495.0608 1.169.0508 1.8053.2445 2.228.408.5608.216.96.4754 1.3816.895.4217.4194.6816.8176.9005 1.3787.1653.4217.3617 1.056.4169 2.2263.0602 1.2655.0739 1.645.0796 4.848.0058 3.203-.0055 3.5834-.061 4.848-.051 1.17-.245 1.8055-.408 2.2294-.216.5604-.4763.96-.8954 1.3814-.419.4215-.8181.6811-1.3783.9-.4224.1649-1.0577.3617-2.2262.4174-1.2656.0595-1.6448.072-4.8493.079-3.2045.007-3.5825-.006-4.848-.0608M16.953 5.5864A1.44 1.44 0 1 0 18.39 4.144a1.44 1.44 0 0 0-1.437 1.4424M5.8385 12.012c.0067 3.4032 2.7706 6.1557 6.173 6.1493 3.4026-.0065 6.157-2.7701 6.1506-6.1733-.0065-3.4032-2.771-6.1565-6.174-6.1498-3.403.0067-6.156 2.771-6.1496 6.1738M8 12.0077a4 4 0 1 1 4.008 3.9921A3.9996 3.9996 0 0 1 8 12.0077"/></svg></a>
                  <a aria-label='github' href="https://github.com/EduvanceAU" className='w-6'><svg className="hover:fill-[#0c60fb] cursor-pointer" role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>GitHub</title><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg></a>
                  <a aria-label='linkedin' href="https://www.linkedin.com/company/eduvance-au" className='w-6'><svg className="hover:fill-[#0c60fb] cursor-pointer" role="img" viewBox="0 0 448 512" xmlns="http://www.w3.org/2000/svg"><path d="M416 32H31.9C14.3 32 0 46.5 0 64.3v383.4C0 465.5 14.3 480 31.9 480H416c17.6 0 32-14.5 32-32.3V64.3c0-17.8-14.4-32.3-32-32.3zM135.4 416H69V202.2h66.5V416zm-33.2-243c-21.3 0-38.5-17.3-38.5-38.5S80.9 96 102.2 96c21.2 0 38.5 17.3 38.5 38.5 0 21.3-17.2 38.5-38.5 38.5zm282.1 243h-66.4V312c0-24.8-.5-56.7-34.5-56.7-34.6 0-39.9 27-39.9 54.9V416h-66.4V202.2h63.7v29.2h.9c8.9-16.8 30.6-34.5 62.9-34.5 67.2 0 79.7 44.3 79.7 101.9V416z"/></svg></a>
                </div>
                <a href="/contributor" className="text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a community contributor</a>
                <a href="#" className="hidden text-[#757575] tracking-[-0.5px] font-medium hover:text-slate-950" style={{ fontFamily: 'Poppins, sans-serif' }}>Become a tutor</a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
