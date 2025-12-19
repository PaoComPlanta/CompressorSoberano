'use client';

import VideoCompressor from './VideoCompressor'; // <--- Adiciona isto
import { useState, useCallback } from 'react';
import imageCompression from 'browser-image-compression';
import { FiUploadCloud, FiCheckCircle, FiDownload, FiImage, FiCpu, FiTrash2, FiSettings, FiVideo, FiFolder } from 'react-icons/fi';
import { useDropzone } from 'react-dropzone'; // Vamos precisar disto, mas por agora usamos o nativo para não complicar instalações

// Tipo para gerir cada ficheiro individualmente
interface ImageFile {
  id: string;
  original: File;
  compressed: File | null;
  status: 'pending' | 'compressing' | 'done' | 'error';
  originalSize: number;
  compressedSize: number;
}

export default function ImageCompressor() {
  const [activeTab, setActiveTab] = useState<'image' | 'video'>('image');
  const [files, setFiles] = useState<ImageFile[]>([]);
  const [quality, setQuality] = useState(80); // Default 80%
  const [isProcessingBatch, setIsProcessingBatch] = useState(false);

  // Função para processar múltiplos ficheiros
  const processFiles = async (newFiles: File[]) => {
    // Adiciona os novos ficheiros à lista
    const newEntries: ImageFile[] = newFiles
      .filter(f => f.type.startsWith('image/'))
      .map(f => ({
        id: Math.random().toString(36).substr(2, 9),
        original: f,
        compressed: null,
        status: 'pending',
        originalSize: f.size,
        compressedSize: 0
      }));

    setFiles(prev => [...prev, ...newEntries]);
    compressBatch([...files, ...newEntries].filter(f => f.status === 'pending'));
  };

  // Função que comprime a lista
  const compressBatch = async (pendingFiles: ImageFile[]) => {
    setIsProcessingBatch(true);
    
    // Processa um a um para não bloquear o browser
    for (const fileObj of pendingFiles) {
      // Atualiza estado para comprimindo
      setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'compressing' } : f));

      const options = {
        maxSizeMB: 2, // Limite seguro
        maxWidthOrHeight: 1920,
        useWebWorker: true,
        initialQuality: quality / 100, // Usa o valor do slider
      };

      try {
        const compressedBlob = await imageCompression(fileObj.original, options);
        
        setFiles(prev => prev.map(f => f.id === fileObj.id ? {
          ...f,
          compressed: compressedBlob,
          compressedSize: compressedBlob.size,
          status: 'done'
        } : f));
      } catch (error) {
        console.error(error);
        setFiles(prev => prev.map(f => f.id === fileObj.id ? { ...f, status: 'error' } : f));
      }
    }
    setIsProcessingBatch(false);
  };

  // Drag & Drop
  const onDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      processFiles(Array.from(e.dataTransfer.files));
    }
  }, [quality, files]); // Recria a função se a qualidade mudar

  // Remover ficheiro da lista
  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  // Download Individual
  const handleDownload = (fileObj: ImageFile) => {
    if (!fileObj.compressed) return;
    const url = URL.createObjectURL(fileObj.compressed);
    const link = document.createElement('a');
    link.href = url;
    link.download = `soberano-${fileObj.original.name}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Renderização da Aba de Vídeo (Placeholder)
// Renderização da Aba de Vídeo
  if (activeTab === 'video') {
    return (
      <div className="w-full max-w-2xl mx-auto space-y-6">
        {/* Menu de Abas (Igual ao de cima para manter consistência) */}
        <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-sm mx-auto">
          <button onClick={() => setActiveTab('image')} className="flex-1 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2">
            <FiImage /> Imagens
          </button>
          <button onClick={() => setActiveTab('video')} className="flex-1 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400 transition flex items-center justify-center gap-2">
            <FiVideo /> Vídeos
          </button>
        </div>

        {/* O Novo Componente */}
        <VideoCompressor />
        
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* ABAS */}
      <div className="flex gap-2 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg max-w-sm mx-auto">
        <button onClick={() => setActiveTab('image')} className="flex-1 py-2 rounded-md text-sm font-medium bg-white dark:bg-gray-700 shadow text-blue-600 dark:text-blue-400 transition flex items-center justify-center gap-2">
          <FiImage /> Imagens
        </button>
        <button onClick={() => setActiveTab('video')} className="flex-1 py-2 rounded-md text-sm font-medium text-gray-500 hover:text-gray-900 dark:hover:text-white transition flex items-center justify-center gap-2">
          <FiVideo /> Vídeos
        </button>
      </div>

      {/* PAINEL PRINCIPAL */}
      <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-gray-800">
        
        {/* SLIDER DE QUALIDADE */}
        <div className="p-6 border-b border-gray-100 dark:border-gray-800">
          <div className="flex justify-between items-center mb-2">
            <label className="flex items-center gap-2 text-sm font-bold text-gray-700 dark:text-gray-300">
              <FiSettings /> Qualidade de Compressão
            </label>
            <span className="text-sm font-mono text-blue-600 dark:text-blue-400">{quality}%</span>
          </div>
          <input 
            type="range" 
            min="10" 
            max="100" 
            value={quality} 
            onChange={(e) => setQuality(Number(e.target.value))}
            className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer dark:bg-gray-700 accent-blue-600"
          />
          <p className="text-xs text-gray-500 mt-2 text-right">Menos qualidade = Ficheiro mais pequeno</p>
        </div>

        {/* ÁREA DE DRAG & DROP */}
        <div 
          className="p-8 border-b-2 border-dashed border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors text-center cursor-pointer"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <label className="cursor-pointer block">
            <FiFolder className="w-12 h-12 mx-auto text-blue-500 mb-3" />
            <p className="text-lg font-medium text-gray-700 dark:text-gray-200">
              Arrasta imagens ou uma pasta inteira
            </p>
            <p className="text-sm text-gray-500 mb-4">Suporta processamento em lote (Batch)</p>
            <span className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg font-medium text-sm">
              Selecionar Ficheiros
            </span>
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={(e) => e.target.files && processFiles(Array.from(e.target.files))} 
              className="hidden" 
            />
          </label>
        </div>

        {/* LISTA DE FICHEIROS */}
        {files.length > 0 && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800/30 max-h-96 overflow-y-auto space-y-3">
            <div className="flex justify-between items-center mb-2 px-2">
              <span className="text-xs font-bold uppercase text-gray-500">Lista de Ficheiros ({files.length})</span>
              <button onClick={() => setFiles([])} className="text-xs text-red-500 hover:text-red-600 font-medium">Limpar Tudo</button>
            </div>

            {files.map((file) => (
              <div key={file.id} className="flex items-center gap-4 p-3 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-100 dark:border-gray-700 animate-in slide-in-from-bottom-2">
                {/* Ícone de estado */}
                <div className="shrink-0">
                  {file.status === 'compressing' && <FiCpu className="animate-spin text-blue-500" />}
                  {file.status === 'done' && <FiCheckCircle className="text-green-500" />}
                  {file.status === 'pending' && <div className="w-4 h-4 rounded-full border-2 border-gray-300" />}
                  {file.status === 'error' && <div className="w-4 h-4 rounded-full bg-red-500" />}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-700 dark:text-gray-200 truncate">{file.original.name}</p>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>Original: {(file.originalSize / 1024 / 1024).toFixed(2)} MB</span>
                    {file.status === 'done' && (
                      <>
                        <span>→</span>
                        <span className="text-green-600 font-bold">{(file.compressedSize / 1024 / 1024).toFixed(2)} MB</span>
                        <span className="bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 px-1.5 rounded text-[10px]">
                          -{((1 - file.compressedSize / file.originalSize) * 100).toFixed(0)}%
                        </span>
                      </>
                    )}
                  </div>
                </div>

                {/* Ações */}
                <div className="flex items-center gap-2">
                  {file.status === 'done' && (
                    <button 
                      onClick={() => handleDownload(file)}
                      className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-blue-600 transition"
                      title="Descarregar"
                    >
                      <FiDownload />
                    </button>
                  )}
                  <button 
                    onClick={() => removeFile(file.id)}
                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-gray-400 hover:text-red-500 transition"
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}