import { Order, GlobalConfig } from '../store/useStore';

/**
 * Genera un enlace de WhatsApp pre-formateado con los detalles del pedido,
 * estructurado limpia y profesionalmente para el dueño del negocio.
 * 
 * @param order - El objeto de la orden que contiene al cliente y los items por día.
 * @param businessPhone - El número de WhatsApp del negocio (ej. '5491122334455').
 * @param eventName - El nombre del ciclo o evento (ej. "Viandas Semana 12").
 * @returns {string} URL de wa.me lista para abrir.
 */
export function generateWhatsAppLink(order: Order, businessPhone: string, eventName: string): string {
  // 1. Mensaje de Cabecera
  let message = `¡Hola! 👋 Quisiera realizar un pedido para el menú de *${eventName}*.\n\n`;
  message += `👤 *Mis datos:*\n`;
  message += `- Nombre: ${order.customer.name}\n`;
  message += `- Teléfono: ${order.customer.phone}\n`;
  if (order.customer.notes) {
    message += `- Notas: ${order.customer.notes}\n`;
  }
  message += `\n`;

  // 2. Agrupamiento de Platos por Día
  // Creamos un diccionario para renderizar el pedido ordenadamente
  message += `🗓️ *Mi Selección por Día:*\n`;
  
  const itemsByDay = order.items.reduce((acc, item) => {
    if (!acc[item.dayName]) {
       acc[item.dayName] = [];
    }
    acc[item.dayName].push(item);
    return acc;
  }, {} as Record<string, typeof order.items>);

  for (const [day, items] of Object.entries(itemsByDay)) {
     message += `👉 *${day}*\n`;
     for (const item of items) {
       message += `   • ${item.quantity}x ${item.dishName}\n`;
     }
  }

  // 3. Totales (Footer)
  message += `\n`;
  const totalItems = order.items.reduce((sum, i) => sum + i.quantity, 0);
  message += `🛒 *Resumen:*\n`;
  message += `- Total de platos: ${totalItems}\n`;
  message += `- Monto a pagar: *$${order.totalAmount}*\n\n`;
  message += `Por favor, confírmame cómo procedemos con la seña o pago. ¡Gracias!`;

  // 4. Codificación URI para WhatsApp
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${businessPhone}?text=${encodedMessage}`;
}

/**
 * Genera un enlace de WhatsApp directo para ventas/consultas del SaaS.
 * 
 * @param messageText - El texto base que el cliente enviará.
 * @returns {string} URL de wa.me.
 */
export function generateSalesWhatsAppLink(messageText: string = "¡Hola! Vi la landing y quiero información de ViandasPro"): string {
  const salesPhone = "5492655153542";
  const encodedMessage = encodeURIComponent(messageText);
  return `https://wa.me/${salesPhone}?text=${encodedMessage}`;
}
