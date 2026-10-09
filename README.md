<div align="center">

<img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=0,2,25,45&height=200&section=header&text=Super%20Video%20Downloader&fontSize=38&fontColor=ffffff&fontAlignY=38&desc=%E2%9A%A1%20Universal%20Web%20Stream%20%26%20Video%20Sniffer%20(Chrome%20Extension%20MV3)&descFontSize=15&descAlignY=58&descAlign=50" alt="Super Video Downloader" width="100%" />

<p align="center">
  <b>High-Performance · Manifest V3 · Zero Watermarks · Unlimited Downloads · 100% Client-Side</b>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Manifest-V3-00D2FF?style=for-the-badge&logo=googlechrome&logoColor=white" alt="Manifest V3" />
  <img src="https://img.shields.io/badge/Compatibility-Chrome%20%7C%20Edge%20%7C%20Brave-10B981?style=for-the-badge&logo=brave&logoColor=white" alt="Compatibility" />
  <img src="https://img.shields.io/badge/Streams-HLS%20%2F%20M3U8%20%2F%20MP4-38BDF8?style=for-the-badge&logo=vlcmediaplayer&logoColor=white" alt="Streams" />
  <img src="https://img.shields.io/badge/License-MIT-F59E0B?style=for-the-badge&logo=open-source-initiative&logoColor=white" alt="License" />
</p>

[فارسی](#-راهنمای-فارسی) • [English](#-english-overview) • [Installation](#-quick-installation-1-minute) • [Features](#-key-features) • [Architecture](#-technical-architecture)

</div>

---

## ⚡ Key Features

* 🎯 **Universal Video Stream Sniffer**: Automatically detects and extracts hidden video streams (**MP4, WebM, M3U8 / HLS, TS chunks, FLV**) across web pages.
* 🚀 **Zero Watermark & Full Quality**: Downloads original raw source files directly without re-compression or quality loss.
* 🔒 **100% Private & Client-Side**: No external proxy or third-party servers; all network inspection is done strictly within your browser.
* 🧩 **Modern Manifest V3 Architecture**: Fully compliant with modern Chrome Web Store policies using asynchronous service workers.
* 📦 **One-Click Batch Downloader**: Download individual video streams or grab all media assets on the active page with a single click.

---

## 🚀 Quick Installation (1 Minute)

1. **Clone or Download** this repository:
   ```bash
   git clone https://github.com/mrzroot/universal-video-downloader.git
   ```
2. Open your browser and navigate to:
   - **Google Chrome**: `chrome://extensions`
   - **Microsoft Edge**: `edge://extensions`
   - **Brave Browser**: `brave://extensions`
3. Toggle **Developer mode** (حالت توسعه‌دهنده) in the top-right corner.
4. Click **Load unpacked** (بارگذاری بسته بازنشده) and select the cloned `universal-video-downloader` folder (the one that contains `manifest.json`).
5. Pin the extension and open any video page to start downloading!

---

## 📐 Technical Architecture

```mermaid
graph TD
    classDef browser fill:#0f172a,stroke:#38bdf8,stroke-width:2px,color:#fff;
    classDef worker fill:#0284c7,stroke:#00D2FF,stroke-width:2px,color:#fff;
    classDef ui fill:#0f766e,stroke:#2dd4bf,stroke-width:2px,color:#fff;

    Page["🌐 Active Web Page (DOM / Video Player)"]:::browser
    Content["🔍 Content Script (Network & DOM Sniffer)"]:::worker
    Worker["⚡ Background Service Worker (WebRequest API)"]:::worker
    Popup["💻 Popup UI (Stream List & Quality Selector)"]:::ui
    Downloader["📥 Chrome Downloads API"]:::ui

    Page -->|"Inspect Media Tags"| Content
    Page -->|"Network Requests (HLS/MP4)"| Worker
    Content -->|"Message Passing"| Worker
    Worker -->|"Stream Metadata"| Popup
    Popup -->|"Trigger Download"| Downloader
```

---

## 🇮🇷 راهنمای فارسی

افزونه **Super Video Downloader** یک افزونه حرفه‌ای برای مرورگرهای مبتنی بر کرومیوم (Chrome, Edge, Brave) است که به شما امکان می‌دهد انواع ویدیوها و پخش‌های زنده اینترنتی (شامل پلتفرم‌های آموزشی، دوره‌ها و سایت‌های ویدیویی) را با حداکثر کیفیت و بدون محدودیت دانلود کنید.

### 🌟 ویژگی‌های کلیدی
* **شناسایی خودکار جریان‌های ویدیویی**: کشف لینک‌های پنهان `m3u8`، `MP4` و `WebM` در پس‌زمینه.
* **بدون واترمارک و رایگان**: دانلود فایل‌های اصلی با حداکثر بیت‌ریت منبع.
* **امنیت کامل**: پردازش داده‌ها ۱۰۰٪ داخل مرورگر شما انجام شده و هیچ داده‌ای به سرور خارجی ارسال نمی‌شود.

### 📥 مراحل نصب سریع (کمتر از ۱ دقیقه)
1. پوشه افزونه را دانلود یا کلون کنید.
2. در مرورگر کروم یا اج وارد صفحه `chrome://extensions` شوید.
3. در گوشه بالا سمت راست، گزینه **Developer mode** را فعال کنید.
4. روی دکمه **Load unpacked** کلیک کرده و پوشه این پروژه را انتخاب کنید.
5. آیکون افزونه را پین کرده و در هر صفحه‌ای که ویدیو دارد روی آن کلیک کنید تا لیست لینک‌های دانلود نمایش داده شود.

---

## 👨‍💻 Author & Maintainer

Engineered by **M-R-Z** ([@mrzroot](https://github.com/mrzroot))  
Feel free to open Issues, PRs, or star ⭐ this repository if it helped you!

---

<div align="center">
  <sub>Licensed under the <a href="LICENSE"><b>MIT License</b></a> · Built with modern JavaScript & Chrome Extension MV3</sub>
</div>
