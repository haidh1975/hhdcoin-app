'use client';

import { GraduationCap, Clock, Users, Star, CheckCircle, ArrowRight, PlayCircle, Award } from 'lucide-react';

const COURSES = [
  {
    id: 1,
    title: 'Crypto Cơ Bản cho Người Mới',
    description: 'Hiểu blockchain, Bitcoin, altcoin từ con số 0. Không cần kiến thức kỹ thuật trước.',
    level: 'Cơ bản',
    duration: '8 giờ',
    students: 1240,
    rating: 4.9,
    price: 499000,
    originalPrice: 990000,
    color: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    badge: 'Phổ biến nhất',
    topics: ['Blockchain là gì?', 'Cách mua Bitcoin lần đầu', 'Ví crypto & bảo mật', 'Sàn giao dịch uy tín'],
  },
  {
    id: 2,
    title: 'Chiến Lược DCA & Đầu Tư Dài Hạn',
    description: 'Xây dựng danh mục đầu tư bền vững với kỹ thuật Dollar-Cost Averaging chuyên nghiệp.',
    level: 'Trung cấp',
    duration: '12 giờ',
    students: 876,
    rating: 4.8,
    price: 799000,
    originalPrice: 1590000,
    color: 'from-brand/20 to-brand/10',
    border: 'border-brand/30',
    badge: 'Khuyến nghị',
    topics: ['Nguyên lý DCA', 'Chọn coin để DCA', 'Quản lý cảm xúc', 'Tái cân bằng danh mục'],
  },
  {
    id: 3,
    title: 'Phân Tích Kỹ Thuật (TA) Nâng Cao',
    description: 'Đọc chart, nhận diện pattern, sử dụng chỉ báo RSI, MACD, Bollinger Bands thành thạo.',
    level: 'Nâng cao',
    duration: '20 giờ',
    students: 543,
    rating: 4.7,
    price: 1299000,
    originalPrice: 2500000,
    color: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30',
    badge: null,
    topics: ['Nến Nhật Bản', 'Support & Resistance', 'Chỉ báo động lượng', 'Trading plan thực chiến'],
  },
  {
    id: 4,
    title: 'AI Trading & Tự Động Hóa',
    description: 'Tận dụng AI HHD-I để tự động hóa giao dịch, thiết lập bot DCA, phân tích tâm lý thị trường.',
    level: 'Nâng cao',
    duration: '15 giờ',
    students: 320,
    rating: 5.0,
    price: 1499000,
    originalPrice: 2990000,
    color: 'from-green-500/20 to-green-600/10',
    border: 'border-green-500/30',
    badge: 'Mới nhất',
    topics: ['Sử dụng AI Assistant', 'Thiết lập DCA tự động', 'Đọc tín hiệu Sentiment', 'Quản lý rủi ro AI'],
  },
];

const LEVEL_COLORS: Record<string, string> = {
  'Cơ bản': 'bg-blue-500/20 text-blue-400',
  'Trung cấp': 'bg-brand/20 text-brand',
  'Nâng cao': 'bg-purple-500/20 text-purple-400',
};

export default function DaoTaoPage() {
  return (
    <div className="p-6 space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Đào Tạo</h1>
          <p className="text-dark-400 mt-1">Học đầu tư crypto bài bản từ chuyên gia thực chiến</p>
        </div>
        <div className="flex items-center gap-2 bg-brand/10 border border-brand/30 rounded-lg px-4 py-2">
          <Award className="w-4 h-4 text-brand" />
          <span className="text-sm text-brand font-medium">Chứng chỉ hoàn thành</span>
        </div>
      </div>

      {/* Stats Banner */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Học viên', value: '3.000+', icon: Users },
          { label: 'Khóa học', value: '4 khóa', icon: GraduationCap },
          { label: 'Đánh giá TB', value: '4.85 ★', icon: Star },
        ].map((stat) => (
          <div key={stat.label} className="bg-dark-700 rounded-xl p-4 flex items-center gap-3 border border-dark-600">
            <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
              <stat.icon className="w-5 h-5 text-brand" />
            </div>
            <div>
              <p className="text-xl font-bold text-white">{stat.value}</p>
              <p className="text-xs text-dark-400">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {COURSES.map((course) => (
          <div
            key={course.id}
            className={`bg-gradient-to-br ${course.color} border ${course.border} rounded-2xl p-5 flex flex-col gap-4 hover:scale-[1.01] transition-transform cursor-pointer`}
          >
            {/* Top row */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${LEVEL_COLORS[course.level]}`}>
                  {course.level}
                </span>
                {course.badge && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-dark-800/60 text-white">
                    {course.badge}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-brand text-sm font-semibold">
                <Star className="w-3.5 h-3.5 fill-brand" />
                {course.rating}
              </div>
            </div>

            {/* Title & Desc */}
            <div>
              <h3 className="text-white font-bold text-lg leading-snug">{course.title}</h3>
              <p className="text-dark-300 text-sm mt-1.5 leading-relaxed">{course.description}</p>
            </div>

            {/* Topics */}
            <ul className="grid grid-cols-2 gap-1.5">
              {course.topics.map((topic) => (
                <li key={topic} className="flex items-center gap-1.5 text-xs text-dark-300">
                  <CheckCircle className="w-3 h-3 text-brand flex-shrink-0" />
                  {topic}
                </li>
              ))}
            </ul>

            {/* Meta */}
            <div className="flex items-center gap-4 text-xs text-dark-400">
              <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{course.duration}</span>
              <span className="flex items-center gap-1"><Users className="w-3 h-3" />{course.students.toLocaleString()} học viên</span>
              <span className="flex items-center gap-1"><PlayCircle className="w-3 h-3" />Video online</span>
            </div>

            {/* Price & CTA */}
            <div className="flex items-center justify-between pt-2 border-t border-white/10">
              <div>
                <span className="text-xl font-bold text-brand">
                  {course.price.toLocaleString('vi-VN')}đ
                </span>
                <span className="text-dark-500 line-through text-sm ml-2">
                  {course.originalPrice.toLocaleString('vi-VN')}đ
                </span>
              </div>
              <button className="flex items-center gap-2 bg-brand text-black font-semibold text-sm px-4 py-2 rounded-lg hover:bg-brand-dark transition-colors">
                Đăng ký
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* CTA Banner */}
      <div className="bg-gradient-to-r from-brand/20 to-brand/5 border border-brand/30 rounded-2xl p-6 flex items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-lg">Không chắc bắt đầu từ đâu?</h3>
          <p className="text-dark-300 text-sm mt-1">Liên hệ trực tiếp với thầy Đỗ Hữu Hải để được tư vấn miễn phí.</p>
        </div>
        <a
          href="/lien-he"
          className="flex items-center gap-2 bg-brand text-black font-semibold px-5 py-2.5 rounded-lg hover:bg-brand-dark transition-colors whitespace-nowrap"
        >
          Tư vấn miễn phí <ArrowRight className="w-4 h-4" />
        </a>
      </div>
    </div>
  );
}
