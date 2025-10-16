# Các hướng dẫn, mô tả cho việc phát triển ứng dụng

## 1. Cài đặt môi trường lập trình

- Cài Node.js và npm.
- Nhân bản repo từ GitHub về máy tính:

```
git clone <repo-url>
cd <project-folder>
```

- Cài đặt các gói phụ thuộc (thư viện) cần thiết cho dự án:

```
npm install
```

## 2. Chạy ứng dụng (Development)

```
npm start
```

## 3. Đóng gói và phát hành ứng dụng

#### Đóng gói thành tập tin cài đặt:
```
npm run build
```

Lệnh này sẽ đóng gói và lưu trong thư mục `/dist`

#### Đóng gói thành tập tin cài đặt và đẩy lên GitHub Release:
```
set GH_TOKEN=your_token && npm run build:publish
```

## 4. Cấu trúc của mã nguồn

## 5. Các quy tắc cần biết