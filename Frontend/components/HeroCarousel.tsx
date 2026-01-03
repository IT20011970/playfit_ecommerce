import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ShoppingBag, Zap } from 'lucide-react';

interface CarouselSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  ctaText: string;
  category: 'all' | 'men' | 'women' | 'kids' | 'accessories';
  color: string;
}

const slides: CarouselSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    title: 'Level Up Your Game',
    subtitle: 'Discover high-performance sport wears for every athlete.',
    ctaText: 'Shop Now',
    category: 'all',
    color: 'from-blue-600 to-indigo-900'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1517466787929-bc90951d0974?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    title: 'Dominate The Field',
    subtitle: 'Premium athletic gear designed for maximum endurance.',
    ctaText: 'Browse Men\'s',
    category: 'men',
    color: 'from-orange-600 to-red-900'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1518310383802-640c2de311b2?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    title: 'Unleash Your Power',
    subtitle: 'Style meets performance in our latest women\'s collection.',
    ctaText: 'Browse Women\'s',
    category: 'women',
    color: 'from-purple-600 to-pink-900'
  },
  {
    id: '4',
    image: 'https://images.unsplash.com/photo-1519340241574-2cec6aef0c01?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    title: 'Future Champions',
    subtitle: 'Comfortable and durable sportswear for active kids.',
    ctaText: 'Browse Kids',
    category: 'kids',
    color: 'from-green-600 to-teal-900'
  },
  {
    id: '5',
    image: 'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?ixlib=rb-1.2.1&auto=format&fit=crop&w=1950&q=80',
    title: 'Essential Gear',
    subtitle: 'The perfect accessories to complement your workout.',
    ctaText: 'Browse Accessories',
    category: 'accessories',
    color: 'from-yellow-600 to-orange-900'
  }
];

interface HeroCarouselProps {
  initialCategory?: string;
}

export const HeroCarousel: React.FC<HeroCarouselProps> = ({ initialCategory }) => {
  const navigate = useNavigate();
  const getInitialIndex = () => {
    if (!initialCategory) return 0;
    const index = slides.findIndex(s => s.category === initialCategory.toLowerCase());
    return index !== -1 ? index : 0;
  };

  const [currentIndex, setCurrentIndex] = useState(getInitialIndex);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  // Update index if initialCategory changes (e.g. navigation)
  useEffect(() => {
    setCurrentIndex(getInitialIndex());
  }, [initialCategory]);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % slides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying]);

  const handleManualChange = (index: number) => {
    setIsAutoPlaying(false);
    setCurrentIndex(index);
    // Resume autoplay after 10 seconds of inactivity
    setTimeout(() => setIsAutoPlaying(true), 10000);
  };

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative h-[600px] w-full overflow-hidden rounded-2xl shadow-2xl mb-12 group">
      {/* Background Images with Crossfade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={currentSlide.id}
          initial={{ opacity: 0, scale: 1.1 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0"
        >
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${currentSlide.image})` }}
          />
          {/* Gradient Overlay */}
          <div className={`absolute inset-0 bg-gradient-to-r ${currentSlide.color} opacity-80 mix-blend-multiply`} />
          <div className="absolute inset-0 bg-black/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative z-10 h-full container mx-auto px-6 md:px-12 flex flex-col justify-center items-start text-white">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide.id + '-content'}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="max-w-3xl"
          >
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="flex items-center gap-2 mb-4 text-yellow-400 font-bold uppercase tracking-wider text-sm"
            >
              <Zap className="w-5 h-5" />
              <span>{currentSlide.category === 'all' ? 'Premium Collection' : `${currentSlide.category} Collection`}</span>
            </motion.div>

            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 leading-tight tracking-tight drop-shadow-lg">
              {currentSlide.title}
            </h1>

            <p className="text-xl md:text-2xl text-gray-100 mb-8 font-light max-w-xl leading-relaxed drop-shadow-md">
              {currentSlide.subtitle}
            </p>

            <motion.button
              onClick={(e) => {
                e.preventDefault();
                if (currentSlide.category === 'all') {
                  const element = document.getElementById('products');
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                } else {
                  navigate(`/${currentSlide.category}`);
                }
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center gap-3 bg-white text-black font-bold py-4 px-10 rounded-full text-lg shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)] transition-all duration-300 cursor-pointer"
            >
              <ShoppingBag className="w-5 h-5" />
              {currentSlide.ctaText}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </motion.button>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Category Tabs / Navigation Controls */}
      <div className="absolute bottom-8 left-0 right-0 z-20">
        <div className="container mx-auto px-6 md:px-12">
          <div className="flex flex-wrap gap-4 items-center">
            {slides.map((slide, index) => (
              <button
                key={slide.id}
                onClick={() => handleManualChange(index)}
                className={`
                  relative px-6 py-3 rounded-full text-sm font-bold transition-all duration-300 backdrop-blur-md capitalize
                  ${currentIndex === index
                    ? 'bg-white text-black scale-110 shadow-lg'
                    : 'bg-white/10 text-white hover:bg-white/20 hover:scale-105 border border-white/20'}
                `}
              >
                {slide.category === 'all' ? 'All' : slide.category}
                {currentIndex === index && (
                  <motion.div
                    layoutId="active-pill"
                    className="absolute inset-0 rounded-full border-2 border-white/50"
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            ))}

            {/* Progress indicators - cosmetic mainly, showing active slide */}
            <div className="flex-1" />
            <div className="flex gap-2">
              {slides.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${currentIndex === idx ? 'w-12 bg-white' : 'w-4 bg-white/30'}`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
