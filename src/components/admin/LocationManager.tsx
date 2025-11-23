import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useData } from '../../contexts/DataContext';
import { Location } from '../../types';
import { MapPin, Wifi, Edit, Trash2, Plus } from 'lucide-react';

export const LocationManager: React.FC = () => {
  const { locations, addLocation, updateLocation, deleteLocation } = useData();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingLocation, setEditingLocation] = useState<Location | null>(null);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h2 className="text-xl font-semibold text-gray-900">Location Manager</h2>
        <Button onClick={() => setShowAddForm(true)} className="flex items-center gap-2">
          <Plus size={16} />
          Add Location
        </Button>
      </div>

      <div className="grid gap-4">
        {locations.map((location) => (
          <LocationCard
            key={location.id}
            location={location}
            onEdit={setEditingLocation}
            onDelete={(id) => deleteLocation(id)}
            onToggleStatus={(id, isActive) => updateLocation(id, { isActive })}
          />
        ))}
      </div>

      {showAddForm && (
        <LocationForm
          onSubmit={(locationData) => {
            addLocation(locationData);
            setShowAddForm(false);
          }}
          onCancel={() => setShowAddForm(false)}
        />
      )}

      {editingLocation && (
        <LocationForm
          location={editingLocation}
          onSubmit={(locationData) => {
            updateLocation(editingLocation.id, locationData);
            setEditingLocation(null);
          }}
          onCancel={() => setEditingLocation(null)}
        />
      )}
    </div>
  );
};

interface LocationCardProps {
  location: Location;
  onEdit: (location: Location) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (id: string, isActive: boolean) => void;
}

const LocationCard: React.FC<LocationCardProps> = ({
  location,
  onEdit,
  onDelete,
  onToggleStatus,
}) => {
  return (
    <Card className="p-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
            location.isActive ? 'bg-orange-100' : 'bg-gray-100'
          }`}>
            <MapPin className={location.isActive ? 'text-orange-600' : 'text-gray-400'} size={24} />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{location.name}</h3>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Wifi size={16} />
              <span>{location.wifiName}</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className={`px-2 py-1 rounded-full text-xs ${
            location.isActive 
              ? 'bg-orange-100 text-orange-700' 
              : 'bg-gray-100 text-gray-700'
          }`}>
            {location.isActive ? 'Active' : 'Inactive'}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(location.id, !location.isActive)}
          >
            {location.isActive ? 'Deactivate' : 'Activate'}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onEdit(location)}
            className="flex items-center gap-1"
          >
            <Edit size={16} />
            Edit
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => onDelete(location.id)}
            className="flex items-center gap-1"
          >
            <Trash2 size={16} />
            Delete
          </Button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Username</p>
          <p className="font-mono text-gray-900">{location.username}</p>
        </div>
        <div className="bg-gray-50 p-3 rounded-lg">
          <p className="text-sm text-gray-600">Password</p>
          <p className="font-mono text-gray-900">{location.password}</p>
        </div>
      </div>
    </Card>
  );
};

interface LocationFormProps {
  location?: Location;
  onSubmit: (location: Omit<Location, 'id'>) => void;
  onCancel: () => void;
}

const LocationForm: React.FC<LocationFormProps> = ({ location, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: location?.name || '',
    wifiName: location?.wifiName || '',
    isActive: location?.isActive ?? true,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md p-6">
        <h3 className="text-lg font-semibold mb-4">
          {location ? 'Edit Location' : 'Add New Location'}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Location Name"
            value={formData.name}
            onChange={(value) => setFormData({ ...formData, name: value })}
            placeholder="e.g., ConetSmart 3"
            required
          />

          <Input
            label="WiFi Network Name"
            value={formData.wifiName}
            onChange={(value) => setFormData({ ...formData, wifiName: value })}
            placeholder="e.g., ConetSmart 3"
            required
          />

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
            />
            <label htmlFor="isActive" className="text-sm text-gray-700">
              Active location
            </label>
          </div>

          <div className="flex gap-3 pt-4">
            <Button type="submit" className="flex-1">
              {location ? 'Update' : 'Add'} Location
            </Button>
            <Button variant="outline" onClick={onCancel} className="flex-1">
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};