import React, { useState } from 'react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Send,
  ShoppingBag,
  Store,
  Truck,
  CreditCard,
  Building2,
  Banknote,
  AlertCircle,
} from 'lucide-react';
import type { GroupedProduct, ProductVariant } from '../types';
import { WHATSAPP_NUMBER } from '../config';
import { formatCLP } from '../utils/formatters';

export interface CartItem {
  product: GroupedProduct;
  variant: ProductVariant;
  quantity: number;
}

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (variantId: string, delta: number) => void;
  onRemoveItem: (variantId: string) => void;
  onClearCart: () => void;
}

type DeliveryMethod = 'retiro' | 'envio';
type PaymentMethod =
  | 'Transferencia electrónica'
  | 'Link de pago (Mercado Pago / Webpay)'
  | 'Efectivo al retirar';

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}) => {
  const [clientName, setClientName] = useState('');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('retiro');
  const [shippingAddress, setShippingAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    'Transferencia electrónica'
  );

  const [errors, setErrors] = useState<{
    clientName?: string;
    shippingAddress?: string;
  }>({});

  if (!isOpen) return null;

  const total = items.reduce(
    (sum, item) => sum + item.variant.precio * item.quantity,
    0
  );

  const validateForm = (): boolean => {
    const newErrors: { clientName?: string; shippingAddress?: string } = {};

    if (!clientName.trim()) {
      newErrors.clientName = 'Por favor ingresá tu nombre.';
    }

    if (deliveryMethod === 'envio' && !shippingAddress.trim()) {
      newErrors.shippingAddress = 'Por favor ingresá tu comuna y dirección de entrega.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSendWhatsAppOrder = () => {
    if (items.length === 0) return;

    if (!validateForm()) {
      return;
    }

    const entregaText =
      deliveryMethod === 'retiro'
        ? 'Retiro en el local'
        : `Envío a domicilio: ${shippingAddress.trim()}`;

    const detalleItems = items
      .map((item) => {
        const subtotal = item.variant.precio * item.quantity;
        return `- ${item.quantity}x ${item.product.nombre} | Color: ${item.variant.color
          } [ID: ${item.variant.id}] - ${formatCLP(subtotal)}`;
      })
      .join('\n');

    const message = `Hola! Te paso mi pedido desde la web:

*Cliente:* ${clientName.trim()}
*Entrega:* ${entregaText}
*Pago:* ${paymentMethod}

*Detalle del pedido:*
${detalleItems}

*Total estimado:* ${formatCLP(total)}

¿Como avanzamos con el pago?`;

    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encoded}`, '_blank');
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden animate-in fade-in duration-200">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#2D2721]/45 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-4 sm:pl-8">
        <div className="w-screen max-w-sm bg-[#FAF8F5] border-l border-[#E8E2D9] shadow-2xl flex flex-col justify-between">
          {/* Header del carrito */}
          <div className="p-3.5 sm:p-4 border-b border-[#E8E2D9] bg-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#FAF0EC] flex items-center justify-center text-[#B86B52]">
                <ShoppingBag className="w-3.5 h-3.5" />
              </div>
              <div>
                <h2 className="font-display text-base sm:text-lg font-semibold text-[#2D2721]">
                  Tu Carrito
                </h2>
                <span className="text-[10px] text-[#786F66]">
                  {items.length === 0
                    ? '0 productos'
                    : `${items.length} ${items.length === 1 ? 'ítem' : 'ítems'
                    }`}
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full text-[#786F66] hover:text-[#2D2721] hover:bg-[#FAF8F5] transition-colors"
              aria-label="Cerrar carrito"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Cuerpo scrolleable */}
          <div className="flex-1 overflow-y-auto p-3.5 sm:p-4 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-12">
                <div className="w-14 h-14 rounded-full bg-white border border-[#E8E2D9] flex items-center justify-center text-[#A0968A] mb-2.5 shadow-2xs">
                  <ShoppingBag className="w-6 h-6 stroke-1 text-[#B86B52]" />
                </div>
                <p className="font-display text-base text-[#2D2721]">
                  Tu carrito está vacío
                </p>
                <p className="text-[11px] text-[#786F66] mt-1 max-w-[200px]">
                  Explorá nuestro catálogo de hilados y agregá tus preferidos.
                </p>
              </div>
            ) : (
              <>
                {/* Lista de productos */}
                <div className="space-y-2.5">
                  {items.map((item) => {
                    const itemImage =
                      item.variant.imagen_url ||
                      item.product.variants.find((v) => Boolean(v.imagen_url))
                        ?.imagen_url;

                    const isMaxStockReached =
                      item.quantity >= item.variant.stock;

                    return (
                      <div
                        key={item.variant.id}
                        className="bg-white p-2.5 rounded-xl border border-[#E8E2D9] flex gap-2.5 shadow-2xs hover:border-[#B86B52]/30 transition-all"
                      >
                        <div className="w-14 h-14 rounded-lg bg-[#FAF6F0] overflow-hidden flex-shrink-0 flex items-center justify-center border border-[#E8E2D9]/60 relative">
                          {itemImage ? (
                            <img
                              src={itemImage}
                              alt={`${item.product.nombre} - ${item.variant.color}`}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-base">🧶</span>
                          )}
                          <span
                            className="absolute bottom-1 right-1 w-3 h-3 rounded-full border border-white shadow-2xs"
                            style={{ backgroundColor: item.variant.color_hex }}
                            title={item.variant.color}
                          />
                        </div>

                        <div className="flex-1 min-w-0 flex flex-col justify-between">
                          <div>
                            <h4 className="text-xs font-semibold text-[#2D2721] truncate">
                              {item.product.nombre}
                            </h4>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className="text-[10px] text-[#786F66]">
                                Color: <strong className="text-[#2D2721]">{item.variant.color}</strong>
                              </span>
                              <span className="text-[9px] font-mono text-[#A0968A] bg-[#F5EFE6] px-1 rounded">
                                {item.variant.id}
                              </span>
                            </div>
                            <p className="text-[11px] text-[#B86B52] font-semibold mt-0.5">
                              {formatCLP(item.variant.precio)}
                            </p>
                          </div>

                          <div className="flex items-center justify-between pt-1">
                            <div className="flex items-center border border-[#E8E2D9] rounded-md overflow-hidden bg-[#FAF8F5]">
                              <button
                                type="button"
                                onClick={() =>
                                  onUpdateQuantity(item.variant.id, -1)
                                }
                                className="px-1.5 py-0.5 text-[#786F66] hover:bg-white"
                                aria-label="Restar una unidad"
                              >
                                <Minus className="w-2.5 h-2.5" />
                              </button>
                              <span className="px-1.5 text-[11px] font-semibold text-[#2D2721] min-w-4 text-center">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                disabled={isMaxStockReached}
                                onClick={() =>
                                  onUpdateQuantity(item.variant.id, 1)
                                }
                                className={`px-1.5 py-0.5 text-[#786F66] hover:bg-white ${isMaxStockReached
                                  ? 'opacity-30 cursor-not-allowed'
                                  : ''
                                  }`}
                                title={
                                  isMaxStockReached
                                    ? `Máximo: ${item.variant.stock}`
                                    : ''
                                }
                                aria-label="Sumar una unidad"
                              >
                                <Plus className="w-2.5 h-2.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemoveItem(item.variant.id)}
                              className="p-1 text-[#A0968A] hover:text-[#B86B52] transition-colors rounded"
                              title="Eliminar del pedido"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Subtotal */}
                <div className="bg-white p-2.5 rounded-xl border border-[#E8E2D9] flex items-center justify-between shadow-2xs">
                  <span className="text-xs font-medium text-[#786F66]">
                    Subtotal estimado
                  </span>
                  <span className="font-display text-lg font-bold text-[#2D2721]">
                    {formatCLP(total)}
                  </span>
                </div>

                {/* Formulario de Cierre */}
                <div className="bg-white p-3 rounded-xl border border-[#E8E2D9] space-y-3 shadow-2xs">
                  <h3 className="font-display font-semibold text-xs text-[#2D2721] border-b border-[#F0EAE1] pb-1.5">
                    Datos para tu pedido
                  </h3>

                  {/* Nombre */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#2D2721] mb-1">
                      Tu nombre <span className="text-[#C53030]">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Carolina Morales"
                      value={clientName}
                      onChange={(e) => {
                        setClientName(e.target.value);
                        if (errors.clientName) {
                          setErrors((prev) => ({ ...prev, clientName: undefined }));
                        }
                      }}
                      className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-[#FAF8F5] text-[#2D2721] placeholder-[#A0968A] focus:outline-none focus:ring-1 transition-all ${errors.clientName
                        ? 'border-[#C53030] focus:ring-[#C53030]/20'
                        : 'border-[#E8E2D9] focus:border-[#B86B52] focus:ring-[#B86B52]/20'
                        }`}
                    />
                    {errors.clientName && (
                      <p className="text-[10px] text-[#C53030] mt-1 flex items-center gap-1">
                        <AlertCircle className="w-2.5 h-2.5" />
                        <span>{errors.clientName}</span>
                      </p>
                    )}
                  </div>

                  {/* Forma de Entrega */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#2D2721] mb-1">
                      Forma de entrega <span className="text-[#C53030]">*</span>
                    </label>
                    <div className="grid grid-cols-1 gap-1.5">
                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'retiro'
                          ? 'border-[#B86B52] bg-[#FAF0EC]/60 text-[#2D2721]'
                          : 'border-[#E8E2D9] bg-[#FAF8F5] text-[#786F66]'
                          }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="retiro"
                          checked={deliveryMethod === 'retiro'}
                          onChange={() => {
                            setDeliveryMethod('retiro');
                            setErrors((prev) => ({
                              ...prev,
                              shippingAddress: undefined,
                            }));
                          }}
                          className="w-3 h-3 text-[#B86B52] focus:ring-[#B86B52]"
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <Store className="w-3 h-3 text-[#B86B52]" />
                          <span>Retiro en el local</span>
                        </div>
                      </label>

                      <label
                        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${deliveryMethod === 'envio'
                          ? 'border-[#B86B52] bg-[#FAF0EC]/60 text-[#2D2721]'
                          : 'border-[#E8E2D9] bg-[#FAF8F5] text-[#786F66]'
                          }`}
                      >
                        <input
                          type="radio"
                          name="deliveryMethod"
                          value="envio"
                          checked={deliveryMethod === 'envio'}
                          onChange={() => setDeliveryMethod('envio')}
                          className="w-3 h-3 text-[#B86B52] focus:ring-[#B86B52]"
                        />
                        <div className="flex items-center gap-1.5 text-xs">
                          <Truck className="w-3 h-3 text-[#B86B52]" />
                          <span>Envío a domicilio</span>
                        </div>
                      </label>
                    </div>

                    {deliveryMethod === 'envio' && (
                      <div className="mt-2 animate-in fade-in duration-200">
                        <label className="block text-[10px] font-medium text-[#2D2721] mb-1">
                          Comuna y dirección <span className="text-[#C53030]">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Ej. Talca, Calle 1 Sur #1234"
                          value={shippingAddress}
                          onChange={(e) => {
                            setShippingAddress(e.target.value);
                            if (errors.shippingAddress) {
                              setErrors((prev) => ({
                                ...prev,
                                shippingAddress: undefined,
                              }));
                            }
                          }}
                          className={`w-full px-2.5 py-1.5 text-xs rounded-lg border bg-[#FAF8F5] text-[#2D2721] placeholder-[#A0968A] focus:outline-none focus:ring-1 transition-all ${errors.shippingAddress
                            ? 'border-[#C53030] focus:ring-[#C53030]/20'
                            : 'border-[#E8E2D9] focus:border-[#B86B52] focus:ring-[#B86B52]/20'
                            }`}
                        />
                        {errors.shippingAddress && (
                          <p className="text-[10px] text-[#C53030] mt-1 flex items-center gap-1">
                            <AlertCircle className="w-2.5 h-2.5" />
                            <span>{errors.shippingAddress}</span>
                          </p>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Medios de Pago */}
                  <div>
                    <label className="block text-[11px] font-medium text-[#2D2721] mb-1">
                      Medio de pago
                    </label>
                    <div className="space-y-1">
                      {[
                        {
                          id: 'Transferencia electrónica',
                          label: 'Transferencia electrónica',
                          icon: Building2,
                        },
                        {
                          id: 'Link de pago (Mercado Pago / Webpay)',
                          label: 'Link de pago (Mercado Pago / Webpay)',
                          icon: CreditCard,
                        },
                        {
                          id: 'Efectivo al retirar',
                          label: 'Efectivo al retirar',
                          icon: Banknote,
                        },
                      ].map((item) => {
                        const Icon = item.icon;
                        const isSelected = paymentMethod === item.id;
                        return (
                          <label
                            key={item.id}
                            className={`flex items-center gap-2 p-1.5 rounded-lg border cursor-pointer transition-all ${isSelected
                              ? 'border-[#B86B52] bg-[#FAF0EC]/60 text-[#2D2721]'
                              : 'border-[#E8E2D9] bg-[#FAF8F5] text-[#786F66]'
                              }`}
                          >
                            <input
                              type="radio"
                              name="paymentMethod"
                              value={item.id}
                              checked={isSelected}
                              onChange={() =>
                                setPaymentMethod(item.id as PaymentMethod)
                              }
                              className="w-3 h-3 text-[#B86B52] focus:ring-[#B86B52]"
                            />
                            <Icon className="w-3 h-3 text-[#B86B52]" />
                            <span className="text-xs">
                              {item.label}
                            </span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Footer del Carrito */}
          {items.length > 0 && (
            <div className="p-3.5 sm:p-4 border-t border-[#E8E2D9] bg-white space-y-2">
              <button
                type="button"
                onClick={handleSendWhatsAppOrder}
                className="w-full py-2.5 px-3.5 rounded-xl bg-[#25D366] hover:bg-[#20BE5B] active:scale-[0.99] text-white font-semibold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-2xs transition-all"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar pedido por WhatsApp</span>
              </button>

              <div className="flex items-center justify-between pt-0.5">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-[11px] text-[#A0968A] hover:text-[#C53030] font-medium flex items-center gap-1 transition-colors py-0.5"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Vaciar carrito</span>
                </button>

                <span className="text-[9px] text-[#A0968A] italic">
                  * Stock confirmado al momento del pago
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
