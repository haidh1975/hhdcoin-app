'use client';

import { BookOpen, Star, ExternalLink, Tag, Bookmark, TrendingUp } from 'lucide-react';

const BOOKS = [
  {
    id: 1,
    title: 'Đầu Tư Crypto Thông Minh',
    author: 'Đỗ Hữu Hải',
    description: 'Hướng dẫn toàn diện từ cơ bản đến nâng cao về đầu tư crypto. Bao gồm chiến lược DCA, quản lý rủi ro, và tâm lý đầu tư cho người Việt.',
    category: 'Tác giả',
    rating: 4.9,
    reviews: 312,
    pages: 280,
    year: 2024,
    cover: '📗',
    tags: ['Crypto', 'DCA', 'Quản lý rủi ro'],
    link: '#',
    featured: true,
    badge: 'Của tác giả',
    badgeColor: 'bg-brand/20 text-brand border border-brand/30',
  },
  {
    id: 2,
    title: 'Tự Do Tài Chính Với Crypto',
    author: 'Đỗ Hữu Hải',
    description: 'Lộ trình 12 tháng để đạt tự do tài chính thông qua đầu tư tài sản số. Câu chuyện thực tế và chiến lược đã được kiểm chứng.',
    category: 'Tác giả',
    rating: 4.8,
    reviews: 198,
    pages: 220,
    year: 2023,
    cover: '📘',
    tags: ['Tài chính cá nhân', 'Lộ trình', 'Thực chiến'],
    link: '#',
    featured: true,
    badge: 'Của tác giả',
    badgeColor: 'bg-brand/20 text-brand border border-brand/30',
  },
  {
    id: 3,
    title: 'The Bitcoin Standard',
    author: 'Saifedean Ammous',
    description: 'Cuốn sách gốc về lý thuyết tiền tệ Bitcoin. Giải thích tại sao Bitcoin là dạng tiền tốt nhất từng tồn tại qua lăng kính kinh tế học Áo.',
    category: 'Kinh điển',
    rating: 4.8,
    reviews: 15600,
    pages: 304,
    year: 2018,
    cover: '📙',
    tags: ['Bitcoin', 'Kinh tế học', 'Lý thuyết'],
    link: '#',
    featured: false,
    badge: 'Phải đọc',
    badgeColor: 'bg-purple-500/20 text-purple-400 border border-purple-500/30',
  },
  {
    id: 4,
    title: 'Layered Money',
    author: 'Nik Bhatia',
    description: 'Giải thích hệ thống tiền tệ phân lớp và vị trí của Bitcoin trong trật tự tài chính toàn cầu mới. Dễ đọc, dễ hiểu.',
    category: 'Kinh điển',
    rating: 4.7,
    reviews: 3400,
    pages: 192,
    year: 2021,
    cover: '📕',
    tags: ['Bitcoin', 'Hệ thống tài chính', 'Macro'],
    link: '#',
    featured: false,
    badge: null,
    badgeColor: '',
  },
  {
    id: 5,
    title: 'Nhà Đầu Tư Thông Minh',
    author: 'Benjamin Graham',
    description: 'Kinh thánh của đầu tư giá trị. Dù viết cho chứng khoán truyền thống, nguyên lý vẫn áp dụng hoàn toàn được cho crypto dài hạn.',
    category: 'Tài chính',
    rating: 4.9,
    reviews: 28000,
    pages: 640,
    year: 1949,
    cover: '📒',
    tags: ['Đầu tư giá trị', 'Tâm lý', 'Kinh điển'],
    link: '#',
    featured: false,
    badge: 'Kinh điển',
    badgeColor: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
  },
  {
    id: 6,
    title: 'Tư Duy Nhanh và Chậm',
    author: 'Daniel Kahneman',
    description: 'Khám phá hai hệ thống tư duy ảnh hưởng đến mọi quyết định tài chính. Đọc cuốn này để hiểu tại sao bạn FOMO và panic sell.',
    category: 'Tâm lý',
    rating: 4.7,
    reviews: 42000,
    pages: 499,
    year: 2011,
    cover: '📓',
    tags: ['Tâm lý học', 'Ra quyết định', 'Hành vi'],
    link: '#',
    featured: false,
    badge: null,
    badgeColor: '',
  },
];

const CATEGORIES = ['Tất cả', 'Tác giả', 'Kinh điển', 'Tài chính', 'Tâm lý'];

export default function SachPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Thư Viện Sách</h1>
          <p className="text-dark-400 mt-1">Sách của tác giả & tài liệu nền tảng cho nhà đầu tư</p>
        </div>
        <div className="flex items-center gap-2 bg-dark-700 border border-dark-600 rounded-lg px-4 py-2">
          <BookOpen className="w-4 h-4 text-brand" />
          <span className="text-sm text-dark-300">{BOOKS.length} đầu sách</span>
        </div>
      </div>

      {/* Featured — Author books */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-brand" />
          <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Sách của Đỗ Hữu Hải</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {BOOKS.filter((b) => b.featured).map((book) => (
            <div
              key={book.id}
              className="bg-gradient-to-br from-brand/10 to-dark-800 border border-brand/30 rounded-2xl p-5 flex gap-4 hover:border-brand/50 transition-all"
            >
              <div className="text-5xl flex-shrink-0 mt-1">{book.cover}</div>
              <div className="flex-1 space-y-2">
                <div className="flex items-start gap-2">
                  <div className="flex-1">
                    <h3 className="text-white font-bold leading-snug">{book.title}</h3>
                    <p className="text-brand text-sm font-medium mt-0.5">{book.author}</p>
                  </div>
                  {book.badge && (
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full flex-shrink-0 ${book.badgeColor}`}>
                      {book.badge}
                    </span>
                  )}
                </div>
                <p className="text-dark-300 text-sm leading-relaxed">{book.description}</p>
                <div className="flex items-center gap-3 text-xs text-dark-400">
                  <span className="flex items-center gap-1 text-brand font-medium">
                    <Star className="w-3 h-3 fill-brand" />
                    {book.rating}
                  </span>
                  <span>{book.pages} trang</span>
                  <span>{book.year}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {book.tags.map((tag) => (
                    <span key={tag} className="text-xs bg-dark-700 border border-dark-600 text-dark-400 px-2 py-0.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
                <a
                  href={book.link}
                  className="inline-flex items-center gap-1.5 text-sm text-brand hover:text-brand-dark font-medium mt-1 transition-colors"
                >
                  <Bookmark className="w-3.5 h-3.5" />
                  Xem & đặt mua
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category filter */}
      <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-dark-700">
        <Tag className="w-4 h-4 text-dark-500" />
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className="text-sm px-3 py-1.5 rounded-full font-medium bg-dark-700 text-dark-400 hover:text-white border border-dark-600 hover:border-brand/40 transition-all"
          >
            {cat}
          </button>
        ))}
      </div>

      {/* All books */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {BOOKS.filter((b) => !b.featured).map((book) => (
          <div
            key={book.id}
            className="bg-dark-800 border border-dark-600 rounded-xl p-5 flex flex-col gap-3 hover:border-dark-500 transition-all group"
          >
            <div className="flex items-start gap-3">
              <div className="text-4xl">{book.cover}</div>
              <div className="flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-white font-semibold text-sm leading-snug group-hover:text-brand transition-colors">
                    {book.title}
                  </h3>
                  {book.badge && (
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full flex-shrink-0 ${book.badgeColor}`}>
                      {book.badge}
                    </span>
                  )}
                </div>
                <p className="text-dark-400 text-xs mt-0.5">{book.author}</p>
              </div>
            </div>
            <p className="text-dark-300 text-xs leading-relaxed">{book.description}</p>
            <div className="flex items-center gap-3 text-xs text-dark-500">
              <span className="flex items-center gap-1 text-brand font-medium">
                <Star className="w-3 h-3 fill-brand" /> {book.rating}
              </span>
              <span>{book.pages}tr</span>
              <span>{book.year}</span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {book.tags.map((tag) => (
                <span key={tag} className="text-xs bg-dark-700 text-dark-500 px-2 py-0.5 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
            <a
              href={book.link}
              className="flex items-center gap-1.5 text-xs text-dark-400 hover:text-brand transition-colors mt-auto"
            >
              <ExternalLink className="w-3 h-3" /> Xem chi tiết
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
