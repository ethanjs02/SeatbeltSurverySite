/*'use client';

import { useState, useEffect } from 'react';
import { api } from '../services/api';

interface DataCollection {
  id: string;
  name: string;
  description: string;
  createdAt: string;
  items: number;
}

export default function DataCollectionsList() {
  const [collections, setCollections] = useState<DataCollection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCollections = async () => {
      try {
        setLoading(true);
        //const collectionsData = await api.data.getCollections();
        
        const users = await api.users.getUsers();
        //setCollections(collectionsData);
        console.log('Raw users response:', users);
        console.log('Users type:', typeof users);
        console.log('Users prototype:', Object.getPrototypeOf(users));
        
        // Try to check the response structure
        if (users && typeof users === 'object') {
          if (Array.isArray(users)) {
            console.log('Users is an array with length:', users.length);
          } else {
            console.log('Users is an object with keys:', Object.keys(users));
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('Error fetching collections:', err);
        setError('Failed to load data collections. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCollections();
  }, []);

  const handleUpload = async (collectionId: string, event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }

    const file = event.target.files[0];
    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      await api.data.uploadData(collectionId, formData);
      
      // Refresh the collections after upload
      const collectionsData = await api.data.getCollections();
      setCollections(collectionsData);
      
      alert('File uploaded successfully!');
    } catch (err) {
      console.error('Error uploading file:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading && collections.length === 0) {
    return <div className="p-4">Loading data collections...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (collections.length === 0) {
    return <div className="p-4">No data collections found.</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Data Collections</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {collections.map((collection) => (
          <div key={collection.id} className="border rounded-lg p-4 shadow-sm">
            <h3 className="text-lg font-semibold">{collection.name}</h3>
            <p className="text-gray-600 mb-2">{collection.description}</p>
            <div className="flex justify-between text-sm text-gray-500">
              <span>Items: {collection.items}</span>
              <span>Created: {new Date(collection.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="mt-4">
              <label className="inline-block bg-blue-500 text-white px-4 py-2 rounded cursor-pointer hover:bg-blue-600">
                Upload Data
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleUpload(collection.id, e)}
                />
              </label>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 

export default DataCollectionsList;*/