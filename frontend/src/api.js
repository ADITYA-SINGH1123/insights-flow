const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

// =========================
// Login
// =========================

export async function loginUser (email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      email,
      password
    })
  })

  if (!response.ok) {
    const errorData = await response.json()

    throw new Error(errorData.detail || 'Login failed')
  }

  return response.json()
}

// =========================
// Current User Profile
// =========================

export async function getCurrentUser (token) {
  const response = await fetch(`${API_BASE_URL}/api/auth/me`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch user profile')
  }

  return response.json()
}

// =========================
// Analytics Summary
// =========================

export async function getAnalyticsSummary (token, period = '30') {
  const response = await fetch(
    `${API_BASE_URL}/api/analytics/summary?period=${period}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch analytics summary')
  }

  return response.json()
}

// =========================
// Top Products
// =========================
export async function getTopProducts (token, period = '30') {
  const response = await fetch(
    `${API_BASE_URL}/api/analytics/top-products?period=${period}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch top products')
  }

  return response.json()
}

// =========================
// Monthly Sales
// =========================
export async function getMonthlySales (token, period = '30') {
  const response = await fetch(
    `${API_BASE_URL}/api/analytics/monthly-sales?period=${period}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch monthly sales')
  }

  return response.json()
}
// =========================
// Recent Sales
// =========================

export async function getRecentSales (token) {
  const response = await fetch(`${API_BASE_URL}/api/sales/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch recent sales')
  }

  return response.json()
}

// =========================
// Create Sale
// =========================

export async function createSale (token, customerId, productId, quantity) {
  const response = await fetch(`${API_BASE_URL}/api/sales/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      customer_id: Number(customerId),
      product_id: Number(productId),
      quantity: Number(quantity)
    })
  })

  if (!response.ok) {
    const errorData = await response.json()

    throw new Error(errorData.detail || 'Failed to create sale')
  }

  return response.json()
}

// =========================
// Get Products
// =========================

export async function getProducts (token) {
  const response = await fetch(`${API_BASE_URL}/api/products/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch products')
  }

  return response.json()
}

// =========================
// Get Customers
// =========================

export async function getCustomers (token) {
  const response = await fetch(`${API_BASE_URL}/api/customers/`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  })

  if (!response.ok) {
    throw new Error('Failed to fetch customers')
  }

  return response.json()
}

// =========================
// Create Customer
// =========================

export async function createCustomer (token, name, email, phone, city) {
  const response = await fetch(`${API_BASE_URL}/api/customers/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.trim(),
      email: email.trim() ? email.trim() : null,
      phone: phone.trim() ? phone.trim() : null,
      city: city.trim() ? city.trim() : null
    })
  })

  if (!response.ok) {
    const errorData = await response.json()

    throw new Error(errorData.detail || 'Failed to create customer')
  }

  return response.json()
}
// =========================
// Create Product
// =========================

export async function createProduct (
  token,
  name,
  category,
  price,
  stockQuantity
) {
  const response = await fetch(`${API_BASE_URL}/api/products/`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: name.trim(),
      category: category.trim() ? category.trim() : null,
      price: Number(price),
      stock_quantity: Number(stockQuantity)
    })
  })

  if (!response.ok) {
    const errorData = await response.json()

    throw new Error(errorData.detail || 'Failed to create product')
  }

  return response.json()
}
// =========================
// Daily Sales
// =========================

export async function getDailySales (token, period = '7') {
  const response = await fetch(
    `${API_BASE_URL}/api/analytics/daily-sales?period=${period}`,
    {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    }
  )

  if (!response.ok) {
    throw new Error('Failed to fetch daily sales')
  }

  return response.json()
}
