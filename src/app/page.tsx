import ImageCompressor from '@/components/ImageCompressor';

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 transition-colors duration-500 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 dark:from-gray-900 dark:via-gray-900 dark:to-slate-800">
      
      <div className="text-center mb-12 space-y-4">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400 drop-shadow-sm">
          Compressor Soberano
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 max-w-lg mx-auto leading-relaxed">
          Arrasta as tuas imagens e vê o peso desaparecer, mantendo a qualidade real 👑
        </p>
      </div>

      <ImageCompressor />
      
      <footer className="mt-16 text-sm text-gray-400 dark:text-gray-600">
        &copy; 2024 Soberano Dev
      </footer>
    </main>
  );
}