import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { 
  Users, 
  UserPlus, 
  Search, 
  Check, 
  X,
  Send
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface Friend {
  id: string;
  requester_id: string;
  addressee_id: string;
  status: 'pending' | 'accepted' | 'declined';
  created_at: string;
  requester_email?: string;
  addressee_email?: string;
}

export default function Friends() {
  const { user } = useAuth();
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchEmail, setSearchEmail] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);

  useEffect(() => {
    fetchFriends();
  }, [user]);

  const fetchFriends = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('friends')
        .select('*')
        .or(`requester_id.eq.${user.id},addressee_id.eq.${user.id}`)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching friends:', error);
      } else {
        setFriends((data || []).map(friend => ({
          ...friend,
          status: friend.status as 'pending' | 'accepted' | 'declined'
        })));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const sendFriendRequest = async () => {
    if (!user || !searchEmail.trim() || inviteLoading) return;

    setInviteLoading(true);
    try {
      // First, check if user exists
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('user_id')
        .eq('user_id', searchEmail); // This would need to be adjusted to search by email

      // For now, we'll create a simple invite system
      const { error } = await supabase
        .from('friends')
        .insert({
          requester_id: user.id,
          addressee_id: searchEmail, // In real app, this would be the found user's ID
          status: 'pending'
        });

      if (error) throw error;

      setSearchEmail('');
      fetchFriends();
    } catch (error) {
      console.error('Error sending friend request:', error);
    } finally {
      setInviteLoading(false);
    }
  };

  const respondToRequest = async (friendId: string, response: 'accepted' | 'declined') => {
    try {
      const { error } = await supabase
        .from('friends')
        .update({ status: response })
        .eq('id', friendId);

      if (error) throw error;

      fetchFriends();
    } catch (error) {
      console.error('Error responding to friend request:', error);
    }
  };

  const acceptedFriends = friends.filter(f => f.status === 'accepted');
  const pendingRequests = friends.filter(f => 
    f.status === 'pending' && f.addressee_id === user?.id
  );
  const sentRequests = friends.filter(f => 
    f.status === 'pending' && f.requester_id === user?.id
  );

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Friends</h1>
        <p className="text-muted-foreground mt-1">
          Connect with friends and share your memories
        </p>
      </div>

      {/* Add Friend */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            Add Friend
          </CardTitle>
          <CardDescription>
            Send a friend request by email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              placeholder="friend@example.com"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              className="flex-1"
            />
            <Button 
              onClick={sendFriendRequest}
              disabled={!searchEmail.trim() || inviteLoading}
              className="gap-2"
            >
              <Send className="h-4 w-4" />
              {inviteLoading ? 'Sending...' : 'Send Request'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Pending Requests */}
      {pendingRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Pending Requests ({pendingRequests.length})</CardTitle>
            <CardDescription>
              Friend requests waiting for your response
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {pendingRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {request.requester_email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">Friend Request</p>
                      <p className="text-sm text-muted-foreground">
                        {request.requester_email || 'Unknown user'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      onClick={() => respondToRequest(request.id, 'accepted')}
                      className="gap-1"
                    >
                      <Check className="h-4 w-4" />
                      Accept
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => respondToRequest(request.id, 'declined')}
                      className="gap-1"
                    >
                      <X className="h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Friends List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            My Friends ({acceptedFriends.length})
          </CardTitle>
          <CardDescription>
            Your connected friends on Rumi
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : acceptedFriends.length === 0 ? (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No friends yet</h3>
              <p className="text-muted-foreground mb-4">
                Start connecting with friends to share your memories
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {acceptedFriends.map((friend) => {
                const friendEmail = friend.requester_id === user?.id 
                  ? friend.addressee_email 
                  : friend.requester_email;
                  
                return (
                  <div
                    key={friend.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border hover:bg-accent transition-colors"
                  >
                    <div className="h-10 w-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-medium">
                      {friendEmail?.charAt(0).toUpperCase() || 'F'}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{friendEmail || 'Friend'}</p>
                      <p className="text-sm text-muted-foreground">
                        Connected {new Date(friend.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      Share Files
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Sent Requests */}
      {sentRequests.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Sent Requests ({sentRequests.length})</CardTitle>
            <CardDescription>
              Friend requests you've sent
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {sentRequests.map((request) => (
                <div
                  key={request.id}
                  className="flex items-center justify-between p-4 rounded-lg border border-border"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center font-medium">
                      {request.addressee_email?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="font-medium">Request Sent</p>
                      <p className="text-sm text-muted-foreground">
                        {request.addressee_email || 'Unknown user'}
                      </p>
                    </div>
                  </div>
                  
                  <span className="text-sm text-muted-foreground">Pending</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}