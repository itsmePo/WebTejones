export interface Gig {
  id: string;
  fechaIso: string;
  hora: string;
  lugar: string;
  titulo: string;
  enlace?: string;
}

export function filterUpcomingGigs(bolos: Gig[], currentDate: Date = new Date()): Gig[] {
  const todayStr = currentDate.toISOString().split('T')[0];
  return bolos
    .filter((bolo) => bolo.fechaIso >= todayStr)
    .sort((a, b) => a.fechaIso.localeCompare(b.fechaIso));
}

export function formatGigDate(fechaIso: string): string {
  try {
    const [year, month, day] = fechaIso.split('-').map(Number);
    if (!year || !month || !day) return fechaIso;
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-ES', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return fechaIso;
  }
}
