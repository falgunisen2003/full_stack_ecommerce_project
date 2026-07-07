import React, { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useCart, type Product } from "../context/CartContext";

interface APIProduct extends Product {
  description: string;
}

const BASEURL = (import.meta.env.VITE_DJANGO_BASE_URL as string) || "";

function ProductDetails(): React.JSX.Element {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<APIProduct | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [cartStatus, setCartStatus] = useState<string | null>(null);

  const { addToCart } = useCart();

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    fetch(`${BASEURL}/api/products/${id}/`)
      .then((response) => {
        if (!response.ok) {
          throw new Error("Failed to fetch product details");
        }
        return response.json();
      })
      .then((data: APIProduct) => {
        setProduct(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  const handleAddToCart = (): void => {
    if (!product) return;

    // Login check using useNavigate instead of window.location.href
    if (!localStorage.getItem("access_token")) {
      navigate("/login");
      return;
    }

    addToCart(product);
    setCartStatus("Product added to cart! 🛒");

    setTimeout(() => {
      setCartStatus(null);
    }, 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg font-medium text-gray-600">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg font-medium text-red-600">
        Error: {error}
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 text-lg font-medium text-gray-600">
        No product found
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-8 max-w-3xl w-full">
        <div className="flex flex-col md:flex-row gap-8 items-center">
          
          {/* Image Section */}
          <div className="w-full md:w-1/2 min-h-80 flex items-center justify-center bg-gray-50 rounded-2xl overflow-hidden p-4 border border-gray-100">
            <img
              src={
                !product.image 
                  ? "https://placehold.co/600x600?text=No+Image"
                  : product.image.startsWith("http://") || product.image.startsWith("https://")
                  ? product.image
                  : `${BASEURL}${product.image}`
              }
              alt={product.name}
              className="w-full h-auto max-h-96 object-contain rounded-xl transition-transform duration-300 hover:scale-105"
              onError={(e) => {
                e.currentTarget.src = "https://placehold.co/600x600?text=Image+Not+Found";
              }}
            />
          </div>

          {/* Product Information Section */}
          <div className="w-full md:w-1/2 flex flex-col justify-between min-h-80">
            <div>
              <h1 className="text-4xl font-extrabold text-gray-900 mb-3 tracking-tight">
                {product.name}
              </h1>
              
              <p className="text-gray-600 mb-4">
                {product.description}
              </p>
              
              <p className="text-2xl font-semibold text-green-600 mb-6">
                ₹{product.price}
              </p>
            </div>

            {/* Cart Button and Status Block */}
            <div className="mt-auto flex flex-col gap-2">
              <button 
                onClick={handleAddToCart}
                className="w-full sm:w-auto bg-blue-600 text-white px-10 py-3.5 rounded-xl font-semibold hover:bg-blue-700 transition-colors duration-200 shadow-md hover:shadow-lg active:scale-[0.98]"
              >
                Add to Cart 🛒
              </button>

              {cartStatus && (
                <div className="text-sm font-semibold text-green-600 bg-green-50 p-2 rounded-lg border border-green-200 mt-2 transition-all duration-300 ease-in-out">
                  {cartStatus}
                </div>
              )}
            </div>

            {/* Home Navigation Link */}
            <div className="mt-4">
              <Link 
                to="/" 
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors gap-2"
              >
                &larr; Back to Home
              </Link>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ProductDetails;