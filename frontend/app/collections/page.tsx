'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Navbar } from '@/components/Navbar';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { collectionsApi, Collection } from '@/lib/api';
import { SPRING, staggerContainer, staggerItem } from '@/lib/motion';

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
    <div className="min-h-screen bg-[#0A0B0D] text-[#EEF2F6]">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8 pb-24 sm:pb-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold text-white font-heading">My Lists</h1>
          <motion.button
            whileTap={{ scale: 0.95 }}
            transition={SPRING.snappy}
            onClick={() => setShowCreate(!showCreate)}
            className="px-4 py-2 bg-violet-600 text-white rounded-luxon-sm text-sm font-medium hover:bg-violet-500 transition-colors font-heading shadow-lg shadow-violet-500/20"
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
              <div className="luxon-glass rounded-luxon-lg p-5">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="List name (e.g. Monthly Groceries)"
                  className="w-full px-4 py-3 luxon-input rounded-luxon-sm text-sm"
                />
                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => newName.trim() && createMutation.mutate(newName.trim())}
                    disabled={!newName.trim() || createMutation.isPending}
                    className="px-4 py-2 bg-violet-600 text-white rounded-luxon-sm text-sm font-medium hover:bg-violet-500 disabled:opacity-50 transition-colors font-heading"
                  >
                    {createMutation.isPending ? 'Creating...' : 'Create'}
                  </button>
                  <button
                    onClick={() => setShowCreate(false)}
                    className="px-4 py-2 bg-white/5 text-gray-400 rounded-luxon-sm text-sm font-medium hover:bg-white/10 transition-colors"
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
              <div key={i} className="luxon-glass rounded-luxon-lg p-5">
                <div className="skeleton-dark h-5 w-40 mb-3 rounded-luxon-sm" />
                <div className="skeleton-dark h-3 w-24 rounded-luxon-sm" />
              </div>
            ))}
          </div>
        ) : collections && collections.length > 0 ? (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="space-y-4"
          >
            {collections.map((col) => (
              <motion.div
                key={col.id}
                variants={staggerItem}
                layout
                className="luxon-glass rounded-luxon-lg p-5"
              >
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-white font-heading">{col.name}</h3>
                    <p className="text-xs text-gray-500">
                      {col.items?.length || 0} items
                      {col.frequency && ` · ${col.frequency}`}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setAddingItemTo(addingItemTo === col.id ? null : col.id)}
                      className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1 rounded-luxon-sm hover:bg-violet-500/10 transition-colors font-heading"
                    >
                      + Add Item
                    </button>
                    <button
                      onClick={() => deleteCollectionMutation.mutate(col.id)}
                      className="text-xs text-red-400 hover:text-red-300 px-2 py-1 rounded-luxon-sm hover:bg-red-500/10 transition-colors"
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
                          className="flex-1 px-3 py-2 luxon-input rounded-luxon-sm text-sm"
                        />
                        <input
                          type="text"
                          value={newItemQty}
                          onChange={(e) => setNewItemQty(e.target.value)}
                          placeholder="Qty"
                          className="w-20 px-3 py-2 luxon-input rounded-luxon-sm text-sm"
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
                          className="px-3 py-2 bg-violet-600 text-white rounded-luxon-sm text-sm font-medium disabled:opacity-50 font-heading"
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
                        className="flex items-center justify-between px-3 py-2 rounded-luxon-sm hover:bg-white/5 transition-colors group"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-300 capitalize">
                            {item.name}
                          </span>
                          {item.quantity && (
                            <span className="text-xs text-gray-600">
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
            <p className="text-gray-500 text-lg font-heading">No lists yet</p>
            <p className="text-gray-600 text-sm mt-2">
              Create your first grocery list to get started
            </p>
          </motion.div>
        )}
      </main>
    </div>
  );
}
