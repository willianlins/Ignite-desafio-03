import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {
  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {

      const { data: stockData } = await api.get<Stock>(`/stock/${productId}`)
      const { data } = await api.get(`/products/${productId}`)


      const dataCart = {
        amount: 1,
        ...data
      }


      const cartLocalStorage: Product[] = JSON.parse(String(localStorage.getItem('@RocketShoes:cart')));
      let exist;


      if (!(cartLocalStorage === null)) {
        cartLocalStorage.forEach((item) => {
          if (productId === item.id) {
            if (item.amount >= stockData.amount) {
              toast.error('Quantidade solicitada fora de estoque');
            } else {
              item.amount++
            }
          }
        })

        exist = cartLocalStorage.find((item) => {
          if (productId === item.id)
            return true

          return false
        })
      }
      console.log('aqui')

      if (exist === undefined) {
        if (cartLocalStorage === null) {
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify([
              dataCart
            ])
          )
        } else {
          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify([
              ...cartLocalStorage,
              dataCart
            ])
          )
        }

      } else {
        localStorage.setItem(
          '@RocketShoes:cart',
          JSON.stringify([
            ...cartLocalStorage
          ])
        )

      }
      setCart(JSON.parse(String(localStorage.getItem('@RocketShoes:cart'))))
    } catch {
      toast.error('Erro na adição do produto');
    }

  };

  const removeProduct = (productId: number) => {
    try {


      const cartLocalStorage: Product[] = JSON.parse(String(localStorage.getItem('@RocketShoes:cart')));

      if (!(cartLocalStorage === null)) {
        const newCartLocalStorage = cartLocalStorage.filter(el => (el.id !== productId) && el);

        localStorage.setItem(
          '@RocketShoes:cart',
          JSON.stringify([
            ...newCartLocalStorage
          ])
        )
      }

    } catch {
      toast.error('Erro na remoção do produto');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {
      if (amount <= 0) { return }

      const cartLocalStorage: Product[] = JSON.parse(String(localStorage.getItem('@RocketShoes:cart')));

      if (!(cartLocalStorage === null)) {

        if (cartLocalStorage.length >= 1) {

          const { data: stockData } = await api.get<Stock>(`/stock/${productId}`)

          const newCartLocalStorage = cartLocalStorage.filter(el => {
            if (el.id === productId) {
              if (amount > stockData.amount) {
                toast.error('Quantidade solicitada fora de estoque');
              } else {
                el.amount = amount;
              }
            }
            return el
          });

          localStorage.setItem(
            '@RocketShoes:cart',
            JSON.stringify([
              ...newCartLocalStorage
            ])
          )
        }

      }
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
