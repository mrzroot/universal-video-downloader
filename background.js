// Super Video Downloader - Background Service Worker (Manifest V3)

const tabVideos = new Map();

// Helper to format bytes to human readable format
function formatBytes(bytes) {
  if (!bytes || isNaN(bytes)) return 'نامشخص';
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
}

// Media type matcher
const VIDEO_EXTENSIONS = ['.mp4', '.m3u8', '.webm', '.ts', '.mkv', '.flv', '.mov', '.avi', '.m4v', '.mpd'];
const VIDEO_MIME_TYPES = [
  'video/mp4',
  'video/webm',
  'video/ogg',
  'video/x-matroska',
  'video/quicktime',
  'application/vnd.apple.mpegurl',
  'application/x-mpegurl',
  'application/dash+xml',
  'video/mp2t'
];

function isVideoUrl(url, contentType = '') {
  if (!url || url.startsWith('chrome') || url.startsWith('about')) return false;
  
  const lowerUrl = url.toLowerCase().split('?')[0];
  const hasExt = VIDEO_EXTENSIONS.some(ext => lowerUrl.endsWith(ext) || lowerUrl.includes(ext + '?'));
  const hasMime = VIDEO_MIME_TYPES.some(mime => contentType.toLowerCase().includes(mime));
  
  return hasExt || hasMime;
}

function detectFormat(url, contentType) {
  const lowerUrl = url.toLowerCase();
  const lowerType = (contentType || '').toLowerCase();
  if (lowerUrl.includes('.m3u8') || lowerType.includes('mpegurl')) return 'HLS (m3u8)';
  if (lowerUrl.includes('.mpd') || lowerType.includes('dash')) return 'DASH (mpd)';
  if (lowerUrl.includes('.mp4') || lowerType.includes('mp4')) return 'MP4';
  if (lowerUrl.includes('.webm') || lowerType.includes('webm')) return 'WebM';
  if (lowerUrl.includes('.ts') || lowerType.includes('mp2t')) return 'TS Stream';
  return 'Video Stream';
}

function addVideo(tabId, videoData) {
  if (!tabId || tabId < 0) return;
  
  if (!tabVideos.has(tabId)) {
    tabVideos.set(tabId, new Map());
  }
  
  const videos = tabVideos.get(tabId);
  const key = videoData.url.split('#')[0];
  
  if (!videos.has(key)) {
    videos.set(key, videoData);
    updateBadge(tabId);
  } else {
    // Update size/info if available
    const existing = videos.get(key);
    if (videoData.size && (!existing.size || existing.size === 'نامشخص')) {
      existing.size = videoData.size;
      existing.sizeRaw = videoData.sizeRaw;
    }
  }
}

function updateBadge(tabId) {
  const count = tabVideos.has(tabId) ? tabVideos.get(tabId).size : 0;
  chrome.action.setBadgeText({
    tabId: tabId,
    text: count > 0 ? count.toString() : ''
  });
  chrome.action.setBadgeBackgroundColor({
    tabId: tabId,
    color: '#0284c7'
  });
}

// Sniff network responses for video headers
chrome.webRequest.onHeadersReceived.addListener(
  (details) => {
    if (details.tabId < 0) return;
    
    let contentType = '';
    let contentLength = 0;
    
    if (details.responseHeaders) {
      for (const header of details.responseHeaders) {
        const name = header.name.toLowerCase();
        if (name === 'content-type') {
          contentType = header.value || '';
        } else if (name === 'content-length') {
          contentLength = parseInt(header.value, 10) || 0;
        }
      }
    }
    
    if (isVideoUrl(details.url, contentType)) {
      const format = detectFormat(details.url, contentType);
      const videoData = {
        id: details.requestId || Math.random().toString(36).substring(2),
        url: details.url,
        title: (details.url.split('/').pop().split('?')[0]) || 'Video File',
        format: format,
        size: contentLength > 0 ? formatBytes(contentLength) : 'نامشخص',
        sizeRaw: contentLength,
        type: contentType,
        timestamp: Date.now()
      };
      
      addVideo(details.tabId, videoData);
    }
  },
  { urls: ['<all_urls>'] },
  ['responseHeaders']
);

// Listen to DOM sniffer messages from content.js
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const tabId = sender.tab ? sender.tab.id : null;
  
  if (message.action === 'VIDEO_FOUND' && tabId) {
    message.videos.forEach(v => addVideo(tabId, v));
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'GET_VIDEOS') {
    const requestedTabId = message.tabId || tabId;
    const list = tabVideos.has(requestedTabId) ? Array.from(tabVideos.get(requestedTabId).values()) : [];
    sendResponse({ videos: list });
    return true;
  }
  
  if (message.action === 'CLEAR_VIDEOS') {
    if (tabId && tabVideos.has(tabId)) {
      tabVideos.delete(tabId);
      updateBadge(tabId);
    }
    sendResponse({ success: true });
    return true;
  }
  
  if (message.action === 'DOWNLOAD_VIDEO') {
    chrome.downloads.download({
      url: message.url,
      filename: message.filename || 'video.mp4',
      saveAs: true
    }, (downloadId) => {
      sendResponse({ downloadId: downloadId });
    });
    return true;
  }
});

// Clean up memory when tab is closed or navigated
chrome.tabs.onRemoved.addListener((tabId) => {
  tabVideos.delete(tabId);
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo) => {
  if (changeInfo.status === 'loading') {
    tabVideos.delete(tabId);
    updateBadge(tabId);
  }
});
