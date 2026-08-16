// Super Video Downloader - Content Script with Maktabkhooneh Auto-Batch Downloader

(function () {
  const foundUrls = new Set();

  // ==========================================
  // 1. MAKTABKHOONEH SPECIFIC BULK DOWNLOADER
  // ==========================================
  if (window.location.hostname.includes('maktabkhooneh.org')) {
    injectMaktabkhoonehFloatingBar();
  }

  function injectMaktabkhoonehFloatingBar() {
    if (document.getElementById('mk-downloader-bar')) return;

    const bar = document.createElement('div');
    bar.id = 'mk-downloader-bar';
    bar.style.cssText = `
      position: fixed;
      bottom: 25px;
      left: 25px;
      z-index: 999999;
      background: linear-gradient(135deg, #090d16, #1e293b);
      border: 2px solid #38bdf8;
      border-radius: 16px;
      padding: 16px 20px;
      color: #fff;
      font-family: Tahoma, Vazir, sans-serif;
      direction: rtl;
      box-shadow: 0 10px 35px rgba(2, 132, 199, 0.4);
      display: flex;
      flex-direction: column;
      gap: 12px;
      max-width: 340px;
      animation: mkFadeIn 0.5s ease;
    `;

    bar.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center;">
        <div style="font-weight:bold; font-size:14px; color:#38bdf8; display:flex; align-items:center; gap:8px;">
          <span>⚡</span>
          <span>دانلودر خودکار مکتب‌خونه</span>
        </div>
        <button id="mk-close-btn" style="background:none; border:none; color:#94a3b8; font-size:16px; cursor:pointer;">✖</button>
      </div>
      <div style="font-size:12px; color:#cbd5e1; line-height:1.5;" id="mk-status-text">
        دوره باز شده شناسایی شد. روی دکمه زیر کلیک کنید تا تمام قسمت‌ها به ترتیب و با نام‌گذاری مرتب دانلود شوند.
      </div>
      <div style="display:flex; gap:8px;">
        <button id="mk-start-download-btn" style="
          flex:1;
          background: linear-gradient(135deg, #0284c7, #38bdf8);
          border:none;
          border-radius:10px;
          color:#fff;
          font-weight:bold;
          padding:10px 14px;
          cursor:pointer;
          font-size:12px;
          box-shadow: 0 4px 15px rgba(56, 189, 248, 0.4);
        ">🚀 دانلود خودکار کل دوره</button>
        <button id="mk-copy-links-btn" style="
          background:#334155;
          border:1px solid #475569;
          border-radius:10px;
          color:#fff;
          padding:10px 12px;
          cursor:pointer;
          font-size:12px;
        ">📋 کپی لینک‌ها</button>
      </div>
      <div id="mk-progress" style="display:none; width:100%; background:#1e293b; border-radius:8px; overflow:hidden; height:8px;">
        <div id="mk-progress-bar" style="width:0%; background:#38bdf8; height:100%; transition:width 0.3s ease;"></div>
      </div>
    `;

    document.body.appendChild(bar);

    document.getElementById('mk-close-btn').onclick = () => bar.remove();

    document.getElementById('mk-start-download-btn').onclick = async () => {
      await startMaktabkhoonehScraper(false);
    };

    document.getElementById('mk-copy-links-btn').onclick = async () => {
      await startMaktabkhoonehScraper(true);
    };
  }

  async function startMaktabkhoonehScraper(copyOnly = false) {
    const statusText = document.getElementById('mk-status-text');
    const startBtn = document.getElementById('mk-start-download-btn');
    const progressContainer = document.getElementById('mk-progress');
    const progressBar = document.getElementById('mk-progress-bar');

    startBtn.disabled = true;
    startBtn.style.opacity = '0.6';
    progressContainer.style.display = 'block';
    statusText.innerHTML = '🔍 در حال اسکن سرفصل‌ها و پیدا کردن ویدیوهای دوره...';

    // 1. Collect all lesson units from the page sidebar
    const unitLinks = Array.from(document.querySelectorAll('a[href*="/unit/"], a[href*="/lesson/"], .unit-item a, .chapter-unit a'));
    const uniqueUrls = [];
    const seen = new Set();

    unitLinks.forEach((a) => {
      const href = a.href.split('?')[0];
      if (!seen.has(href)) {
        seen.add(href);
        const title = (a.innerText || a.getAttribute('title') || 'درس').trim().replace(/\s+/g, ' ');
        uniqueUrls.push({ url: href, title: title });
      }
    });

    // If on a single video page or direct player
    if (uniqueUrls.length === 0) {
      // Find current video
      const currentVideo = document.querySelector('video source, video');
      if (currentVideo && currentVideo.src) {
        uniqueUrls.push({ url: window.location.href, title: document.title, directSrc: currentVideo.src });
      }
    }

    if (uniqueUrls.length === 0) {
      statusText.innerHTML = '⚠️ قسمتی در این صفحه پیدا نشد. لطفاً به صفحه اصلی سرفصل‌های دوره بروید.';
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      return;
    }

    statusText.innerHTML = `📦 ${uniqueUrls.length} قسمت پیدا شد. در حال استخراج لینک‌های باکیفیت...`;

    const courseTitle = (document.querySelector('h1')?.innerText || document.title.split('-')[0] || 'دوره مکتب خونه')
      .trim().replace(/[\\/:*?"<>|]/g, '_');

    const downloadList = [];

    for (let i = 0; i < uniqueUrls.length; i++) {
      const item = uniqueUrls[i];
      const percent = Math.round(((i + 1) / uniqueUrls.length) * 100);
      progressBar.style.width = percent + '%';
      statusText.innerHTML = `در حال دریافت قسمت ${i + 1} از ${uniqueUrls.length}: <br><b>${item.title.substring(0, 30)}...</b>`;

      let videoSrc = item.directSrc;

      if (!videoSrc) {
        try {
          const resp = await fetch(item.url);
          const html = await resp.text();
          const doc = new DOMParser().parseFromString(html, 'text/html');

          // Check video tag
          const vid = doc.querySelector('video source[src], video[src]');
          if (vid && vid.src) {
            videoSrc = vid.src;
          } else {
            // Regex match for mp4/m3u8 inside script tags or json
            const matches = html.match(/https?:\/\/[^"'\s]+\.(mp4|m3u8)[^"'\s]*/gi);
            if (matches && matches.length > 0) {
              // Prefer 720p or 1080p if available
              const hq = matches.find(u => u.includes('720') || u.includes('1080')) || matches[0];
              videoSrc = hq.replace(/\\u002F/g, '/');
            }
          }
        } catch (err) {
          console.error('Error fetching unit:', err);
        }
      }

      if (videoSrc) {
        const padIndex = String(i + 1).padStart(2, '0');
        const cleanItemTitle = item.title.replace(/[\\/:*?"<>|]/g, '_').substring(0, 40);
        const fileName = `${courseTitle}/${padIndex} - ${cleanItemTitle}.mp4`;

        downloadList.push({
          url: videoSrc,
          filename: fileName,
          title: item.title
        });
      }

      // Small delay to be polite to the server
      await new Promise(r => setTimeout(r, 400));
    }

    if (downloadList.length === 0) {
      statusText.innerHTML = '⚠️ برای استخراج خودکار، ابتدا باید در سایت لاگین باشید و دوره را باز کرده باشید.';
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      return;
    }

    if (copyOnly) {
      const text = downloadList.map(d => `${d.filename}\n${d.url}`).join('\n\n');
      navigator.clipboard.writeText(text);
      statusText.innerHTML = `✅ لینک تمام ${downloadList.length} قسمت با موفقیت در کلیپ‌بورد کپی شد!`;
      startBtn.disabled = false;
      startBtn.style.opacity = '1';
      return;
    }

    statusText.innerHTML = `🚀 شروع دانلود ${downloadList.length} قسمت در پوشه <b>${courseTitle}</b>...`;

    downloadList.forEach((item, idx) => {
      setTimeout(() => {
        chrome.runtime.sendMessage({
          action: 'DOWNLOAD_VIDEO',
          url: item.url,
          filename: item.filename
        });
      }, idx * 1000);
    });

    statusText.innerHTML = `🎉 دانلود خودکار ${downloadList.length} قسمت به بخش دانلودهای مرورگر ارسال شد!`;
    startBtn.disabled = false;
    startBtn.style.opacity = '1';
  }

  // ==========================================
  // 2. GENERAL MEDIA DETECTOR (ALL SITES)
  // ==========================================
  function scanMediaElements() {
    const detected = [];

    const mediaElements = document.querySelectorAll('video, audio, source, a[href$=".mp4"], a[href$=".m3u8"]');
    mediaElements.forEach((el) => {
      let src = el.src || el.currentSrc || el.getAttribute('data-src') || el.getAttribute('href');
      if (src && !src.startsWith('blob:') && !foundUrls.has(src)) {
        foundUrls.add(src);
        detected.push({
          url: src,
          title: document.title || 'Web Video',
          format: src.includes('.m3u8') ? 'HLS (m3u8)' : (src.includes('.webm') ? 'WebM' : 'MP4'),
          size: 'کیفیت بالا (HD)'
        });
      }
    });

    if (detected.length > 0) {
      chrome.runtime.sendMessage({
        action: 'VIDEO_FOUND',
        videos: detected
      }).catch(() => {});
    }
  }

  scanMediaElements();
  setTimeout(scanMediaElements, 2000);
  setTimeout(scanMediaElements, 5000);
})();
