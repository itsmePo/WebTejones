export function validateYoutubeId(id: string): boolean {
  const regex = /^[a-zA-Z0-9_-]{11}$/;
  return regex.test(id);
}

export function buildEmbedUrl(id: string): string {
  if (!validateYoutubeId(id)) {
    throw new Error('ID de YouTube inválido');
  }
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function watchUrl(id: string): string {
  if (!validateYoutubeId(id)) {
    throw new Error('ID de YouTube inválido');
  }
  return `https://www.youtube.com/watch?v=${id}`;
}
