import { useState } from "react";
import { Search, X, RefreshCw, Plus, HelpCircle, Check } from "lucide-react";
import { PRODUCT_LIBRARY, LibraryProduct } from "../types";

interface ProductLibraryProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: LibraryProduct) => void;
}

export default function ProductLibrary({ isOpen, onClose, onSelectProduct }: ProductLibraryProps) {
  const [search, setSearch] = useState("");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [addedItemIds, setAddedItemIds] = useState<Record<string, boolean>>({});

  if (!isOpen) return null;

  // Filter products by type and query
  const filteredProducts = PRODUCT_LIBRARY.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesType = selectedType === "All" || p.type === selectedType;
    return matchesSearch && matchesType;
  });

  const getBadgeStyle = (type: LibraryProduct["type"]) => {
    switch (type) {
      case "Hourly":
        return "bg-blue-100 text-blue-600";
      case "Flat":
        return "bg-green-100 text-green-600";
      case "Recurring":
        return "bg-purple-100 text-purple-600";
      default:
        return "bg-grey-100 text-grey-600";
    }
  };

  const handleSelect = (product: LibraryProduct) => {
    onSelectProduct(product);
    setAddedItemIds(prev => ({ ...prev, [product.id]: true }));
    // Reset confirmation tick after 1.5s
    setTimeout(() => {
      setAddedItemIds(prev => ({ ...prev, [product.id]: false }));
    }, 1200);
  };

  return (
    <div
      role="dialog"
      id="product-library-overlay"
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
    >
      <div id="product-library-modal-card" className="bg-white rounded-xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden border border-grey-200">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-grey-100 bg-grey-25">
          <div>
            <h2 className="text-lg font-bold text-grey-900 tracking-tight">Choose from Product Library</h2>
            <p className="text-xs text-grey-400 mt-0.5 font-secondary">Select standard services or flat-rate bundles to populate line items instantly</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-grey-400 hover:bg-grey-100 hover:text-grey-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Filters */}
        <div className="p-4 border-b border-grey-100 bg-white grid grid-cols-1 sm:grid-cols-4 gap-3">
          {/* Catalog Search */}
          <div className="relative sm:col-span-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-grey-400" />
            <input
              type="text"
              placeholder="Search product bundles, recurring setups..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full border border-grey-200 rounded-lg pl-9 pr-4 py-2 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          {/* Type Category selection */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="border border-grey-200 rounded-lg p-2 text-xs text-grey-700 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
          >
            <option value="All">All Types</option>
            <option value="Flat">Flat Rate</option>
            <option value="Hourly">Hourly Rate</option>
            <option value="Recurring">Recurring Subscription</option>
          </select>
        </div>

        {/* Product Catalog list */}
        <div className="flex-1 overflow-y-auto divide-y divide-grey-50 p-1" id="product-items-catalog">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-12 text-grey-400">
              <p className="text-sm font-semibold text-grey-900">No items found</p>
              <p className="text-xs mt-0.5">Try widening your search terms or categorical filter.</p>
            </div>
          ) : (
            filteredProducts.map((p) => {
              const isAdded = addedItemIds[p.id];
              return (
                <div
                  key={p.id}
                  id={`library-product-row-${p.id}`}
                  className="flex items-center justify-between p-4 px-5 hover:bg-grey-25 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    {/* Visual indicators for Recurring models */}
                    <div className={`p-2 rounded-lg ${p.type === "Recurring" ? "bg-brandpurple-100 text-brandpurple-500" : "bg-grey-50 text-grey-400"}`}>
                      {p.type === "Recurring" ? (
                        <RefreshCw className="w-4 h-4 animate-[spin_8s_linear_infinite]" />
                      ) : (
                        <Plus className="w-4 h-4 text-grey-400" />
                      )}
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-grey-900 leading-tight">
                        {p.name}
                      </h4>
                      <span className={`inline-block text-xs uppercase font-bold px-2 py-0.5 rounded mt-1.5 font-sans ${getBadgeStyle(p.type)}`}>
                        {p.type}
                      </span>
                    </div>
                  </div>

                  {/* Pricing and Action trigger */}
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-sm font-bold text-grey-900 font-sans block">
                        ${p.price.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-xs text-grey-400 uppercase font-bold tracking-wider font-secondary">
                        {p.type === "Hourly" ? "Per Hour" : p.type === "Recurring" ? "Per Month" : "Fixed Contract"}
                      </span>
                    </div>

                    <button
                      id={`btn-add-product-${p.id}`}
                      onClick={() => handleSelect(p)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold select-none border cursor-pointer ${
                        isAdded 
                          ? "bg-green-100 text-green-600 border-green-200"
                          : "bg-white text-grey-700 border-grey-300 hover:bg-grey-50 hover:text-grey-900"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <span>Choose</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Info Footer */}
        <div className="p-4 px-6 border-t border-grey-100 bg-grey-25 flex items-center justify-between text-xs text-grey-400">
          <span className="font-medium font-secondary flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5 text-grey-300" /> Need custom pricing? Create a line item directly in the sheet.
          </span>
          <button
            onClick={onClose}
            className="text-grey-600 hover:text-black font-semibold border border-grey-200 hover:bg-white rounded px-3 py-1 cursor-pointer"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
}
