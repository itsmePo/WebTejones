export interface VideoFacadeOptions {
  containerId: string;
  youtubeId: string;
  titulo: string;
}

export function setupVideoFacade(options: VideoFacadeOptions): { mount: () => void; destroy: () => void } {
  const container = document.getElementById(options.containerId);
  if (!container) {
    return {
      mount: function mount() {},
      destroy: function destroy() {}
    };
  }

  const button = container.querySelector('button.video-facade-trigger');
  if (!button) {
    return {
      mount: function mount() {},
      destroy: function destroy() {}
    };
  }

  const handlePlay = function handlePlay() {
    if (container.querySelector('iframe')) return;

    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${options.youtubeId}?autoplay=1`;
    iframe.title = options.titulo ? `Reproductor: ${options.titulo}` : 'Reproductor de YouTube';
    iframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture');
    iframe.setAttribute('allowfullscreen', 'true');
    iframe.setAttribute('loading', 'lazy');
    iframe.className = 'video-iframe';

    const wrapper = container.querySelector('.video-facade-content') || container;
    wrapper.innerHTML = '';
    wrapper.appendChild(iframe);

    iframe.focus();
  };

  button.addEventListener('click', handlePlay);

  return {
    mount: function mount() {},
    destroy: function destroy() {
      button.removeEventListener('click', handlePlay);
    }
  };
}

