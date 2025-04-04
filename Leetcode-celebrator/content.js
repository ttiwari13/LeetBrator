// Load confetti.js dynamically
const script = document.createElement("script");
script.src = chrome.runtime.getURL("confetti.js");
script.onload = () => console.log("✅ Confetti script loaded!");
document.head.appendChild(script);

let lastStatus = ""; // Track last detected status to avoid duplicate memes

function checkLeetCodeStatus() {
  const statusElements = document.querySelectorAll(".text-red-s, .text-green-s, .text-yellow-s");

  statusElements.forEach((element) => {
    const statusText = element.innerText.trim();
    console.log("🔍 Detected Status:", statusText);

    // Avoid re-triggering the same meme if status is unchanged
    if (statusText === lastStatus) return;
    lastStatus = statusText;

    // Remove old meme before showing a new one
    document.querySelectorAll(".leet-meme").forEach(el => el.remove());

    if (statusText.includes("Time Limit Exceeded")) {
      console.log("🚀 TLE detected!");
      showMeme("videos/tle.mp4");
    } else if (statusText.includes("Accepted")) {
      console.log("✅ Accepted detected!");
      showMeme("videos/accepted.mp4");
      triggerConfetti();
    } else if (statusText.includes("Wrong Answer")) {
      console.log("❌ Wrong Answer detected!");
      showMeme("images/wrongans.png");
    } else if (statusText.includes("Compile Error")) {
      console.log("🛠 Compilation Error detected!");
      showMeme("images/compile.png");
    } else if (statusText.includes("Runtime Error")) {
      console.log("⚠ Runtime Error detected!");
      showMeme("images/runtime.png");
    }
  });
}

// Function to show meme (handles both video & image)
function showMeme(src) {
  try {
    if (chrome.runtime?.lastError) {
      console.error("❌ Chrome runtime error:", chrome.runtime.lastError);
      return;
    }

    // Remove any existing meme before adding a new one
    document.querySelectorAll(".leet-meme").forEach(el => el.remove());

    let media;
    if (src.endsWith(".mp4")) {
      media = document.createElement("video");
      media.src = chrome.runtime.getURL(src);
      media.autoplay = true;
      media.loop = false;
      media.controls = false;
    } else {
      media = document.createElement("img");
      media.src = chrome.runtime.getURL(src);
    }

    media.classList.add("leet-meme");
    media.style.position = "fixed";
    media.style.bottom = "10px";
    media.style.right = "10px";
    media.style.width = "200px";
    media.style.zIndex = "9999";

    // Ensure body exists before appending
    if (!document.body) {
      console.warn("⚠ DOM not ready. Retrying in 500ms...");
      setTimeout(() => showMeme(src), 500);
      return;
    }

    document.body.appendChild(media);

    // Remove the meme automatically after 5 seconds
    setTimeout(() => {
      media.remove();
    }, 5000);
  } catch (error) {
    console.error("❌ Error in showMeme:", error);
  }
}

// Observe changes in the entire body to detect dynamic content updates
function startObserving() {
  const observer = new MutationObserver(() => {
    console.log("👀 DOM changed, checking for LeetCode status...");
    checkLeetCodeStatus();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  console.log("🔄 Now monitoring the entire page for updates...");
}

// Function to trigger confetti after ensuring it loads
function triggerConfetti() {
  setTimeout(() => {
    if (typeof confetti === "function") {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    } else {
      console.error("❌ Confetti is not defined! Make sure confetti.js is loading.");
    }
  }, 1000);
}

// Ensure observer starts when the page loads
startObserving();
