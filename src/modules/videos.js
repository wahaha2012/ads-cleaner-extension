const getAllVideos = (container = document) => {
  return container.querySelectorAll("video");
};

const createContainer = () => {
  const container = document.createElement("div");
  container.style.cssText =
    "position:absolute; padding: 10px; background: rgba(0,0,0,0.3); z-index: 999999; color: #ffffff; font-size: 14px; opacity: 0.3;";
  return container;
};

const createControlBar = (c, v) => {
  const fields = ["进度", "尺寸", "速度", "音量"];
  const pos = v.getBoundingClientRect();
  c.style.cssText += `left: ${pos.left}px; top: ${pos.top}px; width: ${pos.width}px;`;
  c.innerHTML = "";

  const attrList = [
    `${Math.floor(v.currentTime / 60)}:${Math.floor(
      v.currentTime % 60
    )}/${Math.floor(v.duration / 60)}:${Math.floor(v.duration % 60)}`,
    `${v.videoWidth}x${v.videoHeight}`,
    v.playbackRate,
    v.volume,
  ];
  fields.forEach((f, i) => {
    const span = document.createElement("span");
    span.style.cssText = "margin-right: 10px;";
    span.innerHTML = `${f}: ${attrList[i]}`;
    c.appendChild(span);
  });

  const source = document.createElement("div");
  source.style.cssText =
    "white-space: nowrap; width: 100%; overflow: hidden; text-overflow: ellipsis;margin-top: 9px; font-size: 12px; color: rgba(255,255,255, 0.5); display: none;";
  source.innerText = v.currentSrc;

  const action = [
    {
      type: "volume",
      change: -0.25,
    },
    {
      type: "volume",
      change: 0.25,
    },
    {
      type: "playbackRate",
      change: -0.25,
    },
    {
      type: "playbackRate",
      change: 0.25,
    },
    () => {
      createControlBar(c, v);
    },
    () => {
      source.style.display = source.style.display === "none" ? "block" : "none";
    },
  ];

  // create all buttons
  ["音量-", "音量+", "速度-", "速度+", "刷新", "显示源"].forEach((item, i) => {
    const btn = document.createElement("button");
    btn.innerText = item;
    btn.style.cssText =
      "border-radius: 2px; margin: 0 2px; border: 0 none; color: #666666; cursor: pointer; padding: 0 2px;";
    if (typeof action[i] !== "function") {
      const act = action[i];
      btn.onclick = () => {
        if (act.type === "volume" && (v[act.type] > 1 || v[act.type] < 0)) {
          return;
        }

        try {
          v[act.type] += act.change;

          action[4]();
        } catch (err) {
          console.warn("[Extension AC]", err);
        }
      };
    } else {
      btn.onclick = action[i];
    }

    c.appendChild(btn);
  });
  c.appendChild(source);
};

const createVideoController = (videos) => {
  [].forEach.call(videos, (v) => {
    const c = createContainer();

    c.onmouseenter = () => {
      c.style.opacity = 1;
    };
    c.onmouseleave = () => {
      c.style.opacity = 0;
    };

    createControlBar(c, v);
    document.body.appendChild(c);
  });
};

const init = () => {
  const videos = getAllVideos();
  // console.log("find videos: ", videos.length);

  createVideoController(videos);
};

setTimeout(() => {
  init();
}, 1000);
