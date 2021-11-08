import React, { useState, useEffect } from 'react';
import { MdAddShoppingCart } from 'react-icons/md';

import { ProductList } from './styles';
import { api } from '../../services/api';
import { formatPrice } from '../../util/format';
import { useCart } from '../../hooks/useCart';
import { AxiosResponse } from 'axios';

interface Product {
  id: number;
  title: string;
  price: number;
  image: string;
}

interface ProductFormatted extends Product {
  priceFormatted: string;
}

interface CartItemsAmount {
  [key: number]: number;
}

const Home = (): JSX.Element => {
  const [products, setProducts] = useState([]);
  const { addProduct, cart, removeProduct } = useCart();

  // const cartItemsAmount = cart.reduce((sumAmount, product) => {
  //   // TODO
  // }, {} as CartItemsAmount)

  // useEffect(() => {
  //   console.log(cart)
  // },[cart])


  useEffect(() => {
    async function loadProducts() {
      await api.get<ProductFormatted>('products')
        .then((response: AxiosResponse) => setProducts(response.data))
    }
    loadProducts();
  }, []);




  function handleAddProduct(id: number) {
    //addProduct(id)
    removeProduct(id) 
   }

  return (
    <ProductList>
      {products.map((product: ProductFormatted) => {
        return (
          <li key={product.id}>
            <img src={product.image} alt={product.title} />
            <strong>{product.title}</strong>
            <span>{product.price}</span>
            <button
              type="button"
              data-testid="add-product-button"
              onClick={() => handleAddProduct(product.id)}
            >
              <div data-testid="cart-product-quantity">
                <MdAddShoppingCart size={16} color="#FFF" />
                {/* {cartItemsAmount[product.id] || 0} */} 2
              </div>

              <span>ADICIONAR AO CARRINHO</span>
            </button>
          </li>
        )
      })
      }

    </ProductList >
  );
};

export default Home;
