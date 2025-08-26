// components/AutoScrollTestimonials.js
import React from 'react';
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';

const testimonials = [
  {
    content: "Eduvance is honestly the best. The resources are amazing, and the community is so supportive. It's helped me so much with my studies.",
    author: "Alex, University Student",
    avatar: "/bio.png"
  },
  {
    content: "I've never been part of a community that's so focused on helping each other out. The past papers and notes are a lifesaver.",
    author: "Samantha, High School Student",
    avatar: "/bio.png"
  },
  {
    content: "The Discord server is incredible. You can get help with any subject, and the staff are super friendly and helpful. Highly recommend!",
    author: "David, College Freshman",
    avatar: "/bio.png"
  },
  {
    content: "The quality of the notes and study guides is top-tier. I've seen a huge improvement in my grades since joining Eduvance.",
    author: "Jessica, Tutor",
    avatar: "/bio.png"
  },
  {
    content: "I love the new UI! It's so clean and easy to use. The platform has everything I need in one place.",
    author: "Michael, Developer",
    avatar: "/bio.png"
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
        <h2 className="text-3xl font-bold text-center mb-5">
          What our community says
        </h2>
        
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