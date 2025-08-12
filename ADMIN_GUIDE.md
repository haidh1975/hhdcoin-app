# Hướng dẫn Quản lý Website HHDcoin

## Tổng quan
Hướng dẫn này giúp bạn quản lý nội dung và dữ liệu trên website HHDcoin.net sau khi deploy.

## 1. Quản lý Gói Đầu Tư

### Thêm/Chỉnh sửa Gói Đầu Tư
- **Vị trí file**: `server/storage.ts` - phần `initializeSamplePackages()`
- **Cách thêm gói mới**:
```typescript
{
  id: "enterprise", // ID duy nhất
  name: "Gói Doanh nghiệp", // Tên hiển thị
  minInvestment: "1000000000", // Số tiền tối thiểu (VNĐ)
  minRate: "15.00", // Lãi suất tối thiểu (%)
  maxRate: "25.00", // Lãi suất tối đa (%)
  features: [
    "Tư vấn 1-1 với chuyên gia",
    "Báo cáo thị trường hàng tuần",
    "Hỗ trợ 24/7"
  ],
  recommended: 0 // 1 = được đề xuất, 0 = bình thường
}
```

### Cập nhật Gói Đầu Tư
1. Mở file `server/storage.ts`
2. Tìm phần `initializeSamplePackages()`
3. Chỉnh sửa thông tin gói theo cần thiết
4. Restart server để áp dụng thay đổi

## 2. Quản lý Cộng Đồng

### Thêm Thành Viên Mẫu
- **Vị trí file**: `server/storage.ts` - phần `initializeSampleCommunityMembers()`
- **Cách thêm thành viên**:
```typescript
{
  id: randomUUID(),
  fullName: "Tên đầy đủ",
  email: "email@example.com",
  phone: "0987654321",
  avatar: null, // URL ảnh đại diện
  bio: "Mô tả ngắn về thành viên",
  interests: ["Bitcoin", "Blockchain", "Trading"],
  experienceLevel: "beginner", // beginner, intermediate, advanced, expert
  investmentFocus: ["Bitcoin", "Ethereum"],
  socialLinks: ["https://facebook.com/username"],
  location: "Thành phố",
  occupation: "Nghề nghiệp",
  totalInvestment: "100000000", // Tổng đầu tư (VNĐ)
  memberLevel: "Bronze", // Bronze, Silver, Gold, Diamond
  points: 100
}
```

### Quản lý Cấp Độ Thành Viên
- **Bronze**: 0-500 điểm
- **Silver**: 501-2000 điểm  
- **Gold**: 2001-5000 điểm
- **Diamond**: 5000+ điểm

## 3. Quản lý Bản Tin và Thông Tin

### Thêm Tin Tức Bitcoin
- **Vị trí**: Trang chủ hiển thị giá Bitcoin real-time
- **API endpoint**: `/api/bitcoin-real-data`
- **Dữ liệu**: Kết nối với CoinGecko API để lấy giá thực

### Cập nhật Phân Tích Thị Trường
- **Vị trí file**: `server/routes.ts` - endpoint `/api/market-analysis`
- **Cách cập nhật**:
```typescript
// Trong hàm getMarketAnalysis()
const analysis = {
  trend: "bullish", // bullish, bearish, neutral
  support: 115000, // Mức hỗ trợ
  resistance: 125000, // Mức kháng cự
  prediction: "Dự đoán xu hướng...",
  confidence: 85, // Độ tin cậy (%)
  lastUpdated: new Date()
};
```

## 4. Cập nhật Nội Dung Trang Web

### Chỉnh sửa Trang Chủ
- **File**: `client/src/pages/home.tsx`
- **Các phần có thể cập nhật**:
  - Hero section (tiêu đề, mô tả)
  - Thống kê platform
  - Câu chuyện thành công

### Cập nhật Navigation
- **File**: `client/src/components/navigation.tsx`
- **Thêm menu mới**:
```tsx
<Link href="/tin-tuc" className="nav-link">Tin tức</Link>
```

### Chỉnh sửa Footer
- **File**: `client/src/components/footer.tsx`
- **Cập nhật thông tin liên hệ, social links**

## 5. Quy Trình Deploy và Cập Nhật

### Lần đầu Deploy
1. Click nút "Deploy" trong Replit
2. Chọn deployment type (Autoscale khuyến nghị)
3. Cấu hình domain hhdcoin.net
4. Thêm DNS records từ domain provider

### Cập nhật sau Deploy
1. Chỉnh sửa code trong Replit
2. Replit tự động rebuild và deploy
3. Thay đổi có hiệu lực trong vài phút

## 6. Bảo mật và Backup

### Environment Variables
- `DATABASE_URL`: Kết nối database
- `NODE_ENV`: production
- Các API keys (nếu cần)

### Backup Dữ liệu
- Database được backup tự động bởi Neon
- Code được lưu trên Replit Git
- Export dữ liệu quan trọng định kỳ

## 7. Monitoring và Analytics

### Theo dõi Performance
- Replit cung cấp logs và metrics
- Monitor API response times
- Theo dõi user traffic

### Error Handling
- Logs lỗi trong Replit Console
- Error notifications qua email
- Fallback data khi API fail

## 8. Liên hệ Hỗ trợ

### Technical Issues
- Replit Support: support@replit.com
- Database: Neon support
- Domain: Domain registrar support

### Content Updates
- File locations như hướng dẫn trên
- Test trên development trước khi deploy
- Backup trước khi thay đổi lớn

---

**Lưu ý**: Luôn test thay đổi trên development environment trước khi deploy production.