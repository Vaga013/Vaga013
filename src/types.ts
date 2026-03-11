export interface Space {
  id: number;
  owner_name: string;
  owner_phone: string;
  address: string;
  neighborhood: string;
  price_daily?: number;
  price_monthly?: number;
  rules?: string;
  status: 'pending' | 'active' | 'inactive';
  is_covered: boolean;
  num_spaces: number;
  vehicle_type: 'pequeno' | 'médio' | 'grande';
  created_at: string;
}

export interface Request {
  id: number;
  driver_name: string;
  driver_phone: string;
  neighborhood: string;
  period: string;
  status: 'pending' | 'fulfilled' | 'cancelled';
  created_at: string;
}

export interface Stats {
  spaces: number;
  requests: number;
  revenue: number;
}
