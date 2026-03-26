// ─── Auth ────────────────────────────────────────────────────────────────────

export interface Token {
  access_token: string
  refresh_token: string
  token_type: 'bearer'
}

export type UserRole = 'user' | 'admin'
export type DocumentStatus = 'draft' | 'pending' | 'approved' | 'rejected'

export interface UserRead {
  id: number
  email: string
  full_name: string | null
  inn: string | null
  registration_address: string | null
  residential_address: string | null
  passport: string | null
  phone: string | null
  bank_account: string | null
  role: UserRole
  status: DocumentStatus
  rejection_reason: string | null
  autopay_enabled?: boolean
}

// ─── Document ────────────────────────────────────────────────────────────────

export interface UserDocumentRead {
  id: number
  user_id: number
  contract_number: string | null
  bike_serial: string | null
  akb1_serial: string | null
  akb2_serial: string | null
  amount: string | null
  amount_text: string | null
  weeks_count: number | null
  filled_date: string | null
  end_date: string | null
  active: boolean
  signed: boolean
  status: DocumentStatus
  rejection_reason: string | null
  contract_text: string | null
  created_at: string
  updated_at: string
}

export interface UserContractItem {
  id: number
  contract_number: string | null
  bike_serial: string | null
  amount: string | null
  weeks_count: number | null
  filled_date: string | null
  end_date: string | null
  active: boolean
  signed: boolean
  status: DocumentStatus
}

export interface UserDocumentUserUpdate {
  last_name: string
  first_name: string
  patronymic: string
  inn: number
  registration_address: string
  residential_address: string
  passport: number
  phone: string
  bank_account: number
}

// ─── Payments ────────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'succeeded' | 'canceled' | 'refund_required' | 'requires_payment'
export type PaymentStatus = 'pending' | 'succeeded' | 'canceled'
export type ContractPaymentStatus = 'pending' | 'processing' | 'paid' | 'failed'
export type PaymentType = 'rent' | 'damage' | 'recalculation'

export interface ContractPaymentRead {
  id: number
  user_id: number
  document_id: number
  payment_number: number
  due_date: string
  amount: number
  payment_type: PaymentType
  status: ContractPaymentStatus
  order_id: number | null
  payment_id: number | null
  paid_at: string | null
}

export interface OrderRead {
  id: number
  user_id: number
  amount: number
  currency: string
  status: OrderStatus
  description: string | null
  created_at: string
  updated_at: string
}

export interface CreatePaymentRequest {
  order_id?: number | null
  schedule_payment_id?: number | null
  amount: number
  currency?: string
  description?: string | null
  save_payment_method?: boolean
  return_url?: string | null
}

export interface CreatePaymentResponse {
  order_id: number
  payment_id: number
  yookassa_payment_id: string
  status: PaymentStatus
  confirmation_url: string
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type AssetStatus = 'free' | 'rented' | 'repair' | 'decommissioned'
export type BatteryStatus = 'free' | 'rented' | 'repair' | 'decommissioned'

export interface Location {
  id: number
  name: string
  address: string
}

export interface Bike {
  id: number
  number: string
  vin: string
  name: string
  description: string | null
  status: AssetStatus
  purchase_date: string | null
  last_service_date: string | null
  next_service_date: string | null
  type_id: number | null
  location_id: number | null
}

export interface Battery {
  id: number
  number: string
  name: string
  description: string | null
  voltage: number | null
  capacity: number | null
  status: BatteryStatus
  purchase_date: string | null
  location_id: number | null
}

export interface BikePricing {
  id: number
  type_id: number
  name_type: string
  min_weeks_count: number
  max_weeks_count: number
  amount_weeks: number
}

// ─── Admin user list ─────────────────────────────────────────────────────────

export interface UserWithDocumentSummary {
  id: number
  email: string
  full_name: string | null
  phone: string | null
  role: UserRole
  status: DocumentStatus
  rejection_reason: string | null
  autopay_enabled: boolean
  document?: UserDocumentRead | null
}

// ─── Return Acts ─────────────────────────────────────────────────────────────

export interface ReturnActRead {
  id: number
  user_id: number
  document_id: number
  return_act_number: string | null
  contract_number: string | null
  rent_end_date: string | null
  filled_date: string | null
  bike_serial: string | null
  akb1_serial: string | null
  akb2_serial: string | null
  is_fix_bike: boolean
  is_fix_akb_1: boolean
  is_fix_akb_2: boolean
  damage_description: string | null
  damage_amount: number
  debt_term_days: number
  debt_due_date: string | null
  damage_schedule_payment_id: number | null
}

export interface ReturnActCreateRequest {
  is_fix_bike: boolean
  is_fix_AKB_1: boolean
  is_fix_AKB_2: boolean
  damage_description?: string | null
  damage_amount?: number
  debt_term_days?: number
}

// ─── API Error ───────────────────────────────────────────────────────────────

export interface ApiError {
  detail: string | { msg: string; type: string }[]
}
