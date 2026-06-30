// Printing Module Types

export type ServiceType = 'document' | 'photocopy' | 'graphic' | 'id_card';
export type OrderStatus = 'pending' | 'processing' | 'ready' | 'delivered' | 'cancelled';
export type ColorMode = 'bw' | 'color';
export type PaperSize = 'A4' | 'A3' | 'A5' | 'Letter' | 'Legal';
export type Sides = 'single' | 'double';
export type DeliveryMethod = 'pickup' | 'delivery';

export interface PrintOrder {
  $id: string;
  $createdAt: string;
  userId: string;
  title: string;
  serviceType: ServiceType;
  status: OrderStatus;
  price: number;
  quantity: number;
  paperSize: PaperSize;
  colorMode: ColorMode;
  sides: Sides;
  bindingType: string;
  specialInstructions: string;
  fileUrls: string[];
  deliveryMethod: DeliveryMethod;
  estimatedReadyAt?: string;
  completedAt?: string;
  paymentStatus: 'pending' | 'awaiting_verification' | 'paid' | 'rejected';
  receiptUrl?: string;
  pricingType: 'auto' | 'manual';
  pageCount: number;
  deliverableUrl?: string;
}

export interface PrintMessage {
  $id: string;
  $createdAt: string;
  orderId: string;
  senderId: string;
  senderRole: 'customer' | 'admin';
  message: string;
  timestamp: string;
}

export interface PricingConfig {
  $id: string;
  serviceType: ServiceType;
  label: string;
  pricePerUnit: number;
  unit: string;
  colorMultiplier: number;
  doubleSidedDiscount: number;
  isActive: boolean;
}

export interface CreateOrderPayload {
  title: string;
  serviceType: ServiceType;
  quantity?: number;
  paperSize?: PaperSize;
  colorMode?: ColorMode;
  sides?: Sides;
  bindingType?: string;
  specialInstructions?: string;
  fileUrls?: string[];
  deliveryMethod?: DeliveryMethod;
  pageCount?: number;
}

export const SERVICE_TYPE_LABELS: Record<ServiceType, string> = {
  document: 'Document Printing',
  photocopy: 'Photocopying',
  graphic: 'Graphic Design',
  id_card: 'ID Card Production',
};

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  pending: 'Pending',
  processing: 'In Production',
  ready: 'Ready for Pickup',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};
