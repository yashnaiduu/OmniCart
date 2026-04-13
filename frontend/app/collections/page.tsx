'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, Collection } from '@/lib/api';

export default function CollectionsPage() {
  const queryClient = useQueryClient();
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState('');
  const [addingItemTo, setAddingItemTo] = useState<string | null>(null);
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState('');

  const { data: collections, isLoading } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const res = await collectionsApi.getAll();
      return res.data.data as Collection[];
    },
  });

  const createMutation = useMutation({
    mutationFn: (name: string) => collectionsApi.create(name),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setNewName('');
      setShowCreate(false);
    },
  });

  const addItemMutation = useMutation({
    mutationFn: ({ collectionId, name, quantity }: { collectionId: string; name: string; quantity?: string }) =>
      collectionsApi.addItem(collectionId, name, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collections'] });
      setNewItemName('');
      setNewItemQty('');
      setAddingItemTo(null);
    },
  });

  const deleteCollectionMutation = useMutation({
    mutationFn: (id: string) => collectionsApi.deleteCollection(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  });

  const removeItemMutation = useMutation({
    mutationFn: ({ collectionId, itemId }: { collectionId: string; itemId: string }) =>
      collectionsApi.removeItem(collectionId, itemId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['collections'] }),
  });

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/40 via-white to-white">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">📋 My Lists</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 transition-colors"
          >
            + New List
          </motion.button>
        </div>

        {/* Create form */}
        <AnimatePresence>
          {showCreate && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mb-6"
            >
              <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="List name (e.g. Monthly Groceries)"
                  className="w-full px-4 py-3 bg-gray-50 rounded-xl border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
                    disabled={!newName.trim() || createMutation.isPending}
                    className="px-4 py-2 bg-blue-500 text-white rounded-xl text-sm font-medium hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-gray-100 text-gray-600 rounded-xl text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Collections list */}
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                <div className="skeleton h-5 w-40 mb-3" />
                <div className="skeleton h-3 w-24" />
              </div>
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-4"
          >
            {collections.map((col) => (
              <motion.div
                key={col.id}
                layout
                className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-gray-900">{col.name}</h3>
                    <p className="text-xs text-gray-400">
                      {col.items?.length || 0} items
                      {col.frequency && ` · ${col.frequency}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddingItemTo(addingItemTo === col.id ? null : col.id)}
                      className="text-xs text-blue-600 hover:text-blue-700 px-2 py-1 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={() => deleteCollectionMutation.mutate(col.id)}
                      className="text-xs text-red-500 hover:text-red-600 px-2 py-1 rounded-lg hover:bg-red-50 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/* Add item form */}
                <AnimatePresence>
                  {addingItemTo === col.id && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mb-3"
                    >
                      <div className="flex gap-2">
                        <input
                          type="text"
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          placeholder="Item name"
                          className="flex-1 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <input
                          type="text"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(e.target.value)}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                          onClick={() =>
                            newItemName.trim() &&
                            addItemMutation.mutate({
                              collectionId: col.id,
                              name: newItemName.trim(),
                              quantity: newItemQty.trim() || undefined,
                            })
                          }
                          disabled={!newItemName.trim()}
                          className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium disabled:opacity-50"
                        >
                          Add
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Items */}
                {col.items && col.items.length > 0 && (
                  <div className="space-y-1.5">
                    {col.items.map((item) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-gray-50 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-700 capitalize">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-xs text-gray-400">
                              ({item.quantity})
                            </span>
                          )}
                        </div>
                        <button
                          onClick={() =>
                            removeItemMutation.mutate({
                              collectionId: col.id,
                              itemId: item.id,
                            })
                          }
                          className="text-xs text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <p className="text-5xl mb-4">📋</p>
            <p className="text-gray-500 text-lg">No lists yet</p>
            <p className="text-gray-400 text-sm mt-2">
              Create your first grocery list to get started
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
