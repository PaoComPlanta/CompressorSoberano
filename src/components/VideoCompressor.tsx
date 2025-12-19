'use client';

import { useState, useRef, useEffect } from 'react';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { fetchFile, toBlobURL } from '@ffmpeg/util';
import { FiUploadCloud, FiVideo, FiDownload, FiCpu, FiAlertCircle } from 'react-icons/fi';

export default function VideoCompressor() {
  const [loaded, setLoaded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [compressedVideo, setCompressedVideo] = useState<string | null>(null);
  const [status, setStatus] = useState('À espera de ficheiro...');
  const [progress, setProgress] = useState(0);
  const ffmpegRef = useRef(new FFmpeg());

  // Carregar o FFmpeg assim que a página abre
  const load = async () => {
    setIsLoading(true);
    const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
    const ffmpeg = ffmpegRef.current;
    
    // Configurar log de progresso
    ffmpeg.on('progress', ({ progress, time }) => {
      setProgress(Math.round(progress * 100));
    });

    try {
      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
      });
      setLoaded(true);
      setStatus('Motor de vídeo pronto!');
    } catch (error) {
      console.error(error);
      setStatus('Erro ao carregar motor de vídeo.');
    }
    setIsLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const compressVideo = async () => {
    if (!videoFile || !loaded) return;
    
    const ffmpeg = ffmpegRef.current;
    setStatus('A processar vídeo... (Isto pode demorar)');
    
    // 1. Escrever o ficheiro na memória do FFmpeg
    await ffmpeg.writeFile('input.mp4', await fetchFile(videoFile));

    // 2. Executar comando de compressão
    // -vf scale=-1:720 -> Reduz para 720p (mantendo ratio)
    // -crf 28 -> Fator de compressão (quanto maior, menor qualidade. 23 é padrão, 28 é comprimido)
    // -preset ultrafast -> Para ser mais rápido no browser
    await ffmpeg.exec([
      '-i', 'input.mp4',
      '-vf', 'scale=-1:720', 
      '-c:v', 'libx264', 
      '-crf', '30', 
      '-preset', 'ultrafast', 
      'output.mp4'
    ]);

    // 3. Ler o resultado
    const data = await ffmpeg.readFile('output.mp4');
    const url = URL.createObjectURL(new Blob([data as any], { type: 'video/mp4' }));
    
    setCompressedVideo(url);
    setStatus('Concluído!');
  };

  return (
    <div className="w-full max-w-xl mx-auto space-y-6">
      {!loaded ? (
        <div className="text-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl">
          {isLoading ? (
            <>
              <FiCpu className="w-12 h-12 mx-auto text-blue-500 animate-spin mb-4" />
              <p className="text-gray-600 dark:text-gray-300">A carregar motor de vídeo (30MB)...</p>
            </>
          ) : (
            <button onClick={load} className="bg-blue-600 text-white px-4 py-2 rounded">Tentar Carregar Novamente</button>
          )}
        </div>
      ) : (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-800">
          
          {/* Upload Area */}
          {!videoFile ? (
             <div className="text-center space-y-4">
                <FiVideo className="w-16 h-16 mx-auto text-blue-500 mb-2" />
                <h3 className="text-xl font-bold text-gray-700 dark:text-gray-200">Compressor de Vídeo</h3>
                <p className="text-sm text-gray-500">Suporta MP4, MOV, MKV (Máx recomendado: 50MB)</p>
                
                <label className="cursor-pointer bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg inline-block transition">
                  Escolher Vídeo
                  <input type="file" accept="video/*" onChange={(e) => setVideoFile(e.target.files?.[0] || null)} className="hidden" />
                </label>
             </div>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                 <FiVideo className="text-blue-500 w-8 h-8" />
                 <div className="flex-1 overflow-hidden">
                    <p className="font-medium truncate dark:text-white">{videoFile.name}</p>
                    <p className="text-xs text-gray-500">{(videoFile.size / 1024 / 1024).toFixed(2)} MB</p>
                 </div>
                 <button onClick={() => {setVideoFile(null); setCompressedVideo(null);}} className="text-red-500 text-sm hover:underline">Remover</button>
              </div>

              {/* Botão de Ação */}
              {!compressedVideo && (
                <div className="space-y-2">
                    <button 
                        onClick={compressVideo}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-bold transition flex items-center justify-center gap-2"
                    >
                        {progress > 0 && progress < 100 ? `A processar ${progress}%` : 'Iniciar Compressão'}
                    </button>
                    {progress > 0 && (
                        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
                            <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    )}
                </div>
              )}

              {/* Resultado */}
              {compressedVideo && (
                <div className="animate-in fade-in slide-in-from-bottom-4">
                    <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg mb-4 text-center">
                        <p className="text-green-800 dark:text-green-300 font-bold mb-2">Vídeo Pronto!</p>
                        <video src={compressedVideo} controls className="w-full rounded-lg max-h-60 bg-black" />
                    </div>
                    <a 
                        href={compressedVideo} 
                        download={`soberano-${videoFile.name}`}
                        className="block w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-center py-3 rounded-lg font-bold transition hover:scale-[1.02]"
                    >
                        📥 Descarregar Vídeo
                    </a>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      
      <div className="flex items-start gap-2 text-xs text-yellow-600 dark:text-yellow-500 bg-yellow-50 dark:bg-yellow-900/20 p-3 rounded-lg">
        <FiAlertCircle className="shrink-0 text-lg" />
        <p>Nota: A compressão de vídeo acontece no teu processador. Ficheiros grandes podem fazer o computador ficar lento momentaneamente.</p>
      </div>
    </div>
  );
}