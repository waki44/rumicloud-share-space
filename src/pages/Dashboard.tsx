import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Upload, 
  Search, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Music,
  MoreHorizontal,
  Plus
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface FileItem {
  id: string;
  name: string;
  type: string;
  size: number;
  created_at: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchRecentFiles();
  }, [user]);

  const fetchRecentFiles = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) {
        console.error('Error fetching files:', error);
      } else {
        setFiles(data || []);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getFileIcon = (type: string) => {
    if (type.startsWith('image/')) return <ImageIcon className="h-8 w-8 text-green-500" />;
    if (type.startsWith('video/')) return <Video className="h-8 w-8 text-blue-500" />;
    if (type.startsWith('audio/')) return <Music className="h-8 w-8 text-purple-500" />;
    return <FileText className="h-8 w-8 text-gray-500" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Welcome back, {user?.user_metadata?.display_name || 'User'}!
          </h1>
          <p className="text-muted-foreground mt-1">
            Manage your files and connect with friends
          </p>
        </div>
        
        <Button 
          onClick={() => navigate('/upload')}
          className="gap-2 shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <Plus className="h-4 w-4" />
          Upload File
        </Button>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search your files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate('/upload')}>
          <CardContent className="flex items-center p-6">
            <Upload className="h-8 w-8 text-primary mr-4" />
            <div>
              <h3 className="font-semibold">Upload Files</h3>
              <p className="text-sm text-muted-foreground">Add new content</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate('/files')}>
          <CardContent className="flex items-center p-6">
            <FileText className="h-8 w-8 text-blue-500 mr-4" />
            <div>
              <h3 className="font-semibold">My Files</h3>
              <p className="text-sm text-muted-foreground">{files.length} files</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate('/friends')}>
          <CardContent className="flex items-center p-6">
            <ImageIcon className="h-8 w-8 text-green-500 mr-4" />
            <div>
              <h3 className="font-semibold">Friends</h3>
              <p className="text-sm text-muted-foreground">Manage connections</p>
            </div>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow duration-300" onClick={() => navigate('/settings')}>
          <CardContent className="flex items-center p-6">
            <Video className="h-8 w-8 text-purple-500 mr-4" />
            <div>
              <h3 className="font-semibold">Settings</h3>
              <p className="text-sm text-muted-foreground">Account options</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Files */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Recent Files</CardTitle>
            <CardDescription>Your recently uploaded files</CardDescription>
          </div>
          <Button variant="outline" onClick={() => navigate('/files')}>
            View All
          </Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : files.length === 0 ? (
            <div className="text-center py-8">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No files yet</h3>
              <p className="text-muted-foreground mb-4">
                Start by uploading your first file to Rumi
              </p>
              <Button onClick={() => navigate('/upload')}>
                <Upload className="h-4 w-4 mr-2" />
                Upload File
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors duration-200 cursor-pointer"
                >
                  {getFileIcon(file.type)}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(file.size)} • {formatDate(file.created_at)}
                    </p>
                  </div>
                  <Button variant="ghost" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}