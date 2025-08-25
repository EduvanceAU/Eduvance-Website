// components/AutoScrollTestimonials.js
import React from 'react';
import Image from 'next/image';
import { FaDiscord } from 'react-icons/fa';

const testimonials = [
  {
    content: "Eduvance is honestly the best. The resources are amazing, and the community is so supportive. It's helped me so much with my studies.",
    author: "Alex, University Student",
    avatar: "/images/alex.png", // Replace with your image paths
  },
  {
    content: "I've never been part of a community that's so focused on helping each other out. The past papers and notes are a lifesaver.",
    author: "Samantha, High School Student",
    avatar: "/images/samantha.png", // Replace with your image paths
  },
  {
    content: "The Discord server is incredible. You can get help with any subject, and the staff are super friendly and helpful. Highly recommend!",
    author: "David, College Freshman",
    avatar: "/images/david.png", // Replace with your image paths
  },
  {
    content: "The quality of the notes and study guides is top-tier. I've seen a huge improvement in my grades since joining Eduvance.",
    author: "Jessica, Tutor",
    avatar: "/images/jessica.png", // Replace with your image paths
  },
  {
    content: "I love the new UI! It's so clean and easy to use. The platform has everything I need in one place.",
    author: "Michael, Developer",
    avatar: "/images/michael.png", // Replace with your image paths
  },
];

const AutoScrollTestimonials = () => {
  return (
    <div className="relative w-full overflow-hidden py-12">
      {/* Container with a background color that the blur will match */}
      <div className="dark:bg-gray-800 rounded-lg p-6">
        <h2 className="text-3xl font-bold text-center mb-10">
          What our community says
        </h2>
        
        {/* Container for the scrolling testimonials */}
        <div className="relative">
          <div className="flex animate-scroll-testimonials hover:animate-pause">
            {testimonials.concat(testimonials).map((testimonial, index) => (
              <div
                key={index}
                className="inline-block w-80 min-w-[320px] max-w-xs mx-4 p-6 bg-gray-100 dark:bg-gray-700 rounded-lg transition-transform transform hover:scale-105 duration-300"
              >
                <div className="flex items-start mb-4">
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