# Yêu cầu Thiết kế Giao diện (UI/UX Guidelines)

Bất cứ khi nào tạo hoặc sửa đổi Component giao diện, AI PHẢI tuân thủ nghiêm ngặt các quy tắc sau bằng Tailwind CSS:

## 1. Phong cách thiết kế cốt lõi (Design System)

- **Cảm hứng:** Tối giản (Minimalism), sạch sẽ, hiện đại (tương tự phong cách shadcn/ui hoặc Vercel Design).
- **Không gian (Spacing):** Sử dụng padding/margin rộng rãi (p-4, p-6, gap-6) để giao diện thoáng mắt, giúp làm nổi bật hình ảnh gạch men và sản phẩm.
- **Góc bo (Border Radius):** Đồng nhất sử dụng `rounded-lg` hoặc `rounded-xl` cho các thẻ sản phẩm (cards), hình ảnh, và nút bấm. Không dùng góc quá nhọn hoặc quá tròn.
- **Bóng đổ (Shadows):** Sử dụng bóng đổ rất nhẹ và mềm mại: `shadow-sm` cho trạng thái bình thường, `hover:shadow-md` cho trạng thái di chuột qua thẻ sản phẩm. Tránh dùng bóng đen đậm.

## 2. Hệ thống màu sắc (Color Palette)

- **Màu nền (Background):** `bg-slate-50` hoặc `bg-gray-50` cho nền trang chính. `bg-white` cho các khối nội dung (Cards, Sidebar, Header) để tạo sự tách biệt.
- **Màu văn bản (Text):** `text-slate-900` cho tiêu đề chính, `text-slate-600` hoặc `text-slate-500` cho mô tả phụ và quy cách sản phẩm.
- **Màu nhấn (Primary/Accent):** Sử dụng một tông màu xanh dương đậm (ví dụ: `bg-blue-600`, `text-blue-600`) cho các nút bấm chính (Call to Action), icon liên hệ, hoặc viền khi hover. Nó mang lại cảm giác tin cậy, vững chắc cho ngành vật liệu xây dựng.

## 3. Tương tác (Interactions & Animations)

- Mọi nút bấm, link, và thẻ sản phẩm phải có hiệu ứng chuyển đổi mượt mà: thêm class `transition-all duration-200 ease-in-out`.
- Khi hover vào thẻ sản phẩm: Hình ảnh bên trong có thể zoom nhẹ (`hover:scale-105`), thẻ hơi nổi lên (`hover:-translate-y-1`).

## 4. Bố cục đáp ứng (Responsive Grid)

- **Mobile (Mặc định):** Danh sách sản phẩm CHỈ hiển thị 1 cột (`grid-cols-1`). Các padding giảm xuống (p-3, p-4) để tiết kiệm không gian.
- **Tablet (md):** Hiển thị 2 hoặc 3 cột (`md:grid-cols-2` hoặc `md:grid-cols-3`).
- **Desktop (lg, xl):** Hiển thị 3 hoặc 4 cột (`lg:grid-cols-3 xl:grid-cols-4`).

## 5. Quy tắc Code Component

- Phân tách thành các component nhỏ, tái sử dụng được (ví dụ: `ProductCard.tsx`, `CategorySidebar.tsx`).
- Bắt buộc phải xử lý trạng thái Loading (dùng Skeleton loading) và Empty state (khi không tìm thấy sản phẩm nào).

