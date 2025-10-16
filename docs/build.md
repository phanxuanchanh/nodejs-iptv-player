## 1. Cài đặt môi trường

- Cài Node.js và npm.
- Clone repo về máy:

```
git clone <repo-url>
cd <project-folder>
```

- Cài dependencies:

```
npm install
```

## 2 Chạy ứng dụng (Development)

```
npm start
```

## 3. Đóng gói và phát hành ứng dụng

Build là tập tin cài đặt:
```
npm run build
```

Build ra tập tin cài đặt và đẩy lên GitHub Release:
```
set GH_TOKEN=your_token && npm run build:publish
```