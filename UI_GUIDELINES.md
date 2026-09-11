# AI UI Brief: Giao Diện Theo Phong Cách MHV Cho Website Cửa Hàng Vật Liệu Xây Dựng

## Mục tiêu

Hãy thiết kế giao diện cho một website cửa hàng vật liệu xây dựng theo đúng tinh thần thẩm mỹ của dự án MHV hiện tại, nhưng áp dụng cho bối cảnh thương mại điện tử và quản trị nội dung doanh nghiệp.

Website gồm:

- Trang chủ
- Trang sản phẩm
- Trang chi tiết sản phẩm
- Trang giới thiệu
- Trang liên hệ
- Trang admin CRUD sản phẩm
- Trang admin CRUD loại sản phẩm
- Trang admin CRUD thông tin doanh nghiệp
- Trang admin CRUD liên hệ

Không áp dụng các yêu cầu liên quan đến PWA, offline, install prompt, service worker, app shell mobile-first kiểu ứng dụng quét QR.

***

## Tinh thần giao diện cần giữ

Giao diện phải mang cảm giác:

- Sạch, hiện đại, sáng sủa
- Tin cậy, thực dụng, dễ thao tác
- Nhiều khoảng trắng, ít trang trí thừa
- Thân thiện với người dùng phổ thông
- Màu nhấn rõ ràng nhưng không gắt
- Có dark mode đồng bộ
- Admin và website public cùng một hệ thiết kế, chỉ khác mức độ trang trọng và cách tổ chức nội dung

Ưu tiên bố cục dọc, rõ tầng thông tin, tránh chia quá nhiều cột nhỏ gây rối mắt.

***

## Design DNA cần sao chép từ dự án này

### 1. Màu sắc

Giữ hệ màu gần giống dự án MHV:

- Màu thương hiệu chính: `#F27024`
- Màu thương hiệu hover/darker: `#D25A15`
- Nền sáng chính: `slate-50` / `#f8fafc`
- Chữ chính sáng: `slate-900`
- Chữ phụ sáng: `slate-500` đến `slate-600`
- Nền tối chính: `slate-950` / `#020617`
- Surface tối phụ: `slate-900` hoặc `slate-800`
- Border sáng: `slate-200`
- Border tối: `slate-700` hoặc `slate-800`

Vai trò màu:

- Cam thương hiệu dùng cho CTA chính, trạng thái focus, liên kết nổi bật, badge nhấn, icon hành động chính
- Không lạm dụng nền cam đặc; ưu tiên nền trắng hoặc slate sáng, chỉ dùng cam để dẫn hướng
- Các trạng thái semantic dùng màu dịu kiểu Tailwind:
  - thành công: emerald
  - cảnh báo: amber
  - lỗi: rose/red
  - thông tin: blue

### 2. Font chữ

Dùng font hệ thống kiểu sans-serif hiện đại:

`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif`

Yêu cầu typography:

- Heading đậm, rõ, dễ đọc
- Body text vừa phải, không quá nhỏ
- Không dùng font trang trí cho nội dung chính
- Số liệu, giá tiền, thống kê nên dùng kiểu tabular nếu cần so hàng

### 3. Bo góc và cảm giác khối

Giữ phong cách bo góc mềm như dự án này:

- Card chính: `rounded-2xl`
- Modal lớn: `rounded-[28px]` hoặc `rounded-3xl`
- Input/button thường: `rounded-lg` đến `rounded-xl`
- Badge/chip: `rounded-full`

Phong cách khối:

- Card trắng trên nền sáng
- Có border mảnh
- Shadow vừa phải, không quá nặng
- Giao diện nhìn “gọn và sạch”, không bóng bẩy quá mức

### 4. Border, shadow, spacing

Ưu tiên:

- Border rõ hơn shadow
- Shadow nhẹ: `shadow-sm`, `shadow-lg`, `shadow-2xl` chỉ dùng cho modal hoặc dropdown
- Spacing rộng rãi, đặc biệt ở card, section, form
- Khoảng cách dọc giữa các section phải thoáng

***

## Hệ thống component cần làm theo

### 1. Buttons

#### Primary button

- Nền cam thương hiệu
- Chữ trắng
- Hover đậm hơn
- Dùng cho: `Xem sản phẩm`, `Liên hệ ngay`, `Lưu`, `Thêm mới`

Ví dụ class tinh thần:

`bg-fptOrange text-white hover:bg-fptOrangeDark rounded-lg px-4 py-2 font-semibold`

#### Secondary button

- Nền trắng hoặc slate rất nhạt
- Border `slate-300`
- Text `slate-700`
- Hover `slate-100`

#### Destructive button

- Border đỏ nhạt hoặc nền đỏ
- Dùng tiết chế cho xóa, hủy

### 2. Inputs và form

Input cần giống tinh thần dự án này:

- Nền trắng
- Border `slate-300`
- Focus border cam
- Focus ring cam mờ
- Placeholder `slate-400`
- Dark mode vẫn phải rõ chữ, rõ border

Form layout:

- Label ở trên
- Input ở dưới
- Khoảng cách đều
- Các form CRUD admin nên dùng grid 2 cột ở desktop, 1 cột ở mobile
- Các form public như liên hệ nên đơn giản, thoáng, ít field trên một hàng

### 3. Cards

Card là đơn vị hiển thị chính.

Public pages:

- Card sản phẩm
- Card danh mục nổi bật
- Card thông tin dịch vụ
- Card thông tin liên hệ

Admin pages:

- Card bộ lọc
- Card bảng dữ liệu
- Card form chi tiết
- Card KPI nhỏ nếu có dashboard

Cấu trúc card nên là:

- Header ngắn gọn
- Body rõ nội dung
- Footer chỉ khi thật cần

### 4. Modals

Modal phải theo phong cách hiện tại của dự án MHV:

- Overlay tối mờ kiểu `bg-slate-900/60` hoặc `bg-slate-950/70`
- Có `backdrop-blur-sm` nếu phù hợp
- Modal nền trắng ở light mode, `slate-950` ở dark mode
- Bo góc lớn
- Header rõ tiêu đề
- Footer hành động đơn giản

Không dùng `alert()`, `confirm()`, popup trình duyệt mặc định cho xác nhận xóa, đóng form, từ chối thao tác.

### 5. Tables trong admin

Table admin phải theo phong cách:

- Nằm trong card trắng
- Header hàng bảng có nền rất nhạt
- Border chia dòng rõ nhưng nhẹ
- Text nhỏ vừa phải, dễ quét
- Có filter bar phía trên
- Có trạng thái empty state lịch sự

Nếu dữ liệu dài, ưu tiên:

- search
- filter
- pagination
- actions gọn

### 6. Dropdown / select / searchable select

Nếu có dropdown tìm kiếm:

- Ô input nhìn như input bình thường
- Dropdown nổi trên cùng bằng portal/fixed nếu cần
- Bo góc mềm
- Border nhẹ
- Shadow vừa
- Hover option bằng nền slate nhạt
- Option được chọn cần có dấu hiệu rõ ràng

***

## Dark mode

Phải hỗ trợ dark mode đồng bộ như dự án MHV.

Nguyên tắc:

- Nền tổng thể: `slate-950`
- Surface/card: `slate-900` hoặc `slate-950`
- Text chính: `slate-100`
- Text phụ: `slate-400`
- Border: `slate-700`
- Input nền tối nhưng vẫn rõ
- Màu cam thương hiệu vẫn là màu nhấn chính

Dark mode không được chỉ đảo màu sơ sài. Cần đảm bảo:

- đủ tương phản
- không chói
- form dễ đọc
- bảng không bị chìm

***

## Bố cục cho website cửa hàng vật liệu xây dựng

## 1. Trang chủ

Trang chủ cần giữ tinh thần hiện đại của MHV nhưng chuyển thành ngôn ngữ phù hợp ngành vật liệu xây dựng.

Yêu cầu:

- Hero section rõ tiêu đề, mô tả ngắn, CTA chính
- Có khối sản phẩm nổi bật
- Có khối danh mục vật liệu
- Có khối lý do chọn cửa hàng
- Có khối thông tin doanh nghiệp
- Có khối liên hệ nhanh

Hình ảnh nên thực tế, mạnh mẽ, gọn, không màu mè.

Bố cục:

- Section lớn xếp dọc
- Mỗi section nằm trong container vừa phải
- Xen kẽ nền trắng và nền slate rất nhạt để tạo nhịp

## 2. Trang sản phẩm

Yêu cầu:

- Có thanh tìm kiếm
- Có bộ lọc loại sản phẩm
- Có grid card sản phẩm
- Có thông tin ngắn: tên, giá, đơn vị tính, mô tả ngắn
- Có CTA xem chi tiết hoặc liên hệ

Không thiết kế như sàn TMĐT quá nhiều badge rối mắt. Giữ cảm giác chuyên nghiệp, gọn.

## 3. Trang chi tiết sản phẩm

Cấu trúc gợi ý:

- Ảnh sản phẩm lớn
- Tên sản phẩm
- Giá / đơn vị
- Mô tả ngắn
- Thông số hoặc đặc điểm
- Khu vực CTA liên hệ / đặt hàng
- Sản phẩm liên quan

Page này cần dùng card và khoảng trắng tốt, tránh nhồi quá nhiều text.

## 4. Trang giới thiệu

Phải trình bày theo phong cách doanh nghiệp:

- Giới thiệu cửa hàng
- Sứ mệnh / cam kết
- Năng lực cung ứng
- Nhóm sản phẩm chính
- Thông tin liên hệ / địa chỉ / bản đồ nếu có

Tông trình bày rõ ràng, tin cậy, không quá marketing.

## 5. Trang liên hệ

Yêu cầu:

- Form liên hệ đơn giản, rõ
- Có card thông tin doanh nghiệp bên cạnh hoặc bên dưới
- Có địa chỉ, số điện thoại, email, giờ làm việc
- CTA rõ ràng

***

## Bố cục cho admin

Admin của dự án mới phải giữ đúng phong cách quản trị của MHV:

- Header gọn
- Nội dung nằm trong các card lớn
- Form CRUD dùng card/modal
- Bảng dữ liệu rõ, dễ đọc
- Bộ lọc nâng cao nếu có phải sạch, không rối

### 1. CRUD sản phẩm

Yêu cầu giao diện:

- Bảng danh sách sản phẩm
- Tìm kiếm theo tên
- Lọc theo loại
- Nút thêm mới nổi bật màu cam
- Modal hoặc trang form thêm/sửa sản phẩm
- Ảnh sản phẩm hiển thị lịch sự, không lấn át nội dung

### 2. CRUD loại sản phẩm

Phong cách:

- Rất gọn
- Có danh sách + form thêm/sửa
- Ít màu, ưu tiên rõ cấu trúc

### 3. CRUD thông tin doanh nghiệp

Nên trình bày như form cấu hình:

- Tên doanh nghiệp
- Logo
- Địa chỉ
- Hotline
- Email
- Mô tả ngắn
- Liên kết mạng xã hội nếu có

### 4. CRUD liên hệ

Danh sách liên hệ nên giống inbox nhẹ:

- Bảng hoặc list card
- Có trạng thái đã xem / chưa xem
- Có chi tiết liên hệ
- Có nút đánh dấu đã xử lý

***

## Responsive

UI phải responsive tốt nhưng không biến thành kiểu mobile app.

Nguyên tắc:

- Mobile: xếp 1 cột
- Tablet: 2 cột nếu hợp lý
- Desktop: layout thoáng, container rộng vừa phải
- Không nhồi quá nhiều cột nhỏ
- Menu mobile gọn, dễ chạm

***

## Ngôn ngữ hình ảnh cho dự án vật liệu xây dựng

Tuy giữ design system của MHV, nhưng nội dung hình ảnh và cảm giác ngành phải phù hợp bối cảnh mới.

Nên dùng:

- ảnh vật liệu xây dựng thực tế
- xi măng, gạch, sắt thép, ống nước, sơn, cát đá, thiết bị xây dựng
- ảnh kho bãi, cửa hàng, đội ngũ, xe giao hàng

Không dùng:

- minh họa quá hoạt hình
- gradient lòe loẹt
- icon quá vui nhộn
- hiệu ứng bay bổng không phù hợp ngành

***

## Những điều cần tránh

- Không làm giao diện kiểu marketplace rối mắt
- Không dùng quá nhiều màu ngoài cam thương hiệu và hệ slate
- Không lạm dụng shadow nặng
- Không làm card quá chật
- Không dùng modal hoặc confirm mặc định của trình duyệt
- Không thiết kế theo phong cách glassmorphism quá mạnh
- Không thêm các tính năng PWA, cài app, offline, push prompt
- Không dùng quá nhiều animation

***

## Checklist để AI bám theo khi sinh giao diện

- Giữ màu cam thương hiệu `#F27024` làm màu nhấn chính
- Dùng hệ chữ sans-serif hệ thống
- Dùng card trắng, bo góc lớn, border nhẹ
- Form rõ ràng, label ở trên, focus màu cam
- Modal lớn, đẹp, overlay tối mờ
- Admin và public dùng cùng một design system
- Hỗ trợ dark mode chỉn chu
- Layout dọc, thoáng, ưu tiên dễ đọc
- Ngôn ngữ thị giác phù hợp ngành vật liệu xây dựng
- Không mang các chi tiết PWA từ dự án MHV sang dự án mới

***

## Prompt ngắn để tái sử dụng cho AI

Hãy thiết kế UI cho website cửa hàng vật liệu xây dựng theo phong cách của dự án MHV:

- tone hiện đại, sạch, tin cậy, thực dụng
- màu nhấn cam `#F27024`, hover `#D25A15`
- nền sáng dùng slate rất nhạt, dark mode dùng slate-950
- font sans-serif hệ thống
- card bo góc lớn, border nhẹ, shadow vừa
- form, modal, bảng dữ liệu và dropdown phải giống tinh thần admin của MHV
- public site và admin cùng chung design language
- không dùng phong cách PWA
- nội dung và hình ảnh phải phù hợp ngành vật liệu xây dựng

Khi tạo component hoặc page mới, luôn ưu tiên:

- dễ đọc
- dễ thao tác
- khoảng trắng tốt
- ít màu phụ
- không rối mắt

