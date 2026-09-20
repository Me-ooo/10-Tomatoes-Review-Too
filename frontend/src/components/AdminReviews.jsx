import React, { useState, useEffect } from 'react';
import { getAdminReviews, deleteAdminReview } from '../services/api';

const AdminReviews = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAdminReviews();
      setReviews(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await deleteAdminReview(id);
        fetchReviews();
      } catch (err) {
        alert('Failed to delete review');
      }
    }
  };

  if (loading) return <div>Loading reviews...</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Moderate Reviews</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 text-white rounded-lg overflow-hidden">
          <thead className="bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Movie</th>
              <th className="px-4 py-3 text-left">User</th>
              <th className="px-4 py-3 text-left">Rating</th>
              <th className="px-4 py-3 text-left w-1/3">Review Text</th>
              <th className="px-4 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {reviews.map(review => (
              <tr key={review._id} className="hover:bg-gray-750">
                <td className="px-4 py-3">{review.movie?.title || 'Unknown'}</td>
                <td className="px-4 py-3">{review.user?.username || 'Unknown'}</td>
                <td className="px-4 py-3">{review.rating} / 5</td>
                <td className="px-4 py-3 text-sm">{review.text}</td>
                <td className="px-4 py-3 text-center">
                  <button 
                    onClick={() => handleDelete(review._id)}
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
    </div>
  );
};

export default AdminReviews;
