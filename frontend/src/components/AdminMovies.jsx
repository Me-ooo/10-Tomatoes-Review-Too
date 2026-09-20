import React, { useState, useEffect } from 'react';
import { getAdminMovies, deleteAdminMovie, createAdminMovie, updateAdminMovie } from '../services/api';

const AdminMovies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMovie, setEditingMovie] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    releaseYear: '',
    genres: '',
    director: '',
    synopsis: '',
    posterUrl: ''
  });

  const fetchMovies = async () => {
    try {
      setLoading(true);
      const data = await getAdminMovies();
      setMovies(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this movie?')) {
      try {
        await deleteAdminMovie(id);
        fetchMovies();
      } catch (err) {
        alert('Failed to delete movie');
      }
    }
  };

  const handleOpenModal = (movie = null) => {
    if (movie) {
      setEditingMovie(movie);
      setFormData({
        title: movie.title || '',
        releaseYear: movie.releaseYear || '',
        genres: movie.genres ? movie.genres.join(', ') : '',
        director: movie.director || '',
        synopsis: movie.synopsis || '',
        posterUrl: movie.posterUrl || ''
      });
    } else {
      setEditingMovie(null);
      setFormData({
        title: '',
        releaseYear: '',
        genres: '',
        director: '',
        synopsis: '',
        posterUrl: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        genres: formData.genres.split(',').map(g => g.trim()).filter(Boolean)
      };

      if (editingMovie) {
        await updateAdminMovie(editingMovie._id, payload);
      } else {
        await createAdminMovie(payload);
      }
      setIsModalOpen(false);
      fetchMovies();
    } catch (err) {
      alert('Failed to save movie');
    }
  };

  if (loading) return <div>Loading movies...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">Manage Movies</h2>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded"
        >
          Add Movie
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Title</th>
              <th className="px-4 py-3 text-left">Year</th>
              <th className="px-4 py-3 text-left">Director</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {movies.map(movie => (
              <tr key={movie._id} className="hover:bg-gray-750">
                <td className="px-4 py-3">{movie.title}</td>
                <td className="px-4 py-3">{movie.releaseYear}</td>
                <td className="px-4 py-3">{movie.director}</td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => handleOpenModal(movie)}
                    className="text-blue-400 hover:text-blue-300 mr-3"
                  >
                    Edit
                  </button>
                  <button 
                    onClick={() => handleDelete(movie._id)}
                    className="text-red-400 hover:text-red-300"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold mb-4">
              {editingMovie ? 'Edit Movie' : 'Add Movie'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm mb-1">Title</label>
                <input 
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2 text-white" 
                  required 
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Release Year</label>
                  <input 
                    type="number" 
                    value={formData.releaseYear}
                    onChange={e => setFormData({...formData, releaseYear: e.target.value})}
                    className="w-full bg-gray-700 rounded p-2 text-white" 
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm mb-1">Director</label>
                  <input 
                    type="text" 
                    value={formData.director}
                    onChange={e => setFormData({...formData, director: e.target.value})}
                    className="w-full bg-gray-700 rounded p-2 text-white" 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm mb-1">Genres (comma separated)</label>
                <input 
                  type="text" 
                  value={formData.genres}
                  onChange={e => setFormData({...formData, genres: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Poster URL</label>
                <input 
                  type="url" 
                  value={formData.posterUrl}
                  onChange={e => setFormData({...formData, posterUrl: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2 text-white" 
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Synopsis</label>
                <textarea 
                  value={formData.synopsis}
                  onChange={e => setFormData({...formData, synopsis: e.target.value})}
                  className="w-full bg-gray-700 rounded p-2 text-white h-24" 
                  required 
                />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-4 py-2 bg-red-600 rounded hover:bg-red-700 text-white"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminMovies;
