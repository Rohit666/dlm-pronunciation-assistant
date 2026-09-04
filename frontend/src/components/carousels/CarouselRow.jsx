import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Netflix-style horizontal carousel shell (SRS 4.2 "Dynamic Discovery
// Feeds"). No carousel library — a scroll-snap flex row with two
// scroll buttons, matching the rest of the app's dependency-light
// component style.
function CarouselRow({ title, subtitle, emptyMessage, children, itemCount }) {
  const scrollRef = useRef(null);

  const scrollBy = (delta) => {
    scrollRef.current?.scrollBy({ left: delta, behavior: "smooth" });
  };

  return (
    <div className="mb-10">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-800">{title}</h2>
          {subtitle && <p className="text-sm text-gray-500 mt-1">{subtitle}</p>}
        </div>

        {itemCount > 0 && (
          <div className="hidden sm:flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollBy(-320)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
              aria-label={`Scroll ${title} left`}
            >
              <ChevronLeft size={18} />
            </button>
            <button
              type="button"
              onClick={() => scrollBy(320)}
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-all cursor-pointer"
              aria-label={`Scroll ${title} right`}
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {itemCount === 0 ? (
        <div className="bg-white rounded-3xl shadow-sm p-8 text-center text-gray-400">
          {emptyMessage || "Nothing here yet"}
        </div>
      ) : (
        <div
          ref={scrollRef}
          className="flex gap-5 overflow-x-auto pb-2 snap-x snap-mandatory scroll-smooth [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
        >
          {children}
        </div>
      )}
    </div>
  );
}

export default CarouselRow;
