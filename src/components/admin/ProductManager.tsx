import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, X, Package, Search, AlertTriangle, PackageX, Tag as TagIcon, ChevronDown } from 'lucide-react';
import { supabase, Product, Category } from '../../lib/supabase';

type FilterKey = 'all' | 'out-of-stock' | 'low-stock' | 'no-category';

const LOW_STOCK_THRESHOLD = 5;
const FALLBACK_IMG = 'https://images.pexels.com/photos/4041392/pexels-photo-4041392.jpeg?auto=compress&cs=tinysrgb&w=400';

const ProductManager = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  // Search & filters
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterKey>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Selection
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkAction, setBulkAction] = useState<string>('');
  const [bulkCategoryId, setBulkCategoryId] = useState<string>('');
  const [bulkStockValue, setBulkStockValue] = useState<string>('');
  const [bulkRunning, setBulkRunning] = useState(false);

  // Inline category creation
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [creatingCategory, setCreatingCategory] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category_id: '',
    image_url: ''
  });

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`*, category:categories(*)`)
        .order('created_at', { ascending: false });
      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase.from('categories').select('*').order('name');
      if (error) throw error;
      setCategories(data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  // Filtered list
  const filteredProducts = useMemo(() => {
    const term = search.trim().toLowerCase();
    return products.filter((p) => {
      if (term) {
        const hay = `${p.name} ${p.description || ''}`.toLowerCase();
        if (!hay.includes(term)) return false;
      }
      if (filter === 'out-of-stock' && p.stock !== 0) return false;
      if (filter === 'low-stock' && (p.stock === 0 || p.stock >= LOW_STOCK_THRESHOLD)) return false;
      if (filter === 'no-category' && p.category_id) return false;
      if (categoryFilter !== 'all' && p.category_id !== categoryFilter) return false;
      return true;
    });
  }, [products, search, filter, categoryFilter]);

  // Counters for filter chips
  const counts = useMemo(() => ({
    all: products.length,
    outOfStock: products.filter((p) => p.stock === 0).length,
    lowStock: products.filter((p) => p.stock > 0 && p.stock < LOW_STOCK_THRESHOLD).length,
    noCategory: products.filter((p) => !p.category_id).length,
  }), [products]);

  const allVisibleSelected = filteredProducts.length > 0 && filteredProducts.every((p) => selected.has(p.id));
  const someVisibleSelected = filteredProducts.some((p) => selected.has(p.id));

  const toggleSelectAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allVisibleSelected) {
        filteredProducts.forEach((p) => next.delete(p.id));
      } else {
        filteredProducts.forEach((p) => next.add(p.id));
      }
      return next;
    });
  };

  const toggleSelect = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const clearSelection = () => setSelected(new Set());

  const runBulkAction = async () => {
    if (selected.size === 0 || !bulkAction) return;
    const ids = Array.from(selected);

    if (bulkAction === 'delete') {
      if (!confirm(`¿Eliminar ${ids.length} producto(s)? Esta acción no se puede deshacer.`)) return;
      setBulkRunning(true);
      try {
        const { error } = await supabase.from('products').delete().in('id', ids);
        if (error) throw error;
        clearSelection();
        setBulkAction('');
        await fetchProducts();
      } catch (e: any) {
        alert(`Error al eliminar: ${e.message || e}`);
      } finally {
        setBulkRunning(false);
      }
      return;
    }

    if (bulkAction === 'category') {
      setBulkRunning(true);
      try {
        const { error } = await supabase
          .from('products')
          .update({ category_id: bulkCategoryId || null })
          .in('id', ids);
        if (error) throw error;
        clearSelection();
        setBulkAction('');
        setBulkCategoryId('');
        await fetchProducts();
      } catch (e: any) {
        alert(`Error al actualizar categoría: ${e.message || e}`);
      } finally {
        setBulkRunning(false);
      }
      return;
    }

    if (bulkAction === 'stock') {
      const value = parseInt(bulkStockValue, 10);
      if (isNaN(value) || value < 0) {
        alert('Ingresá un número válido para el stock');
        return;
      }
      setBulkRunning(true);
      try {
        const { error } = await supabase.from('products').update({ stock: value }).in('id', ids);
        if (error) throw error;
        clearSelection();
        setBulkAction('');
        setBulkStockValue('');
        await fetchProducts();
      } catch (e: any) {
        alert(`Error al actualizar stock: ${e.message || e}`);
      } finally {
        setBulkRunning(false);
      }
      return;
    }
  };

  const handleCreateCategory = async () => {
    if (!newCategoryName.trim()) return;
    setCreatingCategory(true);
    try {
      const { data, error } = await supabase
        .from('categories')
        .insert([{ name: newCategoryName.trim() }])
        .select()
        .single();
      if (error) throw error;
      await fetchCategories();
      if (data) setFormData((prev) => ({ ...prev, category_id: data.id }));
      setNewCategoryName('');
      setShowNewCategory(false);
    } catch (error) {
      console.error('Error creating category:', error);
      alert('Error al crear la categoría');
    } finally {
      setCreatingCategory(false);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) throw new Error('La imagen es demasiado grande (máximo 5 MB)');
    const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;
    const filePath = `products/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, { cacheControl: '3600', upsert: false, contentType: file.type });
    if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);
    const { data } = supabase.storage.from('product-images').getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploading(true);
    try {
      let imageUrl = formData.image_url;
      if (imageFile) imageUrl = await uploadImage(imageFile);
      const productData = {
        name: formData.name,
        description: formData.description,
        price: parseFloat(formData.price),
        stock: parseInt(formData.stock),
        category_id: formData.category_id || null,
        image_url: imageUrl
      };
      if (editingProduct) {
        const { error } = await supabase.from('products').update(productData).eq('id', editingProduct.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('products').insert([productData]);
        if (error) throw error;
      }
      resetForm();
      fetchProducts();
    } catch (error: any) {
      console.error('Error saving product:', error);
      alert(`Error al guardar el producto: ${error?.message || 'Error desconocido'}`);
    } finally {
      setUploading(false);
    }
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description,
      price: product.price.toString(),
      stock: product.stock.toString(),
      category_id: product.category_id || '',
      image_url: product.image_url
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) return;
    try {
      const { error } = await supabase.from('products').delete().eq('id', id);
      if (error) throw error;
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      alert('Error al eliminar el producto');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', price: '', stock: '', category_id: '', image_url: '' });
    setEditingProduct(null);
    setImageFile(null);
    setShowForm(false);
    setShowNewCategory(false);
    setNewCategoryName('');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500" />
      </div>
    );
  }

  const stockBadge = (stock: number) => {
    if (stock === 0) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300">Sin stock</span>;
    }
    if (stock < LOW_STOCK_THRESHOLD) {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">{stock} · Bajo</span>;
    }
    return <span className="text-sm text-gray-900 dark:text-white">{stock}</span>;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Productos</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {filteredProducts.length} de {products.length} productos
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="inline-flex items-center justify-center space-x-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg hover:bg-orange-600 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Nuevo producto</span>
        </button>
      </div>

      {/* Toolbar: search + filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar por nombre o descripción..."
              className="w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
            />
          </div>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
          >
            <option value="all">Todas las categorías</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap gap-2">
          {[
            { key: 'all' as FilterKey, label: 'Todos', count: counts.all, icon: Package },
            { key: 'out-of-stock' as FilterKey, label: 'Sin stock', count: counts.outOfStock, icon: PackageX },
            { key: 'low-stock' as FilterKey, label: 'Stock bajo', count: counts.lowStock, icon: AlertTriangle },
            { key: 'no-category' as FilterKey, label: 'Sin categoría', count: counts.noCategory, icon: TagIcon },
          ].map(({ key, label, count, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                filter === key
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{label}</span>
              <span className={`px-1.5 py-0.5 rounded-full ${filter === key ? 'bg-white/20' : 'bg-gray-200 dark:bg-gray-600'}`}>{count}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Bulk actions bar */}
      {selected.size > 0 && (
        <div className="sticky top-0 lg:top-4 z-20 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-xl p-3 flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-orange-900 dark:text-orange-200">
              {selected.size} seleccionado{selected.size !== 1 ? 's' : ''}
            </span>
            <button
              onClick={clearSelection}
              className="text-xs text-orange-700 dark:text-orange-300 hover:underline"
            >
              Limpiar
            </button>
          </div>
          <div className="flex flex-1 flex-col sm:flex-row gap-2 sm:items-center">
            <select
              value={bulkAction}
              onChange={(e) => setBulkAction(e.target.value)}
              className="px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
            >
              <option value="">Elegir acción...</option>
              <option value="delete">Eliminar</option>
              <option value="category">Cambiar categoría</option>
              <option value="stock">Establecer stock</option>
            </select>
            {bulkAction === 'category' && (
              <select
                value={bulkCategoryId}
                onChange={(e) => setBulkCategoryId(e.target.value)}
                className="px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white"
              >
                <option value="">Sin categoría</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            )}
            {bulkAction === 'stock' && (
              <input
                type="number"
                min="0"
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(e.target.value)}
                placeholder="Nuevo stock"
                className="px-3 py-2 border border-orange-300 dark:border-orange-700 rounded-lg bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-white w-32"
              />
            )}
            <button
              onClick={runBulkAction}
              disabled={!bulkAction || bulkRunning}
              className="px-4 py-2 bg-orange-500 text-white text-sm font-medium rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {bulkRunning ? 'Aplicando...' : 'Aplicar'}
            </button>
          </div>
        </div>
      )}

      {/* Products Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700/50">
              <tr>
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(el) => { if (el) el.indeterminate = !allVisibleSelected && someVisibleSelected; }}
                    onChange={toggleSelectAll}
                    className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Producto</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Precio</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Stock</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${
                    selected.has(product.id) ? 'bg-orange-50/50 dark:bg-orange-900/10' : ''
                  }`}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={selected.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center">
                      <img
                        className="flex-shrink-0 h-12 w-12 rounded-lg object-cover"
                        src={product.image_url || FALLBACK_IMG}
                        alt={product.name}
                        loading="lazy"
                        onError={(e) => { (e.target as HTMLImageElement).src = FALLBACK_IMG; }}
                      />
                      <div className="ml-3 min-w-0">
                        <div className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-xs">{product.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">{product.description}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    {product.category ? (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                        {product.category.name}
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-200 text-gray-700 dark:bg-gray-600 dark:text-gray-200">
                        Sin categoría
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                    ${product.price.toLocaleString()}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">{stockBadge(product.stock)}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-1">
                      <button
                        onClick={() => handleEdit(product)}
                        className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded-lg transition-colors"
                        title="Editar"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 px-4">
            <Package className="mx-auto h-12 w-12 text-gray-300 dark:text-gray-600" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">
              {products.length === 0 ? 'Todavía no hay productos' : 'No hay resultados'}
            </h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {products.length === 0 ? 'Creá tu primer producto para empezar.' : 'Probá ajustar los filtros o la búsqueda.'}
            </p>
          </div>
        )}
      </div>

      {/* Product Form - Side Drawer */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={resetForm} />
          <div className="relative ml-auto w-full max-w-lg bg-white dark:bg-gray-800 h-full shadow-2xl overflow-y-auto animate-in slide-in-from-right">
            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4 flex justify-between items-center z-10">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingProduct ? 'Editar producto' : 'Nuevo producto'}
              </h3>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"
              >
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Nombre</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Descripción</label>
                <textarea
                  rows={3}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Precio ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={formData.stock}
                    onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Categoría</label>
                <div className="flex items-center space-x-2">
                  <select
                    value={formData.category_id}
                    onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                    className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  >
                    <option value="">Sin categoría</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowNewCategory(!showNewCategory)}
                    className="flex-shrink-0 p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                    title="Crear nueva categoría"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
                {showNewCategory && (
                  <div className="mt-2 flex items-center space-x-2">
                    <input
                      type="text"
                      value={newCategoryName}
                      onChange={(e) => setNewCategoryName(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                      placeholder="Nombre de la categoría"
                      className="flex-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={handleCreateCategory}
                      disabled={creatingCategory || !newCategoryName.trim()}
                      className="px-3 py-2 bg-green-500 text-white text-sm rounded-lg hover:bg-green-600 disabled:opacity-50"
                    >
                      {creatingCategory ? '...' : 'Crear'}
                    </button>
                    <button
                      type="button"
                      onClick={() => { setShowNewCategory(false); setNewCategoryName(''); }}
                      className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Imagen</label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm"
                />
                {(formData.image_url || imageFile) && (
                  <div className="mt-2">
                    <img
                      src={imageFile ? URL.createObjectURL(imageFile) : formData.image_url}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                  </div>
                )}
              </div>

              <div className="flex space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="submit"
                  disabled={uploading}
                  className="flex-1 bg-orange-500 text-white py-2.5 px-4 rounded-lg hover:bg-orange-600 disabled:opacity-50 font-medium"
                >
                  {uploading ? 'Guardando...' : editingProduct ? 'Actualizar' : 'Crear producto'}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductManager;
