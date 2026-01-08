This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.



fix bug: 
1️⃣ Search chỉ gõ được 1 ký tự rồi bị văng focus
    Nguyên nhân
        - loading thay đổi → component re-render → input bị unmount/mount lại
        - fetch data mỗi lần gõ gây reset UI
    Kết quả
        - Đã xác định đúng bản chất vấn đề
        - Hướng xử lý chuẩn: debounce + không return UI theo loading nữa
    ✅ Đã fix

2️⃣ Search filter theo từng ký tự (H → Haircut, Hairstyle)
    Nguyên nhân: Query Supabase chưa đúng + trigger fetch sai thời điểm
    Kết quả: ilike + debounce hoạt động đúng, Gõ từng chữ → filter realtime
    ✅ Đã fix

3️⃣ Service Detail báo “Invalid service ID”

    Nguyên nhân
        - params chưa được truyền đúng trong dynamic route
        - Lỗi ReferenceError params is not defined
    Kết quả
        - Dynamic route /services/[id] hoạt động đúng
        - Fetch service theo UUID OK
    ✅ Đã fix

4️⃣ Vào Service từ homepage không được
    Nguyên nhân
        - Navbar đang dùng #services (scroll nội trang)
        - /services là page riêng
    Kết quả
        - Đã xác định đúng: homepage ≠ services page
        - Giữ scroll cho homepage, route riêng cho services page
    ✅ Đã fix

5️⃣ Không load được ảnh service
    Nguyên nhân
        - Link ảnh ngoài domain / hotlink
        - Không phải lỗi code
    Kết luận
        Có thể:
            - Lưu URL trực tiếp vào DB (được)
            - Hoặc dùng Supabase Storage (chuẩn production)
    ✅ Không phải bug – đã làm rõ

6️⃣ Không select được service trong booking (BUG NẶNG NHẤT)
    Nguyên nhân
        parseInt(service.id) // service.id là UUID
        → NaN → React reset <select>
    Fix
        - parseInt(e.target.value)
        + e.target.value
    Kết quả
        Select service hoạt động bình thường
        Summary cập nhật đúng
        Booking flow đi tiếp được
    ✅ ĐÃ FIX
