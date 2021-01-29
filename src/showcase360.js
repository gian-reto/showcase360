const showcase360 = (el, options) => {
  const settings = Object.assign(
    {
      images: [],
      speed: 10,
      preload: true,
      mode: "controlled", // "controlled", "autoplay" or "interactive"
    },
    options
  );

  const speed = settings.speed;
  const container = el;
  const imageSources = settings.images;

  let images = [];
  let preloaded = false;
  let previousFrame;
  let currentFrame = 0;
  let timer;

  const preload = (index) => {
    index = index || 0;

    if (imageSources && imageSources.length > index) {
      let img = new Image();

      img.onload = function() {
        preload(index + 1);
      };

      img.src = imageSources[index];

      resolveSrc(index);
    }

    preloaded = true;
  };

  const resolveSrc = (index) => {
    let image = images[index];

    if (image.dataset.src) {
      image.src = image.dataset.src;
      image.removeAttribute("data-src");
    }
  };

  const updateFrame = () => {
    resolveSrc(currentFrame);

    if (previousFrame) {
      images[previousFrame].style.visibility = "hidden";
    }

    images[currentFrame].style.visibility = "visible";
  };

  const move = (speed) => {
    timer = setInterval(() => {
      previousFrame = currentFrame;
      currentFrame += 1;

      if (currentFrame >= imageSources.length) {
        currentFrame = 0;
      }

      updateFrame();

      const ev = new CustomEvent("slideChanged", {
        detail: {
          currentSlide: currentFrame,
        },
      });

      container.dispatchEvent(ev);
    }, speed);
  };

  const play = () => {
    move(speed);
  };

  const pause = () => {
    clearInterval(timer);
    updateFrame();
  };

  const startInteractive = () => {
    ["mouseenter", "touchstart"].forEach((e) => {
      container.addEventListener(
        e,
        (event) => {
          play();
        },
        false
      );
    });

    // Hack iOS (and potential other mobile browsers) image saving ability
    container.style.webkitTouchCallout = "none";
    container.style.webkitUserSelect = "none";
    container.addEventListener("contextmenu", (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    ["mouseleave", "touchend", "touchcancel"].forEach((e) => {
      container.addEventListener(
        e,
        (event) => {
          event.preventDefault();
          event.stopPropagation();

          pause();
        },
        false
      );
    });
  };

  const setupDOMElements = () => {
    container.style.position = "relative";

    imageSources.forEach((imageSource, index) => {
      const image = document.createElement("img");

      if (index > 0) {
        image.dataset.src = imageSource;
        image.style.visibility = "hidden";
        image.style.position = "absolute";
        image.style.top = 0;
        image.style.left = 0;
      } else {
        image.src = imageSource;
      }

      container.appendChild(image);
    });

    images = container.querySelectorAll("img");
  };

  const init = () => {
    setupDOMElements();

    if (settings.preload) {
      preload();
    }

    if (settings.mode == "autoplay") {
      play();
    } else if (settings.mode == "interactive") {
      startInteractive();
    }
  };

  return {
    init,
    play,
    pause,
  };
};

export default showcase360;
