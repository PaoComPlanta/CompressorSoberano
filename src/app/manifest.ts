import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Compressor Soberano',
    short_name: 'Soberano',
    description: 'Otimizador de imagens e vídeos rápido e seguro.',
    start_url: '/',
    display: 'standalone',
    background_color: '#111827', // Cor de fundo escura
    theme_color: '#2563eb',      // Cor azul do tema
    icons: [
      {
        src: '/icon-192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}