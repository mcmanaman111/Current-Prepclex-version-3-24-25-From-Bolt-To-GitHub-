import React, { useState, useEffect } from 'react';
import { FileText, Plus, Search, Trash2, Edit2, Save, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Database } from '../types/database';

type Note = Database['public']['Tables']['notes']['Row'];

const Notes = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [editContent, setEditContent] = useState('');

  // Fetch notes on component mount
  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const { data, error } = await supabase
        .from('notes')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setNotes(data || []);
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (noteId: string) => {
    try {
      const { error } = await supabase
        .from('notes')
        .delete()
        .eq('id', noteId);

      if (error) throw error;
      setNotes(notes.filter(note => note.id !== noteId));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const handleEdit = (note: Note) => {
    setEditingNote(note);
    setEditContent(note.content);
  };

  const handleSaveEdit = async () => {
    if (!editingNote) return;

    try {
      const { error } = await supabase
        .from('notes')
        .update({ content: editContent })
        .eq('id', editingNote.id);

      if (error) throw error;

      setNotes(notes.map(note => 
        note.id === editingNote.id 
          ? { ...note, content: editContent }
          : note
      ));
      setEditingNote(null);
      setEditContent('');
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.topic.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.sub_topic.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || note.topic === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from notes
  const categories = Array.from(new Set(notes.map(note => note.topic)));

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">Study Notes</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-3">
          <div className="bg-white dark:bg-dark-lighter rounded-lg shadow-lg">
            <div className="p-6">
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search notes..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="border rounded-lg px-4 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              {loading ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  Loading notes...
                </div>
              ) : filteredNotes.length === 0 ? (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  No notes found
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.map((note) => (
                    <div key={note.id} className="border dark:border-gray-700 rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50">
                      {editingNote?.id === note.id ? (
                        <div className="space-y-4">
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            className="w-full h-32 p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-200"
                          />
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => setEditingNote(null)}
                              className="flex items-center gap-2 px-3 py-1 text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200"
                            >
                              <X className="w-4 h-4" />
                              Cancel
                            </button>
                            <button
                              onClick={handleSaveEdit}
                              className="flex items-center gap-2 px-3 py-1 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            >
                              <Save className="w-4 h-4" />
                              Save
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="text-gray-600 dark:text-gray-300 whitespace-pre-wrap">{note.content}</p>
                              <div className="flex flex-wrap gap-2 mt-4">
                                <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 rounded-full">
                                  Question ID: {note.question_id}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400 rounded-full">
                                  Test ID: {note.test_id}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 rounded-full">
                                  {note.topic}
                                </span>
                                <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400 rounded-full">
                                  {note.sub_topic}
                                </span>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(note)}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleDelete(note.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-white dark:bg-dark-lighter p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Categories</h3>
            <ul className="space-y-2">
              {categories.map((category) => {
                const count = notes.filter(note => note.topic === category).length;
                return (
                  <li key={category} className="flex justify-between items-center text-gray-600 dark:text-gray-300">
                    <span>{category}</span>
                    <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400 text-xs font-semibold px-2.5 py-0.5 rounded">
                      {count}
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="bg-white dark:bg-dark-lighter p-6 rounded-lg shadow-lg">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Tips</h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
              <li>• Use the search bar to find specific notes</li>
              <li>• Filter notes by category</li>
              <li>• Edit or delete notes as needed</li>
              <li>• Notes are automatically saved during exams</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Notes;