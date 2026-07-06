import React, { useEffect, useState } from "react";
import ProductCard, { type Product } from "../components/ProductCard";

const BASEURL = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "http://127.0.0.1:8000";

function ProductList(): React.JSX.Element {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    fetch(`${BASEURL}/api/products/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }
        return response.json();
      })
      .then((data: Product[]) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <div className="text-center pt-20 text-lg font-medium text-gray-500">Loading...</div>;
  }
  if (error) {
    return <div className="text-center pt-20 text-red-500 font-medium">{error}</div>;
  }

  return (
    <div className="h-screen bg-gray-100 overflow-hidden flex flex-col pt-6 mt-4">
      <h1 className="text-3xl font-semibold text-center py-3 text-gray-900 tracking-tight shrink-0">
        Product List
      </h1>
      {/* Internal isolated scroll view wrapper */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 custom-scrollbar">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 max-w-[1600px] mx-auto">
          {products.length > 0 ? (
            products.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center col-span-full text-gray-500 font-medium pt-10">
              No Products Available
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProductList;