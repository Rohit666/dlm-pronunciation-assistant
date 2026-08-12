import { Search } from 'lucide-react';

function SearchInput({
  value,
  onChange,
  placeholder,
}) {
  return (
    <div className="relative">

      <Search
        size={18}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
      />

      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full md:w-80 pl-11 pr-4 py-3 rounded-2xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-300"
      />
    </div>
  );
}

export default SearchInput;