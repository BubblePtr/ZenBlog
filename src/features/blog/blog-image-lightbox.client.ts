import {
  BLOG_LIGHTBOX_SCOPE_SELECTOR,
  collectLightboxImages,
  resolveFullSizeSrc,
} from '@/features/blog/blog-image-lightbox';

export interface BlogImageLightboxLabels {
  close: string;
  prev: string;
  next: string;
}

interface BlogImageLightboxOptions {
  labels: BlogImageLightboxLabels;
}

interface LightboxState {
  images: HTMLImageElement[];
  index: number;
}

const LIGHTBOX_ROOT_ID = 'blog-image-lightbox';
const LIGHTBOX_ENABLED_ATTR = 'data-lightbox-enabled';

let activeCleanup: (() => void) | undefined;
let lightboxRoot: HTMLElement | undefined;
let state: LightboxState | undefined;

function getOrCreateLightboxRoot(): HTMLElement {
  const existing = document.getElementById(LIGHTBOX_ROOT_ID);
  if (existing) {
    return existing;
  }

  const root = document.createElement('div');
  root.id = LIGHTBOX_ROOT_ID;
  root.className = 'blog-image-lightbox';
  root.hidden = true;
  document.body.appendChild(root);

  return root;
}

function renderLightboxShell(labels: BlogImageLightboxLabels): void {
  if (!lightboxRoot) {
    return;
  }

  lightboxRoot.innerHTML = `
    <div class="blog-image-lightbox-backdrop" data-lightbox-dismiss></div>
    <div class="blog-image-lightbox-dialog" role="dialog" aria-modal="true" aria-label="${labels.close}">
      <button type="button" class="blog-image-lightbox-close" data-lightbox-close aria-label="${labels.close}">
        <svg class="blog-image-lightbox-close-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M18 6L6 18M6 6l12 12" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
      </button>
      <button type="button" class="blog-image-lightbox-nav blog-image-lightbox-prev" data-lightbox-prev aria-label="${labels.prev}">
        <svg class="blog-image-lightbox-nav-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M15 6l-6 6 6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <button type="button" class="blog-image-lightbox-nav blog-image-lightbox-next" data-lightbox-next aria-label="${labels.next}">
        <svg class="blog-image-lightbox-nav-icon" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true">
          <path d="M9 6l6 6-6 6" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </button>
      <figure class="blog-image-lightbox-figure">
        <img class="blog-image-lightbox-image" alt="" decoding="async" />
        <figcaption class="blog-image-lightbox-caption"></figcaption>
      </figure>
    </div>
  `;
}

function getDialogElements() {
  const root = lightboxRoot;
  if (!root) {
    return undefined;
  }

  return {
    root,
    image: root.querySelector<HTMLImageElement>('.blog-image-lightbox-image'),
    caption: root.querySelector<HTMLElement>('.blog-image-lightbox-caption'),
    prev: root.querySelector<HTMLButtonElement>('[data-lightbox-prev]'),
    next: root.querySelector<HTMLButtonElement>('[data-lightbox-next]'),
    close: root.querySelector<HTMLButtonElement>('[data-lightbox-close]'),
  };
}

function syncLightboxView(): void {
  const current = state;
  const elements = getDialogElements();

  if (!current || !elements?.image || !elements.caption || !elements.prev || !elements.next) {
    return;
  }

  const activeImage = current.images[current.index];
  if (!activeImage) {
    return;
  }

  const fullSrc = resolveFullSizeSrc(
    activeImage.currentSrc || activeImage.src,
    activeImage.srcset || activeImage.getAttribute('srcset'),
  );

  elements.image.src = fullSrc;
  elements.image.alt = activeImage.alt;

  const caption = activeImage.alt.trim();
  elements.caption.textContent = caption;
  elements.caption.hidden = caption.length === 0;

  const hasMultiple = current.images.length > 1;
  elements.prev.hidden = !hasMultiple;
  elements.next.hidden = !hasMultiple;
  elements.prev.disabled = current.index === 0;
  elements.next.disabled = current.index === current.images.length - 1;
}

function openLightbox(images: HTMLImageElement[], index: number): void {
  state = { images, index };
  syncLightboxView();

  const elements = getDialogElements();
  if (!elements?.root) {
    return;
  }

  elements.root.hidden = false;
  document.body.classList.add('blog-image-lightbox-open');
  elements.close?.focus();
}

function closeLightbox(): void {
  const elements = getDialogElements();
  if (!elements?.root) {
    return;
  }

  elements.root.hidden = true;
  document.body.classList.remove('blog-image-lightbox-open');
  state = undefined;

  if (elements.image) {
    elements.image.removeAttribute('src');
  }
}

function showRelativeImage(offset: -1 | 1): void {
  if (!state || state.images.length <= 1) {
    return;
  }

  const nextIndex = state.index + offset;
  if (nextIndex < 0 || nextIndex >= state.images.length) {
    return;
  }

  state = { ...state, index: nextIndex };
  syncLightboxView();
}

function markLightboxImages(images: HTMLImageElement[]): void {
  for (const image of images) {
    image.setAttribute(LIGHTBOX_ENABLED_ATTR, 'true');
  }
}

function clearLightboxMarks(scope: ParentNode): void {
  for (const image of scope.querySelectorAll<HTMLImageElement>(`img[${LIGHTBOX_ENABLED_ATTR}]`)) {
    image.removeAttribute(LIGHTBOX_ENABLED_ATTR);
  }
}

export function mountBlogImageLightbox(
  scope: ParentNode,
  options: BlogImageLightboxOptions,
): (() => void) | undefined {
  const images = collectLightboxImages(scope);
  if (images.length === 0) {
    return undefined;
  }

  lightboxRoot = getOrCreateLightboxRoot();
  renderLightboxShell(options.labels);
  markLightboxImages(images);

  const controller = new AbortController();
  const { signal } = controller;

  const onImageClick = (event: Event) => {
    const target = event.currentTarget;
    if (!(target instanceof HTMLImageElement)) {
      return;
    }

    const index = images.indexOf(target);
    if (index === -1) {
      return;
    }

    event.preventDefault();
    openLightbox(images, index);
  };

  const onRootClick = (event: Event) => {
    const target = event.target;
    if (!(target instanceof Element)) {
      return;
    }

    if (target.closest('[data-lightbox-dismiss], [data-lightbox-close]')) {
      closeLightbox();
      return;
    }

    if (target.closest('[data-lightbox-prev]')) {
      showRelativeImage(-1);
      return;
    }

    if (target.closest('[data-lightbox-next]')) {
      showRelativeImage(1);
    }
  };

  const onKeyDown = (event: KeyboardEvent) => {
    if (!state || lightboxRoot?.hidden) {
      return;
    }

    if (event.key === 'Escape') {
      event.preventDefault();
      closeLightbox();
      return;
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      showRelativeImage(-1);
      return;
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault();
      showRelativeImage(1);
    }
  };

  for (const image of images) {
    image.addEventListener('click', onImageClick, { signal });
  }

  lightboxRoot.addEventListener('click', onRootClick, { signal });
  window.addEventListener('keydown', onKeyDown, { signal });

  return () => {
    controller.abort();
    closeLightbox();
    clearLightboxMarks(scope);
  };
}

export function initBlogImageLightbox(options: BlogImageLightboxOptions): void {
  teardownBlogImageLightbox();

  const scope = document.querySelector(BLOG_LIGHTBOX_SCOPE_SELECTOR);
  if (!scope) {
    return;
  }

  const cleanup = mountBlogImageLightbox(scope, options);
  if (cleanup) {
    activeCleanup = cleanup;
  }
}

export function teardownBlogImageLightbox(): void {
  activeCleanup?.();
  activeCleanup = undefined;

  const root = document.getElementById(LIGHTBOX_ROOT_ID);
  root?.remove();
  lightboxRoot = undefined;
  state = undefined;
  document.body.classList.remove('blog-image-lightbox-open');
}
