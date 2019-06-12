const showcase360 = (el, options) => {
  const settings = Object.assign({
    images: [],
    speed: 10,
    play: false,
    auto: true,
    edgeStop: false,
  }, options);

  const speed = settings.speed;
  const container = el;
  const images = settings.images;
  const image = container.querySelector('img');
  let preloaded = false;
  let frame = 0;
  let timer;

  const preload = (index) => {
    index = index || 0;

    if (images && images.length > index) {
      let img = new Image ();

      img.onload = function() {
        preload(index + 1);
      }

      img.src = images[index];
    }

    preloaded = true;
  };

  const move = (speed) => {
    timer = setInterval(() => {
      frame += 1;

      if (frame >= images.length) {
        frame = 0;
      }

      image.setAttribute('src', images[frame]);

      const ev = new CustomEvent('slideChanged', {
        detail: {
          currentSlide: frame
        }
      });

      container.dispatchEvent(ev);
    }, speed);
  };

  const play = () => {
    preload();
    move(speed);
  };

  const pause = () => {
    clearInterval(timer);
    image.setAttribute('src', images[frame]);
  };

  const auto = () => {
    ['mouseenter', 'touchstart'].forEach((e) => {
      container.addEventListener(e, (event) => {
        play();
      }, false);
    });

    // Hack iOS (and potential other mobile browsers) image saving ability
    container.style.webkitTouchCallout = 'none';
    container.style.webkitUserSelect = 'none';
    container.addEventListener('contextmenu', (event) => {
      event.preventDefault();
      event.stopPropagation();
      return false;
    });

    ['mouseleave', 'touchend', 'touchcancel'].forEach((e) => {
      container.addEventListener(e, (event) => {
        event.preventDefault();
        event.stopPropagation();

        pause();
      }, false);
    });
  };

  const init = () => {
    if (settings.play === true) {
      play();
    } else if (settings.auto === true) {
      auto();
    }
  };

  return {
    init,
    play,
    pause,
  };
};

export default showcase360;
