import React, { useEffect, useState, useRef } from 'react';
import { Award, Users, HeartHandshake, Star, Sparkles, ShieldCheck } from 'lucide-react';
import { RoyalCrestIcon, DiyaIcon } from '../ShahiIcons';

interface StatItem {
  id: string;
  target: number;
  suffix: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
}

const STATS: StatItem[] = [
  {
    id: 'invites',
    target: 500,
    suffix: '+',
    label: 'Royal Invitations Created',
    sublabel: 'Across Gujarat, Rajasthan & International Destination Weddings',
    icon: <RoyalCrestIcon className="w-6 h-6 text-[#C9A227]" />,
  },
  {
    id: 'guests',
    target: 10000,
    suffix: '+',
    label: 'Guests Delighted',
    sublabel: 'With interactive 3D gates, lossless shehnai audio & live GPS',
    icon: <Users className="w-6 h-6 text-[#C9A227]" />,
  },
  {
    id: 'rsvp',
    target: 98,
    suffix: '%',
    label: 'RSVP Response Rate',
    sublabel: 'Compared to standard paper cards with under 20% confirmation',
    icon: <HeartHandshake className="w-6 h-6 text-[#C9A227]" />,
  },
  {
    id: 'rating',
    target: 49, // 4.9 displayed
    suffix: '★',
    label: 'Couple Satisfaction Score',
    sublabel: 'Rated 4.9/5 by 380+ verified couples on Google & WhatsApp',
    icon: <Star className="w-6 h-6 text-[#C9A227]" />,
  },
];

export const WhyCouplesChooseStats: React.FC = () => {
  const [hasAnimated, setHasAnimated] = useState<boolean>(false);
  const [counts, setCounts] = useState<Record<string, number>>({
    invites: 0,
    guests: 0,
    rsvp: 0,
    rating: 0,
  });
  const sectionRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true);

          // Animate counters
          const duration = 1800; // ms
          const startTime = performance.now();

          const step = (currentTime: number) => {
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeOutProgress = 1 - Math.pow(1 - progress, 3); // cubic ease-out

            setCounts({
              invites: Math.floor(easeOutProgress * 500),
              guests: Math.floor(easeOutProgress * 10000),
              rsvp: Math.floor(easeOutProgress * 98),
              rating: Number((easeOutProgress * 4.9).toFixed(1)),
            });

            if (progress < 1) {
              requestAnimationFrame(step);
            } else {
              setCounts({
                invites: 500,
                guests: 10000,
                rsvp: 98,
                rating: 4.9,
              });
            }
          };

          requestAnimationFrame(step);
        }
      },
      { threshold: 0.25 }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, [hasAnimated]);

  return (
    <section ref={sectionRef} className="py-20 sm:py-28 px-4 sm:px-8 max-w-7xl mx-auto w-full font-hanken">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto mb-16">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EDE0C8] border border-[#C9A227]/60 text-[#741526] text-xs font-fraunces font-bold tracking-wider shadow-xs uppercase">
          <Award className="w-3.5 h-3.5 text-[#C9A227]" />
          <span>PROVEN ROYAL EXCELLENCE</span>
        </div>

        <h2 className="font-fraunces font-black text-3xl sm:text-5xl text-[#741526] tracking-tight">
          WHY COUPLES CHOOSE SHAHI STUDIO
        </h2>

        <p className="text-sm sm:text-base text-[#2B1714]/80 font-medium max-w-xl mx-auto leading-relaxed">
          Crafting unforgettable digital celebrations with the grandeur of Indian palace traditions and modern web engineering.
        </p>
      </div>

      {/* 4 Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat) => {
          let displayVal = `${counts[stat.id] || 0}`;
          if (stat.id === 'guests') {
            displayVal = `${(counts.guests || 0).toLocaleString('en-IN')}`;
          } else if (stat.id === 'rating') {
            displayVal = `${(counts.rating || 0).toFixed ? (counts.rating || 4.9).toFixed(1) : counts.rating}`;
          }

          return (
            <div
              key={stat.id}
              className="palace-bezel transition-transform duration-300 hover:-translate-y-1.5"
            >
              <div className="palace-bezel-inner p-6 sm:p-7 space-y-4 flex flex-col justify-between h-full text-center">
                <div className="mx-auto w-12 h-12 rounded-2xl bg-[#741526] border border-[#C9A227] flex items-center justify-center shadow-md">
                  {stat.icon}
                </div>

                <div className="space-y-1">
                  <div className="font-fraunces font-black text-3xl sm:text-4xl text-[#741526] tracking-tight">
                    <span>{displayVal}</span>
                    <span className="text-[#C9A227] font-serif">{stat.suffix}</span>
                  </div>

                  <h3 className="font-fraunces font-bold text-sm text-[#2B1714]">
                    {stat.label}
                  </h3>
                </div>

                <p className="text-[11px] text-[#8B7358] font-medium leading-relaxed pt-2 border-t border-[#D8C7AA]/50">
                  {stat.sublabel}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
