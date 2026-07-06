import React from "react";
import { Link } from "react-router-dom";

export interface Product {
  id: number;
  name: string;
  description: string;
  price: number | string;
  image: string | null;
}

interface ProductCardProps {
  product: Product;
}

function ProductCard({ product }: ProductCardProps): React.JSX.Element {
  // Netlify runtime environment variable use hobe ekhon hardcoded IP-r bodole
  const baseUrl = import.meta.env.VITE_DJANGO_BASE_URL || "";

  return (
    <Link to={`/product/${product.id}`} className="block h-full">
      <div className="bg-white rounded-xl shadow-sm p-3 hover:shadow-md transition h-full flex flex-col justify-between cursor-pointer border border-gray-100">
        <div>
          {product.image ? (
            <img
              src={
                product.image.startsWith("http")
                  ? product.image
                  : `${baseUrl}${product.image}`
              }
              alt={product.name}
              className="w-full h-36 object-cover rounded-lg mb-2"
              onError={(e) => {
                e.currentTarget.src =
                  "https://placehold.co/400x300?text=No+Image";
              }}
            />
          ) : (
            <div className="w-full h-36 flex items-center justify-center bg-gray-200 rounded-lg mb-2 text-gray-400 text-xs font-medium">
              No Image
            </div>
          )}

          <h2 className="text-base font-semibold text-gray-800 truncate">
            {product.name}
          </h2>

          <p className="text-sm text-gray-500 line-clamp-2 min-h-10">
            {product.description}
          </p>
        </div>

        <p className="font-bold text-blue-600 mt-2 text-lg">₹{product.price}</p>
      </div>
    </Link>
  );
}

export default ProductCard;