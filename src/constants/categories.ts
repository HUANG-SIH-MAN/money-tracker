import { Category } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  // Expenses
  { id: 'exp_food', name: '飲食', icon: 'fast-food', type: 'EXPENSE', color: '#FF9500' },
  { id: 'exp_transport', name: '交通', icon: 'bus', type: 'EXPENSE', color: '#007AFF' },
  { id: 'exp_shopping', name: '購物', icon: 'cart', type: 'EXPENSE', color: '#FF2D55' },
  { id: 'exp_housing', name: '居住', icon: 'home', type: 'EXPENSE', color: '#5856D6' },
  { id: 'exp_entertainment', name: '娛樂', icon: 'game-controller', type: 'EXPENSE', color: '#AF52DE' },
  { id: 'exp_other', name: '其他支出', icon: 'ellipsis-horizontal', type: 'EXPENSE', color: '#8E8E93' },
  
  // Income
  { id: 'inc_salary', name: '薪資', icon: 'cash', type: 'INCOME', color: '#34C759' },
  { id: 'inc_bonus', name: '獎金', icon: 'gift', type: 'INCOME', color: '#FFCC00' },
  { id: 'inc_other', name: '其他收入', icon: 'add-circle', type: 'INCOME', color: '#5AC8FA' },
];
