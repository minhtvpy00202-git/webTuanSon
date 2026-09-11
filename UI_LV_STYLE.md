# Louis Vuitton AI Design Guidelines (UI/UX)

Bất cứ khi nào tạo hoặc sửa đổi Component giao diện, AI PHẢI tuân thủ nghiêm ngặt các quy tắc sau để tái tạo phong cách sang trọng, tối giản, và "không màu sắc" (achromatic) của Louis Vuitton:

## 1. Phong cách thiết kế cốt lõi (Core Aesthetics)
- **Tư duy:** "Sân khấu đen" (Dark Stage). Coi giao diện kỹ thuật số là một khung hình tối giản để làm nổi bật hình ảnh sản phẩm. Loại bỏ mọi trang trí không cần thiết.
- **Không gian (Spacing):** Sử dụng các khoảng trắng rộng rãi (generous whitespace), p-6, p-8, gap-8 để tạo cảm giác thoáng đạt, editorial.
- **Góc bo (Border Radius):** Hoàn toàn KHÔNG bo góc (`zero border-radius throughout`). Mọi thứ phải là góc vuông để tạo sự chính xác, cổ điển và có thể lưu trữ.
- **Màu sắc (Color Palette - Achromatic):**
    - **Nền (Background):** `bg-black` (màu đen sậm) cho nền trang chính (Hero section). `bg-white` cho các khối nội dung.
    - **Văn bản (Text):** `text-white` (trên nền đen), `text-black` (trên nền trắng).
    - **Điểm nhấn (Accent):** CHỈ xuất hiện trong hình ảnh sản phẩm (màu vàng kim/nâu da của Monogram Canvas), giao diện kỹ thuật số không sử dụng màu nhấn khác.

## 2. Hệ thống phông chữ (Typography)
- **Phông chữ chủ đạo:** Sử dụng phông chữ không chân (sans-serif) Regular Regular regular với trọng lượng duy nhất (weight 400).
- **Quy tắc phông chữ (Tailwind):**
    - `font-normal` (trọng lượng Regular 400) cho toàn bộ tiêu đề, nội dung và hiển thị. Không dùng chữ đậm (bold).
    - `tracking-[0.4px]` (khoảng cách chữ rộng) cho mọi văn bản hiển thị để tạo cảm giác sang trọng.
    - `text-2xl` đến `text-4xl` cho tiêu đề lớn, `text-base` cho nội dung, `text-sm` cho mô tả phụ.

## 3. Thành phần giao diện (UI Components & Layout)
- **Header:** Tối giản. Logo 'LOUIS VUITTON' bằng chữ không chân, in hoa, màu trắng/đen. Menu Hamburger và Giỏ hàng đơn giản.
- **Hero Section (Bố cục):** Phải là một hình ảnh editorial lớn, full-bleed (tràn viền), chất lượng cao của sản phẩm, đặt trên nền đen. Văn bản trắng, mỏng, nổi lên trên hình ảnh.
- **Nút bấm (Buttons):**
    - **Nút chính (Primary):** `bg-white`, `text-black`, `border-black`, `rounded-none`, `transition-all`.
    - **Nút phụ (Secondary):** `bg-transparent`, `text-white`, `border-white`, `rounded-none`, `transition-all`.
- **Thẻ sản phẩm (Product Cards):** `rounded-none`, `shadow-none`, nền trắng, ảnh sản phẩm lớn, tiêu đề Regular.

## 4. Hiệu ứng động (Transitions & Animations)
- **Cảm giác:** Tinh tế, mượt mà, sang trọng, không phô trương.
- **Hiệu ứng Tailwind:**
    - `transition-all duration-300 ease-in-out`.
    - `hover:opacity-70` cho các đường link và icon.
    - `hover:scale-105` cho hình ảnh sản phẩm (subtle zoom).
    - Sử dụng hiệu ứng `Fade-in` mượt mà cho các phần nội dung mới xuất hiện khi cuộn trang.

## 5. Quy tắc Code & Component
- Tất cả các class Tailwind phải ưu tiên sử dụng giá trị chính xác (`w-[100px]`, `text-[24px]`) thay vì các giá trị tương đối (`w-full`, `text-2xl`) để đảm bảo tính editorial.
- Ưu tiên sử dụng thẻ `<Image />` của Next.js (next/image) với các thuộc tính tối ưu (priority, quality={100}) cho hình ảnh sản phẩm.