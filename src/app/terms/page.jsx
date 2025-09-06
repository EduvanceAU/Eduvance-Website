"use client";
import { Home } from '@/components/homenav';
import SmallFoot from '@/components/smallFoot.jsx';
import { useEffect } from "react";
import {Cross} from 'lucide-react'
function Guideline({ title, content }) {
  useEffect(() => {
    const header = document.querySelector(`[data-title="${title}header"]`);
    const to_hide = document.querySelector(`[data-title="${title}"]`);

    const handleClick = () => {
      to_hide?.classList.toggle("hidden");
    };

    header?.addEventListener("click", handleClick);

    return () => {
      header?.removeEventListener("click", handleClick);
    };
  }, [title]);

  return (
    <div className="bg-white rounded-lg shadow-md mb-8 border border-gray-200 overflow-hidden">
      <div
        data-title={`${title}header`}
        className="bg-[#2871F9] cursor-pointer text-white tracking-tight p-4 text-left font-bold text-xl sm:text-2xl"
        style={{ fontFamily: "Poppins, sans-serif" }}
      >
        {title}
      </div>
      <div className="p-6 pt-4" data-title={title}>
        {content}
      </div>
    </div>
  );
}

export default function Guidelines() {
  const discord = "https://discord.gg/eduvance-community-983670206889099264";

  return (
    <>
      <Home showExtra dontShowload/>
      <main className="min-h-screen bg-white flex flex-col items-center justify-start py-10 m-10">
        <div className="w-full max-w-5xl px-4">
          <div className='mb-8'>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-[#000000] text-left tracking-[-0.035em]" style={{ fontFamily: "Poppins, sans-serif" }}>
              <span className="bg-[#1A69FA] px-2 py-1 -rotate-1 inline-block"><span className="text-[#FFFFFF]">Terms</span></span> of Service 
            </h1>
            <p className='my-2'>Last Updated September 6th 2025</p>
            <p>By using Eduvance.au, you agree with these terms.</p>
          </div>
          <Guideline title="1. Basic Rules" content={
            <ul className="list-disc ml-10 space-y-2 text-left">
              <li>Adhere strictly to the laws of your country</li> 
              <li>Prohibited activities include spam, abuse, DDoS, and brute-forcing attempts on the platform or related platforms.</li>
              <li>Uploading content and links without the right to share or republish is prohibited, and such content will be removed.</li>
              <li>Any violation of the above terms may result in a possible suspension of access to the website’s contents.</li>
            </ul>
          }/> 
          <Guideline title="2. Accounts" content={<ul className="list-disc ml-10 space-y-2 text-left">
              <li>A valid email address is required for registration.</li> 
              <li>We are not responsible for the activities on your account; only you are responsible for the activities of your account.</li>
              <li>We reserve the right to terminate your account without prior notice if we find it unsuitable for usage.</li>
            </ul>}/> 
          <Guideline title="3. Content" content={<div>You retain ownership of anything you submit. <br/> By submitting content, you give us a non-exclusive, royalty-free license to:
            <ul className="list-disc ml-10 space-y-2 text-left">
              <li>You retain ownership of any data submitted to the website, assuming you are the true owner of the data.</li> 
              <li>By submitting content (i.e., documents, links, videos, etc.), excluding account details, you grant us a non-exclusive, royalty-free license to:</li>
              <ul className="list-disc ml-6 mt-2 space-y-1">
                <li>Display the content publicly.</li>
                <li>Modify the content, including watermarking.</li>
                <li>Share the content within the platform and related platforms.</li>
                <li>Submit the content elsewhere.</li>
                <li>Requests to remove content will be handled individually.</li>
                <li>You are not permitted to upload offensive or politically motivated content to the platform.</li>
              </ul>
            </ul>
          </div>
          }/> 
          <Guideline title="4. Copyright" content={<p>If content posted on the platform or related platforms is owned or copyrighted by you or your organization, please contact us</p>}/> 
          <Guideline title="5. Risk" content={<div>You retain ownership of anything you submit. <br/> By submitting content, you give us a non-exclusive, royalty-free license to:
            <ul className="list-disc ml-10 space-y-2 text-left">
              <li>This site is provided “as-is.” We make no guarantees about uptime, accuracy, or availability.</li>
              <li>By submitting content (i.e., documents, links, videos, etc.), excluding account details, you grant us a non-exclusive, royalty-free license to:</li>
              <li>Eduvance.au and related platforms are owned and maintained by students and non-professionals; please use them at your own risk.</li>
            </ul>
          </div>
          }/>
        </div>
      </main>
      <SmallFoot />
    </>
  );
}
