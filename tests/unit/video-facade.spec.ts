import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupVideoFacade } from '../../src/scripts/video-facade';

describe('video-facade.ts', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="video-container">
        <div class="video-facade-content">
          <button class="video-facade-trigger" aria-label="Reproducir vídeo">Play</button>
        </div>
      </div>
    `;
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('does nothing if container is missing', () => {
    const handle = setupVideoFacade({ containerId: 'non-existent', youtubeId: 'abc123XYZ-_', titulo: 'Test' });
    expect(handle).toBeDefined();
    handle.mount();
    handle.destroy();
  });

  it('does nothing if button is missing', () => {
    document.querySelector('.video-facade-trigger')?.remove();
    const handle = setupVideoFacade({ containerId: 'video-container', youtubeId: 'abc123XYZ-_', titulo: 'Test' });
    expect(handle).toBeDefined();
    handle.mount();
    handle.destroy();
  });

  it('mounts youtube-nocookie iframe upon clicking the trigger button', () => {
    setupVideoFacade({ containerId: 'video-container', youtubeId: 'abc123XYZ-_', titulo: 'Concierto en Directo' });

    const button = document.querySelector('.video-facade-trigger') as HTMLButtonElement;
    expect(button).not.toBeNull();

    button.click();

    const iframe = document.querySelector('iframe') as HTMLIFrameElement;
    expect(iframe).not.toBeNull();
    expect(iframe.src).toContain('https://www.youtube-nocookie.com/embed/abc123XYZ-_');
    expect(iframe.title).toContain('Concierto en Directo');
    expect(iframe.getAttribute('allowfullscreen')).toBe('true');
  });

  it('prevents double mounting if clicked multiple times', () => {
    setupVideoFacade({ containerId: 'video-container', youtubeId: 'abc123XYZ-_', titulo: 'Test' });

    const button = document.querySelector('.video-facade-trigger') as HTMLButtonElement;
    button.click();
    button.click();

    const iframes = document.querySelectorAll('iframe');
    expect(iframes.length).toBe(1);
  });

  it('cleans up event listener on destroy', () => {
    const handle = setupVideoFacade({ containerId: 'video-container', youtubeId: 'abc123XYZ-_', titulo: 'Test' });
    handle.destroy();
    const button = document.querySelector('.video-facade-trigger') as HTMLButtonElement;
    button.click();
    const iframe = document.querySelector('iframe');
    expect(iframe).toBeNull();
  });
});
