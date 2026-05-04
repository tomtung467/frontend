# Frontend Architecture - Vue 3 + Vite

## Tech Stack
- **Framework**: Vue 3 (Composition API)
- **Build Tool**: Vite
- **State Management**: Pinia
- **Routing**: Vue Router
- **HTTP Client**: Axios
- **Real-time**: Socket.io-client (for WebSocket)
- **UI Components**: Custom components + Tailwind CSS (recommended)
- **Validation**: Vee-Validate
- **Date/Time**: Day.js
- **Charting**: Chart.js or ECharts (for analytics)
- **Icons**: Heroicons or Font Awesome

---

## Directory Structure

```
frontend/
├── src/
│   ├── main.js                     # App entry point
│   ├── App.vue                     # Root component
│   ├── style.css                   # Global styles
│   │
│   ├── api/
│   │   ├── client.js               # Axios instance with interceptors
│   │   ├── auth.js                 # Auth API calls
│   │   ├── customer.js             # Customer module APIs
│   │   ├── ai.js                   # AI/Voice APIs
│   │   ├── operations.js           # Operations/Tables APIs
│   │   ├── kitchen.js              # Kitchen Display System APIs
│   │   ├── menu.js                 # Menu/Inventory APIs
│   │   ├── employees.js            # HR APIs
│   │   ├── analytics.js            # Analytics APIs
│   │   ├── payment.js              # Payment APIs
│   │   └── realtime.js             # WebSocket connections
│   │
│   ├── stores/                     # Pinia stores (state management)
│   │   ├── index.js                # Store initialization
│   │   ├── auth.js                 # Authentication state
│   │   ├── user.js                 # Current user profile
│   │   ├── customer/
│   │   │   ├── menu.js             # Menu items cache
│   │   │   ├── cart.js             # Shopping cart
│   │   │   ├── orders.js           # Order history
│   │   │   └── recommendations.js  # AI recommendations
│   │   ├── operations/
│   │   │   ├── tables.js           # Table states
│   │   │   ├── notifications.js    # Order ready notifications
│   │   │   └── floorPlan.js        # Floor plan view state
│   │   ├── kitchen/
│   │   │   ├── queue.js            # Kitchen queue items
│   │   │   └── stats.js            # Kitchen statistics
│   │   ├── menu/
│   │   │   ├── foods.js            # All foods
│   │   │   └── inventory.js        # Inventory state
│   │   ├── analytics/
│   │   │   ├── reports.js          # Report data
│   │   │   └── dashboard.js        # Dashboard metrics
│   │   └── common/
│   │       ├── notification.js     # Toast notifications
│   │       └── loading.js          # Loading states
│   │
│   ├── components/
│   │   ├── common/
│   │   │   ├── Header.vue          # App header/navbar
│   │   │   ├── Sidebar.vue         # Left sidebar
│   │   │   ├── Footer.vue
│   │   │   ├── Button.vue
│   │   │   ├── Card.vue
│   │   │   ├── Modal.vue
│   │   │   ├── Toast.vue           # Notifications
│   │   │   ├── Loading.vue         # Spinner
│   │   │   └── Pagination.vue
│   │   │
│   │   ├── auth/
│   │   │   ├── LoginForm.vue
│   │   │   ├── RegisterForm.vue
│   │   │   └── ForgotPassword.vue
│   │   │
│   │   ├── customer/
│   │   │   ├── MenuCard.vue        # Food item card
│   │   │   ├── MenuGrid.vue        # Grid of menu items
│   │   │   ├── CategoryTabs.vue
│   │   │   ├── SearchBar.vue
│   │   │   ├── AIAssistant.vue     # Voice/Chat interface
│   │   │   ├── Cart.vue            # Shopping cart
│   │   │   ├── CartItem.vue
│   │   │   ├── Checkout.vue
│   │   │   ├── OrderList.vue
│   │   │   ├── OrderDetail.vue
│   │   │   ├── OrderStatus.vue     # Real-time status
│   │   │   └── RecipeModal.vue     # Food details popup
│   │   │
│   │   ├── operations/
│   │   │   ├── FloorPlan.vue       # Visual table layout
│   │   │   ├── TableCard.vue       # Single table component
│   │   │   ├── TableStatusBadge.vue
│   │   │   ├── TableMergeModal.vue
│   │   │   ├── ServiceNotificationPanel.vue
│   │   │   ├── NotificationCard.vue
│   │   │   ├── OrderReadyAlert.vue
│   │   │   └── TableReservationForm.vue
│   │   │
│   │   ├── kitchen/
│   │   │   ├── KitchenQueue.vue    # Main KDS view
│   │   │   ├── KitchenCard.vue     # Single order item card
│   │   │   ├── KitchenColumn.vue   # Kanban column (Queue/Cooking/Ready)
│   │   │   ├── SectionFilter.vue
│   │   │   ├── TimerDisplay.vue
│   │   │   └── KitchenStats.vue
│   │   │
│   │   ├── menu/
│   │   │   ├── MenuManagement.vue  # Admin menu CMS
│   │   │   ├── FoodForm.vue        # Add/Edit food
│   │   │   ├── CategoryForm.vue
│   │   │   ├── RecipeForm.vue
│   │   │   ├── FoodTable.vue       # Foods list table
│   │   │   └── BulkUpload.vue      # CSV upload
│   │   │
│   │   ├── inventory/
│   │   │   ├── InventoryList.vue
│   │   │   ├── InventoryTable.vue
│   │   │   ├── IngredientForm.vue
│   │   │   ├── StockAdjustmentForm.vue
│   │   │   ├── AlertsList.vue
│   │   │   └── InventoryReport.vue
│   │   │
│   │   ├── employees/
│   │   │   ├── EmployeeList.vue
│   │   │   ├── EmployeeTable.vue
│   │   │   ├── EmployeeForm.vue
│   │   │   ├── EmployeeDetail.vue
│   │   │   ├── RoleAssignment.vue
│   │   │   ├── DepartmentForm.vue
│   │   │   └── PerformanceChart.vue
│   │   │
│   │   ├── payment/
│   │   │   ├── PaymentForm.vue
│   │   │   ├── PaymentMethodSelect.vue
│   │   │   ├── QRCodeDisplay.vue
│   │   │   ├── CouponInput.vue
│   │   │   ├── InvoicePreview.vue
│   │   │   ├── SplitBillForm.vue
│   │   │   └── PaymentReceipt.vue
│   │   │
│   │   ├── analytics/
│   │   │   ├── Dashboard.vue       # Main dashboard
│   │   │   ├── MetricCard.vue
│   │   │   ├── RevenueChart.vue
│   │   │   ├── BestSellersChart.vue
│   │   │   ├── OrderChart.vue
│   │   │   ├── KPIChart.vue
│   │   │   ├── RevenueReport.vue
│   │   │   ├── ReportTable.vue
│   │   │   └── DateRangeFilter.vue
│   │   │
│   │   └── common/
│   │       ├── ErrorBoundary.vue
│   │       └── PageNotFound.vue
│   │
│   ├── composables/                # Reusable logic hooks
│   │   ├── useAuth.js              # Authentication logic
│   │   ├── useCart.js              # Cart operations
│   │   ├── useOrder.js             # Order operations
│   │   ├── useTable.js             # Table operations
│   │   ├── useFloorPlan.js         # Floor plan logic
│   │   ├── useRealtime.js          # WebSocket logic
│   │   ├── useNotification.js      # Toast notifications
│   │   ├── useFetch.js             # Generic fetch hook
│   │   ├── useForm.js              # Form handling
│   │   ├── useDebounce.js
│   │   ├── useThrottle.js
│   │   └── useLocalStorage.js
│   │
│   ├── router/
│   │   ├── index.js                # Router configuration
│   │   ├── routes/
│   │   │   ├── auth.js             # Auth routes
│   │   │   ├── customer.js         # Customer routes
│   │   │   ├── operations.js       # Operations routes
│   │   │   ├── kitchen.js          # Kitchen routes
│   │   │   ├── admin.js            # Admin routes
│   │   │   └── dashboard.js        # Dashboard routes
│   │   └── guards/
│   │       ├── authGuard.js        # Authentication check
│   │       └── roleGuard.js        # Role-based access
│   │
│   ├── modules/                    # Feature modules (keep existing)
│   │   ├── auth/
│   │   │   ├── features/
│   │   │   │   ├── login/
│   │   │   │   └── register/
│   │   │   ├── functions/
│   │   │   │   ├── authApi.js
│   │   │   │   ├── authStorage.js
│   │   │   │   └── authValidator.js
│   │   │   └── view/
│   │   │       ├── LoginView.vue
│   │   │       └── RegisterView.vue
│   │   │
│   │   ├── customer/
│   │   │   ├── features/
│   │   │   │   ├── menu/
│   │   │   │   ├── cart/
│   │   │   │   ├── order/
│   │   │   │   └── recommendations/
│   │   │   ├── functions/
│   │   │   └── views/
│   │   │
│   │   ├── operations/
│   │   │   ├── features/
│   │   │   ├── functions/
│   │   │   └── views/
│   │   │
│   │   ├── kitchen/
│   │   │   ├── features/
│   │   │   ├── functions/
│   │   │   └── views/
│   │   │
│   │   ├── admin/
│   │   │   ├── menu/
│   │   │   ├── inventory/
│   │   │   ├── employees/
│   │   │   └── analytics/
│   │   │
│   │   └── shared/
│   │       ├── api/
│   │       ├── store/
│   │       └── utils/
│   │
│   ├── directives/                 # Custom directives
│   │   ├── v-focus.js
│   │   ├── v-click-outside.js
│   │   ├── v-debounce.js
│   │   └── v-permissions.js        # Role-based visibility
│   │
│   ├── filters/                    # Custom filters
│   │   ├── currency.js             # Format currency
│   │   ├── dateTime.js             # Format date/time
│   │   └── truncate.js
│   │
│   ├── utils/                      # Utility functions
│   │   ├── constants.js            # Global constants
│   │   ├── formatters.js           # Data formatters
│   │   ├── validators.js           # Validation rules
│   │   ├── date-utils.js
│   │   ├── number-utils.js
│   │   ├── storage.js              # Local/Session storage
│   │   └── helpers.js
│   │
│   ├── layouts/
│   │   ├── RootLayout.vue          # Default layout
│   │   ├── CustomerLayout.vue      # Customer pages
│   │   ├── StaffLayout.vue         # Staff pages
│   │   ├── KitchenLayout.vue       # Kitchen display
│   │   ├── AdminLayout.vue         # Admin panel
│   │   └── AuthLayout.vue          # Auth pages (no header)
│   │
│   ├── views/
│   │   ├── Index.vue               # Home/Landing
│   │   ├── Dashboard.vue           # General dashboard
│   │   │
│   │   ├── auth/
│   │   │   ├── Login.vue
│   │   │   ├── Register.vue
│   │   │   └── ForgotPassword.vue
│   │   │
│   │   ├── customer/
│   │   │   ├── Menu.vue            # E-Menu view
│   │   │   ├── Order.vue           # Checkout
│   │   │   ├── OrderHistory.vue
│   │   │   ├── OrderTracking.vue   # Real-time tracking
│   │   │   └── Profile.vue
│   │   │
│   │   ├── operations/
│   │   │   ├── FloorPlanView.vue
│   │   │   ├── OrderBoard.vue
│   │   │   ├── ServiceCenter.vue   # Notifications hub
│   │   │   └── StaffDashboard.vue
│   │   │
│   │   ├── kitchen/
│   │   │   ├── KitchenDisplay.vue  # Main KDS screen
│   │   │   └── KitchenStats.vue
│   │   │
│   │   └── admin/
│   │       ├── AdminDashboard.vue
│   │       ├── MenuManagement.vue
│   │       ├── InventoryManagement.vue
│   │       ├── EmployeeManagement.vue
│   │       ├── ReportCenter.vue
│   │       ├── PaymentManagement.vue
│   │       ├── Settings.vue
│   │       └── Analytics.vue
│   │
│   ├── plugins/
│   │   └── index.js                # Global plugins registration
│   │
│   └── assets/
│       ├── images/
│       ├── icons/
│       ├── fonts/
│       └── styles/
│           ├── variables.css       # CSS variables
│           ├── tailwind.css        # Tailwind base
│           └── components.css      # Custom component styles
│
├── public/                         # Static files
│   ├── index.html
│   ├── favicon.ico
│   ├── logo.png
│   └── images/
│
├── index.html
├── vite.config.js
├── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Route Structure

### Public Routes
- `/` - Home/Landing
- `/auth/login` - Login
- `/auth/register` - Register
- `/auth/forgot-password` - Reset password

### Customer Routes (Protected)
- `/customer/menu` - E-Menu
- `/customer/cart` - Shopping cart
- `/customer/checkout` - Payment
- `/customer/orders` - Order history
- `/customer/order/:id/tracking` - Real-time tracking
- `/customer/profile` - User profile

### Staff Routes (Protected with Role: staff)
- `/operations/floor-plan` - Floor plan
- `/operations/service-center` - Notifications
- `/operations/reservations` - Table reservations

### Kitchen Routes (Protected with Role: chef/kitchen)
- `/kitchen/display` - Kitchen Display System (KDS)
- `/kitchen/stats` - Kitchen statistics

### Manager/Admin Routes (Protected with Role: manager/admin)
- `/admin/dashboard` - Main dashboard
- `/admin/menu` - Menu management
- `/admin/inventory` - Inventory management
- `/admin/employees` - Employee management
- `/admin/reports/revenue` - Revenue reports
- `/admin/reports/bestsellers` - Best-sellers
- `/admin/payments` - Payment records
- `/admin/settings` - System settings
- `/admin/analytics` - Analytics & reports

---

## Store Structure (Pinia)

### auth.js
```javascript
// State
- isAuthenticated
- token
- user (id, email, name, role)

// Getters
- isLoggedIn
- userRole
- userPermissions

// Actions
- login(email, password)
- logout()
- refreshToken()
- checkAuth()
```

### user.js
```javascript
// State
- profile (name, email, phone, preferences)
- preferences (theme, language, notifications)

// Actions
- updateProfile()
- updatePreferences()
```

### customer/cart.js
```javascript
// State
- items (food_id, quantity, notes)
- total

// Getters
- cartCount
- cartTotal
- cartItems

// Actions
- addToCart(food_id, quantity, notes)
- removeFromCart(food_id)
- updateQuantity(food_id, quantity)
- clearCart()
```

### customer/menu.js
```javascript
// State
- foods
- categories
- selectedCategory

// Actions
- fetchFoods()
- fetchCategories()
- searchFoods(query)
- filterByCategory(categoryId)
```

### operations/tables.js
```javascript
// State
- tables
- selectedTable
- tableStatuses

// Actions
- fetchTables()
- updateTableStatus(tableId, status)
- mergeTable(tableIds)
- unmergeTable(tableId)
```

### kitchen/queue.js
```javascript
// State
- queueItems (pending, cooking, ready)
- selectedItem
- filters (section, status)

// Actions
- fetchQueue()
- updateItemStatus(itemId, status)
- assignChef(itemId, chefId)
```

---

## Real-time Communication (WebSocket)

### useRealtime.js composable
```javascript
import { useSocket } from '@/composables/useSocket.js'

export const useRealtime = () => {
  const socket = useSocket()

  // Listen to events
  socket.on('order:ready', (data) => {
    // Handle order ready
  })

  socket.on('table:status:changed', (data) => {
    // Update table status
  })

  socket.on('kitchen:item:updated', (data) => {
    // Update KDS
  })
}
```

---

## API Integration

### api/client.js
```javascript
import axios from 'axios'

const client = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for JWT
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Response interceptor for errors
client.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Refresh token or redirect to login
    }
    return Promise.reject(error)
  }
)

export default client
```

---

## Component Patterns

### Menu Card Component
```vue
<template>
  <div class="card">
    <img :src="food.image_url" :alt="food.name" />
    <h3>{{ food.name }}</h3>
    <p class="price">{{ formatCurrency(food.price) }}</p>
    <button @click="addToCart">Add to Cart</button>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useCart } from '@/composables/useCart'

const props = defineProps({ food: Object })
const { addToCart: add } = useCart()

const addToCart = () => add(props.food.id, 1)
</script>
```

### Kitchen Display Card
```vue
<template>
  <div :class="['card', statusClass]">
    <div class="header">
      <span class="table">Table {{ item.table_number }}</span>
      <span class="time">{{ elapsedTime }}s</span>
    </div>
    <div class="content">
      <h4>{{ item.food_name }} x{{ item.quantity }}</h4>
      <p class="notes">{{ item.notes }}</p>
    </div>
    <div class="actions">
      <button @click="startCooking">Start</button>
      <button @click="markReady">Ready</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useKitchen } from '@/composables/useKitchen'

const props = defineProps({ item: Object })
const { updateItemStatus } = useKitchen()
const elapsedTime = ref(0)

const statusClass = computed(() => `status-${props.item.status}`)
</script>
```

---

## Authentication Flow

1. **Login**: POST `/api/v1/auth/login` → Get JWT token
2. **Store Token**: Save in localStorage + Pinia store
3. **Authenticated Requests**: Add `Authorization: Bearer {token}` header
4. **Token Refresh**: Auto-refresh before expiration
5. **Logout**: Clear token + redirect to login

---

## Styling Strategy

**Use Tailwind CSS for utility-first approach**:
```vue
<template>
  <div class="flex gap-4 p-6 bg-white rounded-lg shadow">
    <div class="flex-1">
      <h2 class="text-xl font-bold mb-2">{{ title }}</h2>
      <p class="text-gray-600">{{ description }}</p>
    </div>
    <button class="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
      Action
    </button>
  </div>
</template>
```

---

## Build & Deployment

```bash
# Development
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint
npm run lint

# Format
npm run format
```

### Environment Variables (.env)
```
VITE_API_URL=https://api.restaurant.local/api/v1
VITE_SOCKET_URL=https://api.restaurant.local
VITE_APP_NAME=Restaurant Management System
```

