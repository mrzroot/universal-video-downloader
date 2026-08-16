// Super Video Downloader - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  const videoList = document.getElementById('videoList');
  const emptyState = document.getElementById('emptyState');
  const detectedCount = document.getElementById('detectedCount');
  const refreshBtn = document.getElementById('refreshBtn');

  async function getCurrentTab() {
    const queryOptions = { active: true, currentWindow: true };
    const [tab] = await chrome.tabs.query(queryOptions);
    return tab;
  }

  async function loadVideos() {
    const tab = await getCurrentTab();
    if (!tab) return;

    chrome.runtime.sendMessage({ action: 'GET_VIDEOS', tabId: tab.id }, (response) => {
      if (!response || !response.videos || response.videos.length === 0) {
        emptyState.style.display = 'block';
        videoList.innerHTML = '';
        videoList.appendChild(emptyState);
        detectedCount.textContent = 'ویدیویی شناسایی نشد (ویدیو را پخش کنید)';
        return;
      }

      emptyState.style.display = 'none';
      videoList.innerHTML = '';
      detectedCount.textContent = `${response.videos.length} ویدیوی آماده دانلود پیدا شد`;

      response.videos.forEach((video, index) => {
        const card = document.createElement('div');
        card.className = 'video-card';

        let safeTitle = video.title || `Video_${index + 1}`;
        safeTitle = safeTitle.replace(/[\\/:*?"<>|]/g, '_').substring(0, 50);

        card.innerHTML = `
          <div class="video-header">
            <span class="video-title" title="${video.url}">${safeTitle}</span>
            <span class="video-format-tag">${video.format || 'MP4'}</span>
          </div>
          <div class="video-meta">
            <span>حجم: ${video.size || 'نامشخص'}</span>
            <span>کیفیت: اصلی (HD)</span>
          </div>
          <div class="video-actions">
            <button class="btn btn-primary download-btn" data-url="${encodeURI(video.url)}" data-name="${safeTitle}.mp4">
              ⬇️ دانلود فایل
            </button>
            <button class="btn btn-outline copy-btn" data-url="${video.url}">
              📋 کپی لینک
            </button>
          </div>
        `;

        videoList.appendChild(card);
      });

      // Bind download buttons
      document.querySelectorAll('.download-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const url = decodeURI(e.currentTarget.getAttribute('data-url'));
          const filename = e.currentTarget.getAttribute('data-name');
          
          chrome.runtime.sendMessage({
            action: 'DOWNLOAD_VIDEO',
            url: url,
            filename: filename
          });

          e.currentTarget.textContent = '⏳ در حال دانلود...';
          setTimeout(() => {
            e.currentTarget.textContent = '✅ شروع شد';
          }, 1500);
        });
      });

      // Bind copy buttons
      document.querySelectorAll('.copy-btn').forEach((btn) => {
        btn.addEventListener('click', (e) => {
          const url = e.currentTarget.getAttribute('data-url');
          navigator.clipboard.writeText(url);
          const originalText = e.currentTarget.textContent;
          e.currentTarget.textContent = '✅ کپی شد!';
          setTimeout(() => {
            e.currentTarget.textContent = originalText;
          }, 1500);
        });
      });
    });
  }

  refreshBtn.addEventListener('click', () => {
    loadVideos();
  });

  // Initial load
  loadVideos();
});
