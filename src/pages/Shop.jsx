import React, { useState, useEffect } from 'react';
import { Clock } from 'lucide-react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// Компонент карточки
function Card({ children, className }) {
  return (
    <div className={`w-full overflow-hidden rounded-lg border bg-white shadow-md hover:shadow-lg transition-shadow ${className}`}>
      {children}
    </div>
  );
}

// Компонент skeleton-загрузки
function SkeletonCard() {
  return (
    <div className="w-full overflow-hidden rounded-lg border bg-gray-100 shadow-md animate-pulse">
      <div className="h-40 sm:h-48 bg-gray-200"></div>
      <div className="p-4 space-y-3">
        <div className="h-5 bg-gray-300 rounded"></div>
        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
        <div className="h-10 bg-gray-300 rounded mt-4"></div>
      </div>
    </div>
  );
}

export default function Shop() {
  const [userData, setUserData] = useState(null);
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const loggedInUser = JSON.parse(localStorage.getItem('loggedInUser'));

  // Check if the user is a guest
  const isGuestUser = loggedInUser && loggedInUser.email === "guest@example.com";

  useEffect(() => {
    if (loggedInUser && !isGuestUser) {
      fetch(`https://unversty-2.onrender.com/users/${loggedInUser._id}`)
        .then(res => res.json())
        .then(data => setUserData(data))
        .catch(error => console.error("Error fetching user data:", error));
    }
  }, [loggedInUser, isGuestUser]);

  // Загрузка данных продуктов
  useEffect(() => {
    setIsLoading(true);
    fetch('https://unversty-2.onrender.com/products')
      .then(res => res.json())
      .then(data => {
        setProducts(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Error fetching product data:", error);
        setIsLoading(false);
      });
  }, []);

  const openConfirmationModal = (product) => {
    setSelectedProduct(product);
    setIsModalOpen(true);
  };

  const closeConfirmationModal = () => {
    setIsModalOpen(false);
    setSelectedProduct(null);
  };

  const handlePurchase = async () => {
    if (userData && userData.tokens[0].quantity >= selectedProduct.cost && selectedProduct.quantity > 0) {
      try {
        // Обновление количества продукта
        const updatedProduct = await axios.put(`https://unversty-2.onrender.com/products/${selectedProduct._id}`, {
          quantity: selectedProduct.quantity - 1,
        });

        // Обновление количества монет пользователя
        const updatedUser = await axios.put(`https://unversty-2.onrender.com/users/${userData._id}`, {
          tokens: [
            {
              quantity: userData.tokens[0].quantity - selectedProduct.cost,
            },
          ],
        });

        // Запись о покупке
        await axios.post('https://unversty-2.onrender.com/purchases', {
          userId: userData._id,
          userName: userData.name,
          productId: selectedProduct._id,
          productName: selectedProduct.name,
          cost: selectedProduct.cost,
          status: 'ожидает выдачи',
          productImg: selectedProduct.img,
        });

        setUserData(updatedUser.data);
        setProducts((prevProducts) =>
          prevProducts.map((p) =>
            p._id === selectedProduct._id ? updatedProduct.data : p
          )
        );

        closeConfirmationModal();
        alert(`Вы успешно купили ${selectedProduct.name} за ${selectedProduct.cost} монет.`);
      } catch (error) {
        console.error("Error updating purchase data:", error);
        alert("Произошла ошибка при обработке покупки. Пожалуйста, попробуйте еще раз.");
      }
    } else {
      alert("Недостаточно монет или товар закончился.");
    }
  };

  return (
    <div className="min-h-screen pb-24 md:pb-6">
      <div className="sticky top-0 bg-white z-10 shadow-md">
        <div className="container mx-auto flex h-16 md:h-20 items-center justify-between px-4 sm:px-6">
          <div className="text-base md:text-lg lg:text-xl ml-[50px] font-bold text-[#4A66D3]">Shop</div>
          <div className="flex items-center gap-7 md:gap-4 lg:gap-6">
            <Link to="/history" className="hidden md:flex items-center text-[#4A66D3] hover:text-[#3a51a6] transition-colors">
              <Clock className="mr-2 h-4 w-4 md:h-5 md:w-5" />
              <span className="text-sm md:text-base">Xaridlar tarixi</span>
            </Link>
            <div className="text-[#4A66D3] font-semibold text-sm md:text-base">
              Монеты: {isGuestUser ? 0 : userData ? userData.tokens[0].quantity : 0}
            </div>
            <Link to='/history' className="md:hidden text-[#4A66D3]">
              <Clock className='w-5 h-5' />
            </Link>
          </div>
        </div>
      </div>
      <div className="container mx-auto px-4 sm:px-6 py-4 md:py-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {isLoading
            ? Array.from({ length: 8 }, (_, i) => <SkeletonCard key={i} />)
            : products.map((product) => (
              <Card key={product._id || product.id} className="flex flex-col ">
                <div className="relative flex-grow">
                  <img
                    src={product.img}
                    alt={product.name}
                    className="h-40 sm:h-48 w-full object-contain p-2"
                  />
                </div>
                <div className="p-4 flex flex-col justify-between flex-grow">
                  <div>
                    <h3 className="text-base md:text-lg font-semibold">{product.name}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="flex items-center text-base md:text-lg font-bold text-[#1e3a8a]">
                        {product.cost} Монет
                      </span>
                      <span className="text-xs md:text-sm text-gray-600">
                        {product.quantity} dona mavjud
                      </span>
                    </div>
                  </div>
                  <button
                    className="w-full bg-[#4A66D3] pointer text-white py-2 px-4 rounded text-sm md:text-base hover:bg-[#3a51a6] transition-colors mt-4"
                    onClick={() => openConfirmationModal(product)}
                    disabled={
                      !userData || // Ensure that the userData is loaded
                      userData.tokens[0].quantity < product.cost || // User doesn't have enough tokens
                      product.quantity === 0 || // Product is out of stock
                      isGuestUser // If the logged-in user is a guest
                    }
                  >
                    {
                      !userData || userData.tokens[0].quantity < product.cost || product.quantity === 0
                        ? 'Недостаточно средств'
                        : 'Купить'
                    }
                  </button>
                </div>
              </Card>
            ))}
        </div>
      </div>

      {isModalOpen && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-[90%]">
            <h2 className="text-xl font-bold mb-4">Подтверждение покупки</h2>
            <p className="mb-4">Вы действительно хотите купить этот продукт?</p>
            <div className="mb-4">
              <img
                src={selectedProduct.img}
                alt={selectedProduct.name}
                className="h-40 sm:h-48 w-full object-contain p-2"
              />
              <div className="mt-2 flex justify-between">
                <span className="font-semibold text-lg">{selectedProduct.name}</span>
                <span className="font-bold text-lg">{selectedProduct.cost} монет</span>
              </div>
            </div>
            <div className="flex justify-between mt-4">
              <button
                onClick={handlePurchase}
                className="px-6 py-2 bg-green-500 text-white rounded-md"
              >
                Подтвердить
              </button>
              <button
                onClick={closeConfirmationModal}
                className="px-6 py-2 bg-red-500 text-white rounded-md"
              >
                Отменить
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
