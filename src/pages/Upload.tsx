import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { 
  Upload as UploadIcon, 
  File, 
  X, 
  CheckCircle, 
  AlertCircle,
  Image as ImageIcon,
  Video,
  Music,
  FileText
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface FileUpload {
  file: File;
  id: string;
  progress: number;
  status: 'pending' | 'uploading' | 'completed' | 'error';
  error?: string;
}

export default function Upload() {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [files, setFiles] = useState<FileUpload[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);

  const generateId = () => Math.random().toString(36).substring(2, 15);

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-6 w-6 text-green-500" />;
    if (type.startsWith('video/')) return <Video className="h-6 w-6 text-blue-500" />;
    if (type.startsWith('audio/')) return <Music className="h-6 w-6 text-purple-500" />;
    return <FileText className="h-6 w-6 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleFiles = (fileList: FileList) => {
    const newFiles: FileUpload[] = Array.from(fileList).map(file => ({
      file,
      id: generateId(),
      progress: 0,
      status: 'pending' as const
    }));

    setFiles(prev => [...prev, ...newFiles]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(e.target.files);
    }
  };

  const removeFile = (id: string) => {
    setFiles(prev => prev.filter(f => f.id !== id));
  };

  const uploadFile = async (fileUpload: FileUpload) => {
    if (!user) return;

    const { file, id } = fileUpload;
    
    setFiles(prev => prev.map(f => 
      f.id === id ? { ...f, status: 'uploading' as const } : f
    ));

    try {
      // Create file path
      const fileName = `${Date.now()}-${file.name}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload to storage
      const { error: storageError } = await supabase.storage
        .from('user-files')
        .upload(filePath, file);

      // Simulate progress for UI feedback
      for (let i = 0; i <= 100; i += 20) {
        setFiles(prev => prev.map(f => 
          f.id === id ? { ...f, progress: i } : f
        ));
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (storageError) throw storageError;

      // Save file metadata to database
      const { error: dbError } = await supabase
        .from('files')
        .insert({
          user_id: user.id,
          name: file.name,
          size: file.size,
          type: file.type,
          file_path: filePath
        });

      if (dbError) throw dbError;

      setFiles(prev => prev.map(f => 
        f.id === id ? { ...f, status: 'completed' as const, progress: 100 } : f
      ));

      toast({
        title: "Upload successful",
        description: `${file.name} has been uploaded`
      });

    } catch (error: any) {
      setFiles(prev => prev.map(f => 
        f.id === id ? { 
          ...f, 
          status: 'error' as const, 
          error: error.message || 'Upload failed'
        } : f
      ));

      toast({
        title: "Upload failed",
        description: error.message || 'Failed to upload file',
        variant: "destructive"
      });
    }
  };

  const uploadAll = () => {
    files
      .filter(f => f.status === 'pending')
      .forEach(uploadFile);
  };

  const clearCompleted = () => {
    setFiles(prev => prev.filter(f => f.status !== 'completed'));
  };

  const pendingFiles = files.filter(f => f.status === 'pending');
  const completedFiles = files.filter(f => f.status === 'completed');

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Upload Files</h1>
        <p className="text-muted-foreground mt-1">
          Share your photos, videos, documents, and more
        </p>
      </div>

      {/* Upload Area */}
      <Card>
        <CardContent className="p-8">
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors duration-200 ${
              isDragOver
                ? 'border-primary bg-primary/5'
                : 'border-border hover:border-primary/50 hover:bg-primary/5'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
          >
            <UploadIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Drag and drop files here
            </h3>
            <p className="text-muted-foreground mb-4">
              Or click to select files from your computer
            </p>
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="gap-2"
            >
              <UploadIcon className="h-4 w-4" />
              Choose Files
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              className="hidden"
              onChange={handleFileSelect}
              accept="*/*"
            />
            <p className="text-sm text-muted-foreground mt-4">
              Supports all file types • Maximum 50MB per file
            </p>
          </div>
        </CardContent>
      </Card>

      {/* File List */}
      {files.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Upload Queue</CardTitle>
              <CardDescription>
                {pendingFiles.length} pending • {completedFiles.length} completed
              </CardDescription>
            </div>
            <div className="flex gap-2">
              {completedFiles.length > 0 && (
                <Button variant="outline" onClick={clearCompleted}>
                  Clear Completed
                </Button>
              )}
              {pendingFiles.length > 0 && (
                <Button onClick={uploadAll}>
                  Upload All ({pendingFiles.length})
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {files.map((fileUpload) => (
                <div
                  key={fileUpload.id}
                  className="flex items-center gap-4 p-4 rounded-lg border border-border"
                >
                  {getFileIcon(fileUpload.file.type)}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <p className="font-medium truncate">{fileUpload.file.name}</p>
                      <span className="text-sm text-muted-foreground">
                        {formatFileSize(fileUpload.file.size)}
                      </span>
                    </div>
                    
                    {fileUpload.status === 'uploading' && (
                      <Progress value={fileUpload.progress} className="h-2" />
                    )}
                    
                    {fileUpload.status === 'error' && (
                      <p className="text-sm text-destructive">{fileUpload.error}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    {fileUpload.status === 'pending' && (
                      <>
                        <Button
                          size="sm"
                          onClick={() => uploadFile(fileUpload)}
                        >
                          Upload
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeFile(fileUpload.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    {fileUpload.status === 'uploading' && (
                      <div className="flex items-center text-sm text-muted-foreground">
                        {Math.round(fileUpload.progress)}%
                      </div>
                    )}
                    
                    {fileUpload.status === 'completed' && (
                      <CheckCircle className="h-5 w-5 text-green-500" />
                    )}
                    
                    {fileUpload.status === 'error' && (
                      <AlertCircle className="h-5 w-5 text-destructive" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}