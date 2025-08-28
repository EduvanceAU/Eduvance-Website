// components/AutoScrollTestimonials.js
import React from 'react';
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';

const testimonials = [
  {
    content: "I joined Eduvance last year solely for the purpose of getting notes, however it truly is more than just an educational server. i think i've met some of the nicest people to ever exist, and i really am grateful for all of my friends there. the community in Eduvance is amazing, even the staff team; most of them are really kind and easy to get along with.",
    author: "vern 🌱, A2 Student",
    avatar: "/vern.webp"
  },
  {
    content: "Eduvance has been like a second-home to me since its early days. It has been my go-to place for useful resources including past papers and thanks to those, I have been able to achieve great results and give back as a community contributor! Definitely one of the warmest places for sharing, connecting and suffering school in this hellish journey of IGCSEs and IALs!",
    author: "Aeth_en 🎗️, A2 Student",
    avatar: "/aethen.webp"
  },
  {
    content: "I joined Eduvance back in November 2024, and it has helped me soo much in my IGCSE and a levels, a server full of lovely people and helpful staff, would definitely recommend Edexcel students to join and benefit immensely",
    author: "ThePearsonPrince, A2 Student",
    avatar: "/pearsonprince.webp"
  },
  {
    content: "Eduvance really saved my IGCSEs as I relied heavily on the community notes. The notes are of very high quality and well written. The staff team also helped me a lot by giving instant replies whenever I had queries or made a report. The helpers are talented and always quick to respond. I would love to contribute to Eduvance in more ways in the future.",
    author: "Ryan, A2 Student",
    avatar: "/ryan.webp"
  },
  {
    content: "With all honesty , Eduvance has genuinely helped me a lot especially when I gave my exams , the amount of help I got from people was unbelievable and the resources available made it easier for me to do really well , it’s genuinely amazing and the people are always supportive and welling to help in a matter of seconds , will forever be grateful for this community and I’m just trying my best to repay this amazing treatment that I’ve gotten over the years !",
    author: "! S, A2 Student",
    avatar: "/7elc.webp"
  },
];

const AutoScrollTestimonials = () => {
  const totalWidth = testimonials.length * (320 + 32) //mx-4 = 16+16=32px <- This is why 32 and 320 was chosen by Specter, thus the 320
  return (
    <div className="relative w-full overflow-hidden py-8 sm:py-12">
      <style jsx>{`@keyframes scroll-testimonials {
        from { 
          transform: translateX(0); 
        }
        to { 
          transform: translateX(-${totalWidth}px); 
        }
      }`}
    </style>
      {/* Container with a background color that the blur will match */}
      <div className="dark:bg-gray-800 rounded-lg p-6">
        
        {/* Container for the scrolling testimonials */}
        <div className="group relative select-none overflow-hidden pt-5 w-full">
          <div className="flex animate-scroll-testimonials group-hover:[animation-play-state:paused]">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={index}
                className="flex-shrink-0 inline-block w-80 min-w-[320px] max-w-xs mx-4 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg transition-transform transform hover:-translate-y-2.5 duration-300"
              >
                <div className="flex items-start mb-2">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.author}
                    width={50}
                    height={50}
                    className="rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <p className="font-semibold text-lg">{testimonial.author}</p>
                    <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                      <FaDiscord className="mr-1" />
                      Eduvance Member
                    </div>
                  </div>
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed break-words">
                  "{testimonial.content}"
                </p>
              </div>
            ))}
          </div>

          {/* Left-side blur overlay that matches the background color */}
          <div
            className="absolute top-0 left-0 h-full w-24 z-10 bg-gradient-to-r from-white dark:from-gray-800 via-transparent to-transparent"
          ></div>
          
          {/* Right-side blur overlay that matches the background color */}
          <div
            className="absolute top-0 right-0 h-full w-24 z-10 bg-gradient-to-l from-white dark:from-gray-800 via-transparent to-transparent"
          ></div>
        </div>
      </div>
    </div>
  );
};

export default AutoScrollTestimonials;