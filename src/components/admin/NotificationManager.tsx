import React, { useState, useEffect } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { supabase } from '../../utils/supabase';
import { 
  Bell, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff, 
  Calendar,
  Users,
  Video,
  AlertCircle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react';

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  description?: string;
  video_url?: string;
  youtube_url?: string;
  target_audience: 'all' | 'new_users' | 'specific_users';
  is_active: boolean;
  show_as_popup: boolean;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  expires_at?: string;
  created_at: string;
  updated_at: string;
  view_count?: number;
}

export const NotificationManager: React.FC = () => {
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingNotification, setEditingNotification] = useState<AdminNotification | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_notifications')
        .select(`
          *,
          user_notification_views(count)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading notifications:', error);
        return;
      }

      // Transform data to include view count
      const notificationsWithCounts = data.map(notification => ({
        ...notification,
        view_count: notification.user_notification_views?.length || 0
      }));

      setNotifications(notificationsWithCounts);
    } catch (error) {
      console.error('Error loading notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleNotificationStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .update({ 
          is_active: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error('Error updating notification status:', error);
        return;
      }

      setNotifications(prev => prev.map(notification => 
        notification.id === id 
          ? { ...notification, is_active: !currentStatus }
          : notification
      ));
    } catch (error) {
      console.error('Error updating notification status:', error);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const { error } = await supabase
        .from('admin_notifications')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting notification:', error);
        return;
      }

      setNotifications(prev => prev.filter(notification => notification.id !== id));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <Zap className="text-red-600" size={16} />;
      case 'high':
        return <AlertCircle className="text-orange-600" size={16} />;
      case 'normal':
        return <CheckCircle className="text-orange-600" size={16} />;
      case 'low':
        return <Clock className="text-gray-600" size={16} />;
      default:
        return <Bell className="text-orange-600" size={16} />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-700';
      case 'high':
        return 'bg-orange-100 text-orange-700';
      case 'normal':
        return 'bg-orange-100 text-orange-700';
      case 'low':
        return 'bg-gray-100 text-gray-700';
      default:
        return 'bg-orange-100 text-orange-700';
    }
  };

  const getTargetAudienceDisplay = (target: string) => {
    switch (target) {
      case 'all':
        return 'All Users';
      case 'new_users':
        return 'New Users Only';
      case 'specific_users':
        return 'Specific Users';
      default:
        return target;
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-6">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border border-gray-200 rounded-lg p-4">
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Notification Manager</h2>
          <p className="text-gray-600">Create and manage user notifications and announcements</p>
        </div>
        <Button 
          onClick={() => setShowForm(true)} 
          className="flex items-center gap-2"
        >
          <Plus size={16} />
          Create Notification
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Bell className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-xl font-bold text-gray-900">{notifications.length}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Eye className="text-orange-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications.filter(n => n.is_active).length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Users className="text-yellow-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">For New Users</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications.filter(n => n.target_audience === 'new_users').length}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Video className="text-purple-600" size={20} />
            </div>
            <div>
              <p className="text-sm text-gray-600">With Video</p>
              <p className="text-xl font-bold text-gray-900">
                {notifications.filter(n => n.video_url || n.youtube_url).length}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Notifications List */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">All Notifications</h3>
        
        {notifications.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Bell className="text-gray-400" size={24} />
            </div>
            <h3 className="font-medium text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600 mb-4">Create your first notification to communicate with users</p>
            <Button onClick={() => setShowForm(true)}>
              Create Notification
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {notifications.map((notification) => (
              <div
                key={notification.id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {getPriorityIcon(notification.priority)}
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(notification.priority)}`}>
                        {notification.priority}
                      </span>
                      {notification.is_active ? (
                        <span className="text-xs px-2 py-1 rounded-full bg-orange-100 text-orange-700">
                          Active
                        </span>
                      ) : (
                        <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                          Inactive
                        </span>
                      )}
                    </div>
                    
                    <p className="text-gray-600 mb-2">{notification.message}</p>
                    
                    {notification.description && (
                      <p className="text-sm text-gray-500 mb-2">{notification.description}</p>
                    )}
                    
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <Users size={14} />
                        <span>{getTargetAudienceDisplay(notification.target_audience)}</span>
                      </div>
                      
                      {notification.view_count !== undefined && (
                        <div className="flex items-center gap-1">
                          <Eye size={14} />
                          <span>{notification.view_count} views</span>
                        </div>
                      )}
                      
                      {(notification.video_url || notification.youtube_url) && (
                        <div className="flex items-center gap-1">
                          <Video size={14} />
                          <span>Has video</span>
                        </div>
                      )}
                      
                      {notification.expires_at && (
                        <div className="flex items-center gap-1">
                          <Calendar size={14} />
                          <span>Expires {new Date(notification.expires_at).toLocaleDateString()}</span>
                        </div>
                      )}
                      
                      <span>Created {new Date(notification.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleNotificationStatus(notification.id, notification.is_active)}
                      className="flex items-center gap-1"
                    >
                      {notification.is_active ? <EyeOff size={16} /> : <Eye size={16} />}
                      {notification.is_active ? 'Deactivate' : 'Activate'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setEditingNotification(notification);
                        setShowForm(true);
                      }}
                      className="flex items-center gap-1"
                    >
                      <Edit size={16} />
                      Edit
                    </Button>
                    
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => setDeleteConfirm(notification.id)}
                      className="flex items-center gap-1"
                    >
                      <Trash2 size={16} />
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Create/Edit Form */}
      {showForm && (
        <NotificationForm
          notification={editingNotification}
          onSubmit={async (notificationData) => {
            if (editingNotification) {
              // Update existing notification
              const { error } = await supabase
                .from('admin_notifications')
                .update({
                  ...notificationData,
                  updated_at: new Date().toISOString()
                })
                .eq('id', editingNotification.id);

              if (!error) {
                await loadNotifications();
                setShowForm(false);
                setEditingNotification(null);
              }
            } else {
              // Create new notification
              const { error } = await supabase
                .from('admin_notifications')
                .insert([notificationData]);

              if (!error) {
                await loadNotifications();
                setShowForm(false);
              }
            }
          }}
          onCancel={() => {
            setShowForm(false);
            setEditingNotification(null);
          }}
        />
      )}

      {/* Delete Confirmation */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <Card className="w-full max-w-sm p-6">
            <h3 className="text-lg font-semibold mb-4 text-center">Delete Notification</h3>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this notification? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={() => setDeleteConfirm(null)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                onClick={() => deleteNotification(deleteConfirm)}
                className="flex-1"
              >
                Delete
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

interface NotificationFormProps {
  notification?: AdminNotification | null;
  onSubmit: (data: any) => Promise<void>;
  onCancel: () => void;
}

const NotificationForm: React.FC<NotificationFormProps> = ({
  notification,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: notification?.title || '',
    message: notification?.message || '',
    description: notification?.description || '',
    video_url: notification?.video_url || '',
    youtube_url: notification?.youtube_url || '',
    target_audience: notification?.target_audience || 'all',
    priority: notification?.priority || 'normal',
    show_as_popup: notification?.show_as_popup || false,
    expires_at: notification?.expires_at ? new Date(notification.expires_at).toISOString().split('T')[0] : '',
    is_active: notification?.is_active ?? true
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const submitData = {
      ...formData,
      expires_at: formData.expires_at ? new Date(formData.expires_at + 'T23:59:59').toISOString() : null,
      video_url: formData.video_url || null,
      youtube_url: formData.youtube_url || null,
      description: formData.description || null
    };

    await onSubmit(submitData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">
            {notification ? 'Edit Notification' : 'Create New Notification'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Title"
              value={formData.title}
              onChange={(value) => setFormData({ ...formData, title: value })}
              placeholder="e.g., Welcome to ConetSmart!"
              required
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Message *
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="Main notification message that users will see"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={3}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description (Optional)
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Additional details or instructions"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
                rows={2}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Video URL (Optional)"
                value={formData.video_url}
                onChange={(value) => setFormData({ ...formData, video_url: value })}
                placeholder="https://example.com/video.mp4"
              />

              <Input
                label="YouTube URL (Optional)"
                value={formData.youtube_url}
                onChange={(value) => setFormData({ ...formData, youtube_url: value })}
                placeholder="https://youtube.com/watch?v=..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Target Audience
                </label>
                <select
                  value={formData.target_audience}
                  onChange={(e) => setFormData({ ...formData, target_audience: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="all">All Users</option>
                  <option value="new_users">New Users Only (&lt; 7 days)</option>
                  <option value="specific_users">Specific Users</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Choose who can see this notification</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority Level
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                >
                  <option value="low">Low - General info</option>
                  <option value="normal">Normal - Standard updates</option>
                  <option value="high">High - Important news</option>
                  <option value="urgent">Urgent - Critical alerts</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Higher priority notifications appear first</p>
              </div>
            </div>

            <div>
              <Input
                label="Expiry Date (Optional)"
                type="date"
                value={formData.expires_at}
                onChange={(value) => setFormData({ ...formData, expires_at: value })}
              />
              <p className="text-xs text-gray-500 mt-1">
                Notification will automatically hide after this date. Leave empty for permanent notification.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="show_as_popup" className="text-sm font-medium text-gray-700">
                    Show as popup modal
                  </label>
                  <p className="text-xs text-gray-500">High priority notifications can appear as modal popups</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="show_as_popup"
                    checked={formData.show_as_popup}
                    onChange={(e) => setFormData({ ...formData, show_as_popup: e.target.checked })}
                    className="sr-only"
                  />
                  <label
                    htmlFor="show_as_popup"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.show_as_popup ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.show_as_popup ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <label htmlFor="is_active" className="text-sm font-medium text-gray-700">
                    Active immediately
                  </label>
                  <p className="text-xs text-gray-500">Notification will be visible to users right away</p>
                </div>
                <div className="relative">
                  <input
                    type="checkbox"
                    id="is_active"
                    checked={formData.is_active}
                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                    className="sr-only"
                  />
                  <label
                    htmlFor="is_active"
                    className={`block w-12 h-6 rounded-full cursor-pointer transition-colors ${
                      formData.is_active ? 'bg-orange-500' : 'bg-gray-300'
                    }`}
                  >
                    <span
                      className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${
                        formData.is_active ? 'translate-x-6' : 'translate-x-0.5'
                      } mt-0.5`}
                    />
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" className="flex-1">
                {notification ? 'Update' : 'Create'} Notification
              </Button>
              <Button variant="outline" onClick={onCancel} className="flex-1">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};