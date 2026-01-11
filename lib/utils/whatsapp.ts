import type { CartItem, Business } from '@/lib/types/user'

/**
 * Format cart items into a WhatsApp message
 */
export function formatWhatsAppMessage(
  businessName: string,
  items: CartItem[],
  totalAmount: number,
  customerPhone?: string
): string {
  let message = `🛒 *New Order from ${businessName}*\n\n`

  message += `*Items:*\n`
  items.forEach((item) => {
    const productName = item.product.name.en || item.product.name.ta || 'Product'
    const subtotal = item.product.price * item.quantity
    message += `• ${productName} x ${item.quantity} = ₹${subtotal}\n`
  })

  message += `\n*Total: ₹${totalAmount}*\n`

  if (customerPhone) {
    message += `\nCustomer: ${customerPhone}\n`
  }

  return message
}

/**
 * Generate WhatsApp share URL
 */
export function generateWhatsAppURL(
  phoneNumber: string,
  message: string
): string {
  const cleanPhone = phoneNumber.replace(/[^0-9]/g, '')
  const encodedMessage = encodeURIComponent(message)
  return `https://wa.me/${cleanPhone}?text=${encodedMessage}`
}

/**
 * Open WhatsApp with pre-filled message
 */
export function openWhatsApp(
  phoneNumber: string,
  message: string
): void {
  const url = generateWhatsAppURL(phoneNumber, message)
  window.open(url, '_blank')
}
