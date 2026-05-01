"use client";

import { useState } from "react";
import Navbar from "../Components/Navbar";
import { Search as SearchIcon } from "lucide-react";

export default function Search() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);

  async function handleSearch(e: React.ChangeEvent<HTMLInputElement>) {
    const query = e.target.value;
    setSearchQuery(query);

    if (query.length < 2) {
      setResults([]);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      // You'll need to create a search endpoint in the backend
      // For now, this is a placeholder
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/search/?q=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      setResults(data);
    } catch (error) {
      console.error("Search error:", error);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      <div className="md:ml-64 pb-20 md:pb-0">
        <div className="max-w-2xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold mb-6">Search Users</h1>

          {/* Search Input */}
          <div className="relative mb-6">
            <SearchIcon className="absolute left-3 top-3 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search for users..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Search Results */}
          <div className="space-y-4">
            {results.length === 0 && searchQuery ? (
              <p className="text-gray-600">No users found</p>
            ) : (
              results.map((user: any) => (
                <div
                  key={user.id}
                  className="bg-white p-4 rounded-lg shadow-md flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {user.avatar_url && (
                      <img
                        src={user.avatar_url}
                        alt={user.first_name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-semibold">{user.first_name || user.email}</p>
                      <p className="text-sm text-gray-600">@{user.email.split("@")[0]}</p>
                    </div>
                  </div>
                  <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    Follow
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}