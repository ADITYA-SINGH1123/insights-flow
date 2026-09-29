import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend
} from 'recharts'
import './App.css'
import Login from './Login'
import { useEffect, useState } from 'react'
import {
  getAnalyticsSummary,
  getTopProducts,
  getMonthlySales,
  getDailySales,
  getRecentSales,
  getCurrentUser,
  createSale,
  getProducts,
  getCustomers,
  createCustomer,
  createProduct
} from './api'

function App () {
  // =========================
  // Authentication
  // =========================

  const [token, setToken] = useState(localStorage.getItem('access_token'))

  const [currentUser, setCurrentUser] = useState(null)

  // =========================
  // Navigation
  // =========================

  const [activePage, setActivePage] = useState('dashboard')

  // =========================
  // Dashboard Data
  // =========================

  const [summary, setSummary] = useState(null)
  const [topProducts, setTopProducts] = useState([])
  const [monthlySales, setMonthlySales] = useState([])
  const [dailySales, setDailySales] = useState([])
  const [recentSales, setRecentSales] = useState([])

  const [loading, setLoading] = useState(true)
  const [dashboardError, setDashboardError] = useState('')

  // =========================
  // Products
  // =========================

  const [products, setProducts] = useState([])
  const [productSearch, setProductSearch] = useState('')
  const [productsLoading, setProductsLoading] = useState(false)
  const [showProductForm, setShowProductForm] = useState(false)

  const [newProductName, setNewProductName] = useState('')
  const [newProductCategory, setNewProductCategory] = useState('')
  const [newProductPrice, setNewProductPrice] = useState('')
  const [newProductStock, setNewProductStock] = useState('')

  const [productSaving, setProductSaving] = useState(false)
  const [productMessage, setProductMessage] = useState('')
  const [productError, setProductError] = useState('')

  // =========================
  // Customers
  // =======================
  const [customers, setCustomers] = useState([])
  const [customerSearch, setCustomerSearch] = useState('')
  const [customersLoading, setCustomersLoading] = useState(false)

  const [showCustomerForm, setShowCustomerForm] = useState(false)

  const [newCustomerName, setNewCustomerName] = useState('')

  const [newCustomerEmail, setNewCustomerEmail] = useState('')

  const [newCustomerPhone, setNewCustomerPhone] = useState('')

  const [newCustomerCity, setNewCustomerCity] = useState('')

  const [customerSaving, setCustomerSaving] = useState(false)

  const [customerMessage, setCustomerMessage] = useState('')

  const [customerError, setCustomerError] = useState('')

  // =========================
  // Sales Search
  // =========================

  const [salesSearch, setSalesSearch] = useState('')

  // =========================
  // Add Sale
  // =========================

  const [showSaleForm, setShowSaleForm] = useState(false)

  const [customerId, setCustomerId] = useState('')
  const [productId, setProductId] = useState('')
  const [quantity, setQuantity] = useState('')

  const [saleLoading, setSaleLoading] = useState(false)

  const [saleMessage, setSaleMessage] = useState('')
  const [saleError, setSaleError] = useState('')
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30')

  // =========================
  // Load Current User
  // =========================

  useEffect(() => {
    async function loadCurrentUser () {
      if (!token) {
        return
      }

      try {
        const data = await getCurrentUser(token)

        setCurrentUser(data)
      } catch (error) {
        console.error('User profile error:', error)

        localStorage.removeItem('access_token')

        setToken(null)
        setCurrentUser(null)
      }
    }

    loadCurrentUser()
  }, [token])

  // =========================
  // Load Dashboard
  // =========================

  useEffect(() => {
    async function loadDashboard () {
      if (!token) {
        setLoading(false)
        return
      }

      try {
        setDashboardError('')

        const [summaryData, productsData, monthlyData, dailyData, salesData] =
          await Promise.all([
            getAnalyticsSummary(token, analyticsPeriod),
            getTopProducts(token),
            getMonthlySales(token),
            getDailySales(token, analyticsPeriod),
            getRecentSales(token)
          ])

        setSummary(summaryData)
        setTopProducts(productsData)
        setMonthlySales(monthlyData)
        setDailySales(dailyData)
        setRecentSales(salesData)
      } catch (error) {
        console.error('Dashboard loading error:', error)
        setDashboardError('Unable to load dashboard data. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadDashboard()
  }, [token, analyticsPeriod])

  // =========================
  // Load Products
  // =========================

  async function loadProducts () {
    if (!token) {
      return
    }

    try {
      setProductsLoading(true)

      const data = await getProducts(token)

      setProducts(data)
    } catch (error) {
      console.error('Products error:', error)
    } finally {
      setProductsLoading(false)
    }
  }

  // =========================
  // Load Customers
  // =========================

  async function loadCustomers () {
    if (!token) {
      return
    }

    try {
      setCustomersLoading(true)

      const data = await getCustomers(token)

      setCustomers(data)
    } catch (error) {
      console.error('Customers error:', error)
    } finally {
      setCustomersLoading(false)
    }
  }

  // =========================
  // Load Sale Form Data
  // =========================

  useEffect(() => {
    if (!token || !showSaleForm) {
      return
    }

    setSaleError('')

    loadCustomers()
    loadProducts()
  }, [token, showSaleForm])

  // =========================
  // Load Products Page
  // =========================

  useEffect(() => {
    if (!token) {
      return
    }

    if (activePage === 'products') {
      loadProducts()
    }
  }, [token, activePage])

  // =========================
  // Load Customers Page
  // =========================

  useEffect(() => {
    if (!token) {
      return
    }

    if (activePage === 'customers') {
      loadCustomers()
    }
  }, [token, activePage])

  // =========================
  // Refresh Dashboard
  // =========================

  async function refreshDashboard () {
    if (!token) {
      return
    }

    try {
      const [
        summaryData,
        topProductsData,
        monthlyData,
        dailyData,
        salesData,
        productListData,
        customerListData
      ] = await Promise.all([
        getAnalyticsSummary(token, analyticsPeriod),
        getTopProducts(token),
        getMonthlySales(token),
        getDailySales(token, analyticsPeriod),
        getRecentSales(token),
        getProducts(token),
        getCustomers(token)
      ])

      setSummary(summaryData)
      setTopProducts(topProductsData)
      setMonthlySales(monthlyData)
      setDailySales(dailyData)
      setRecentSales(salesData)

      setProducts(productListData)
      setCustomers(customerListData)
    } catch (error) {
      console.error('Dashboard refresh error:', error)
    }
  }

  // =========================
  // Create Sale
  // =========================

  async function handleCreateSale (event) {
    event.preventDefault()

    setSaleMessage('')
    setSaleError('')

    if (!customerId || !productId || !quantity) {
      setSaleError('Please fill all sale details.')

      return
    }

    if (Number(quantity) <= 0) {
      setSaleError('Quantity must be greater than 0.')

      return
    }

    const selectedProduct = products.find(
      product => Number(product.id) === Number(productId)
    )

    if (!selectedProduct) {
      setSaleError('Please select a valid product.')

      return
    }

    if (Number(selectedProduct.stock_quantity) < Number(quantity)) {
      setSaleError(
        `Only ${selectedProduct.stock_quantity} unit(s) available in stock.`
      )

      return
    }

    try {
      setSaleLoading(true)

      await createSale(token, customerId, productId, quantity)

      setSaleMessage('Sale created successfully!')

      setCustomerId('')
      setProductId('')
      setQuantity('')

      await refreshDashboard()

      setTimeout(() => {
        setShowSaleForm(false)
        setSaleMessage('')
      }, 1200)
    } catch (error) {
      setSaleError(error.message || 'Failed to create sale.')
    } finally {
      setSaleLoading(false)
    }
  }

  // =========================
  // Close Sale Form
  // =========================

  function closeSaleForm () {
    if (saleLoading) {
      return
    }

    setShowSaleForm(false)

    setCustomerId('')
    setProductId('')
    setQuantity('')

    setSaleMessage('')
    setSaleError('')
  }

  // =========================
  // Logout
  // =========================

  function handleLogout () {
    localStorage.removeItem('access_token')

    setToken(null)
    setCurrentUser(null)

    setSummary(null)
    setTopProducts([])
    setMonthlySales([])
    setDailySales([])

    setRecentSales([])

    setCustomers([])
    setProducts([])
    setShowSaleForm(false)
    setShowCustomerForm(false)
    setShowProductForm(false)

    setNewProductName('')
    setNewProductCategory('')
    setNewProductPrice('')
    setNewProductStock('')

    setProductMessage('')
    setProductError('')

    setCustomerId('')
    setProductId('')
    setQuantity('')

    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerPhone('')
    setNewCustomerCity('')
    setCustomerMessage('')
    setCustomerError('')

    setActivePage('dashboard')
  }
  // =========================
  // Create Customer
  // =========================

  async function handleCreateCustomer (event) {
    event.preventDefault()

    setCustomerMessage('')
    setCustomerError('')

    if (!newCustomerName.trim()) {
      setCustomerError('Customer name is required.')

      return
    }

    try {
      setCustomerSaving(true)

      await createCustomer(
        token,
        newCustomerName,
        newCustomerEmail,
        newCustomerPhone,
        newCustomerCity
      )

      setCustomerMessage('Customer added successfully!')

      setNewCustomerName('')
      setNewCustomerEmail('')
      setNewCustomerPhone('')
      setNewCustomerCity('')

      await loadCustomers()

      setTimeout(() => {
        setShowCustomerForm(false)
        setCustomerMessage('')
      }, 1200)
    } catch (error) {
      setCustomerError(error.message || 'Failed to create customer.')
    } finally {
      setCustomerSaving(false)
    }
  }
  // =========================
  // Create Product
  // =========================

  async function handleCreateProduct (event) {
    event.preventDefault()

    setProductMessage('')
    setProductError('')

    if (!newProductName.trim()) {
      setProductError('Product name is required.')
      return
    }

    if (!newProductPrice || Number(newProductPrice) <= 0) {
      setProductError('Product price must be greater than 0.')
      return
    }

    if (newProductStock === '' || Number(newProductStock) < 0) {
      setProductError('Stock quantity cannot be negative.')
      return
    }

    try {
      setProductSaving(true)

      await createProduct(
        token,
        newProductName,
        newProductCategory,
        newProductPrice,
        newProductStock
      )

      setProductMessage('Product added successfully!')

      setNewProductName('')
      setNewProductCategory('')
      setNewProductPrice('')
      setNewProductStock('')

      await loadProducts()

      setTimeout(() => {
        setShowProductForm(false)
        setProductMessage('')
      }, 1200)
    } catch (error) {
      setProductError(error.message || 'Failed to create product.')
    } finally {
      setProductSaving(false)
    }
  }

  // =========================
  // Close Product Form
  // =========================

  function closeProductForm () {
    if (productSaving) {
      return
    }

    setShowProductForm(false)

    setNewProductName('')
    setNewProductCategory('')
    setNewProductPrice('')
    setNewProductStock('')

    setProductMessage('')
    setProductError('')
  }

  // =========================
  // Close Customer Form
  // =========================

  function closeCustomerForm () {
    if (customerSaving) {
      return
    }

    setShowCustomerForm(false)

    setNewCustomerName('')
    setNewCustomerEmail('')
    setNewCustomerPhone('')
    setNewCustomerCity('')

    setCustomerMessage('')
    setCustomerError('')
  }

  // =========================
  // Login
  // =========================

  if (!token) {
    return <Login onLogin={setToken} />
  }

  // =========================
  // User
  // =========================

  const userName = currentUser?.name || 'User'

  const userEmail = currentUser?.email || ''

  const userInitial = userName.charAt(0).toUpperCase()

  // =========================
  // Top Product
  // =========================

  const topProduct = topProducts.length > 0 ? topProducts[0] : null

  const topProductRevenue = topProduct ? Number(topProduct.total_revenue) : 0

  const topProductQuantity = topProduct ? Number(topProduct.total_quantity) : 0

  const topProductCategory = topProduct?.category || 'Uncategorized'

  // =========================
  // Chart Maximum
  // =========================

  const maxRevenue =
    monthlySales.length > 0
      ? Math.max(...monthlySales.map(item => Number(item.total_revenue)))
      : 0

  // =========================
  // Selected Product
  // =========================

  const selectedProduct = products.find(
    product => Number(product.id) === Number(productId)
  )

  const selectedCustomer = customers.find(
    customer => Number(customer.id) === Number(customerId)
  )

  const selectedProductPrice = selectedProduct
    ? Number(selectedProduct.price)
    : 0

  const selectedQuantity = Number(quantity) || 0

  const estimatedTotal = selectedProductPrice * selectedQuantity

  // =========================
  // Filter Sales
  // =========================

  const filteredSales = (recentSales || []).filter(sale => {
    const search = salesSearch.toLowerCase().trim()

    if (!search) {
      return true
    }

    return (
      sale.customer_name?.toLowerCase().includes(search) ||
      sale.product_name?.toLowerCase().includes(search) ||
      String(sale.id).includes(search)
    )
  })

  // =========================
  // Filter Products
  // =========================

  const filteredProducts = (products || []).filter(product => {
    const search = productSearch.toLowerCase().trim()

    if (!search) {
      return true
    }

    return (
      product.name?.toLowerCase().includes(search) ||
      product.category?.toLowerCase().includes(search)
    )
  })

  // =========================
  // Filter Customers
  // =========================

  const filteredCustomers = (customers || []).filter(customer => {
    const search = customerSearch.toLowerCase().trim()

    if (!search) {
      return true
    }

    return (
      customer.name?.toLowerCase().includes(search) ||
      customer.email?.toLowerCase().includes(search) ||
      customer.phone?.toLowerCase().includes(search) ||
      customer.city?.toLowerCase().includes(search)
    )
  })

  // =========================
  // Product Stock Status
  // =========================

  function getStockStatus (stock) {
    const value = Number(stock)

    if (value <= 0) {
      return {
        text: 'Out of Stock',
        className: 'product-stock out-stock'
      }
    }

    if (value <= 5) {
      return {
        text: 'Low Stock',
        className: 'product-stock low-stock'
      }
    }

    return {
      text: 'In Stock',
      className: 'product-stock in-stock'
    }
  }

  // =========================
  // Sidebar Navigation
  // =========================

  function handleNavigation (page) {
    setActivePage(page)

    if (page !== 'dashboard') {
      setShowSaleForm(false)
    }

    if (page !== 'customers') {
      setShowCustomerForm(false)
    }
  }

  // =========================
  // Dashboard
  // =========================

  function renderDashboard () {
    return (
      <>
        {dashboardError && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '9px',
              background: '#fff1f2',
              color: '#dc2626',
              fontSize: '13px'
            }}
          >
            {dashboardError}
          </div>
        )}

        {loading && !summary && !dashboardError && (
          <div
            style={{
              marginBottom: '18px',
              padding: '12px 14px',
              borderRadius: '9px',
              background: '#f8f9fc',
              color: '#555f70',
              fontSize: '13px',
              border: '1px solid #e8ebf1'
            }}
          >
            Loading dashboard data...
          </div>
        )}

        <header className='topbar'>
          <div>
            <p className='eyebrow'>OVERVIEW</p>

            <h1>Sales Dashboard</h1>

            <p className='subtitle'>
              Welcome back, {userName}. Here's your business overview.
            </p>
          </div>

          <button className='profile-btn' title={userEmail}>
            {userInitial}
          </button>
        </header>

        {/* Add Sale */}

        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginBottom: '18px'
          }}
        >
          <button
            onClick={() => setShowSaleForm(true)}
            style={{
              border: 'none',
              borderRadius: '10px',
              padding: '11px 18px',
              background: '#6366f1',
              color: 'white',
              fontWeight: '700',
              cursor: 'pointer'
            }}
          >
            + Add Sale
          </button>
        </div>

        {showSaleForm && renderSaleForm()}

        {/* Stats */}

        <section className='stats-grid'>
          <div className='stat-card'>
            <span>Total Revenue</span>

            <h2>
              ₹
              {summary
                ? Number(summary.total_revenue).toLocaleString('en-IN')
                : '0'}
            </h2>

            <small className='positive'>Current period performance</small>
          </div>

          <div className='stat-card'>
            <span>Total Orders</span>

            <h2>{summary ? summary.total_orders : 0}</h2>

            <small className='positive'>Current period performance</small>
          </div>

          <div className='stat-card'>
            <span>Total Quantity</span>

            <h2>{summary ? summary.total_quantity : 0}</h2>

            <small className='positive'>Current period performance</small>
          </div>

          <div className='stat-card'>
            <span>Average Order Value</span>

            <h2>
              ₹
              {summary
                ? Number(summary.average_order_value).toLocaleString('en-IN')
                : '0'}
            </h2>

            <small className='positive'>↑ 10.1% this month</small>
          </div>
        </section>

        {/* Content */}

        <section className='content-grid'>
          <div className='panel large-panel'>
            <div className='panel-header'>
              <div>
                <h3>Revenue Overview</h3>

                <p>Monthly sales performance</p>
              </div>

              <button className='filter-btn'>Monthly ▾</button>
            </div>

            <div className='revenue-chart'>
              <div className='chart-grid'>
                <span></span>
                <span></span>
                <span></span>
                <span></span>
              </div>

              <div className='chart-y-axis'>
                <span>₹{maxRevenue.toLocaleString('en-IN')}</span>

                <span>
                  ₹{Math.round(maxRevenue * 0.75).toLocaleString('en-IN')}
                </span>

                <span>
                  ₹{Math.round(maxRevenue * 0.5).toLocaleString('en-IN')}
                </span>

                <span>
                  ₹{Math.round(maxRevenue * 0.25).toLocaleString('en-IN')}
                </span>

                <span>₹0</span>
              </div>

              <div className='chart-bars'>
                {monthlySales.length > 0 ? (
                  monthlySales.map(item => {
                    const revenue = Number(item.total_revenue)

                    const height =
                      maxRevenue > 0
                        ? Math.max((revenue / maxRevenue) * 100, 8)
                        : 0

                    const isHighest = revenue === maxRevenue

                    return (
                      <div className='chart-column' key={item.month}>
                        <div
                          className='chart-value'
                          style={{
                            bottom: `calc(${height}% + 8px)`
                          }}
                        >
                          ₹{revenue.toLocaleString('en-IN')}
                        </div>

                        <div
                          className={
                            isHighest ? 'chart-bar highest' : 'chart-bar'
                          }
                          style={{
                            height: `${height}%`
                          }}
                        ></div>

                        <span className='chart-label'>{item.month}</span>
                      </div>
                    )
                  })
                ) : (
                  <div className='empty-chart'>No sales data available</div>
                )}
              </div>
            </div>
          </div>

          {/* Top Product */}

          <div className='panel'>
            <div className='panel-header'>
              <div>
                <h3>Top Product</h3>

                <p>Best performing product</p>
              </div>
            </div>

            <div className='product-card'>
              <div className='product-icon'>💻</div>

              <div>
                <h4>{topProduct ? topProduct.product_name : 'No product'}</h4>

                <p>{topProduct ? topProductCategory : '—'}</p>
              </div>

              <strong>
                ₹{topProduct ? topProductRevenue.toLocaleString('en-IN') : '0'}
              </strong>
            </div>

            <div className='product-info'>
              <span>Units Sold</span>

              <strong>{topProductQuantity}</strong>
            </div>
          </div>
        </section>

        {/* Recent Sales */}

        <section className='panel recent-panel'>
          <div className='panel-header'>
            <div>
              <h3>Recent Sales</h3>

              <p>Latest transactions from your store</p>
            </div>

            <button className='view-btn' onClick={() => setActivePage('sales')}>
              View All →
            </button>
          </div>

          <div className='table-wrapper'>
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Amount</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {(recentSales || []).length > 0 ? (
                  (recentSales || []).slice(0, 5).map(sale => (
                    <tr key={sale.id}>
                      <td>{sale.customer_name}</td>

                      <td>{sale.product_name}</td>

                      <td>{sale.quantity}</td>

                      <td>
                        ₹{Number(sale.total_amount).toLocaleString('en-IN')}
                      </td>

                      <td>
                        <span className='status'>Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='5'
                      style={{
                        textAlign: 'center',
                        color: '#8992a2',
                        padding: '25px'
                      }}
                    >
                      No sales available
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }

  // =========================
  // Add Sale Form
  // =========================

  function renderSaleForm () {
    return (
      <section
        className='panel'
        style={{
          marginBottom: '22px'
        }}
      >
        <div className='panel-header'>
          <div>
            <h3>Add New Sale</h3>

            <p>Create a new sales transaction</p>
          </div>

          <button
            className='filter-btn'
            onClick={closeSaleForm}
            disabled={saleLoading}
          >
            Close
          </button>
        </div>

        <form
          onSubmit={handleCreateSale}
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: '16px',
            marginTop: '22px'
          }}
        >
          {/* Customer */}

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#555f70'
              }}
            >
              Customer
            </label>

            <select
              value={customerId}
              onChange={event => setCustomerId(event.target.value)}
              required
              disabled={saleLoading}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px',
                background: 'white'
              }}
            >
              <option value=''>Select customer</option>

              {customers.map(customer => (
                <option key={customer.id} value={customer.id}>
                  {customer.name}
                  {customer.city ? ` — ${customer.city}` : ''}
                </option>
              ))}
            </select>

            {selectedCustomer && (
              <small
                style={{
                  display: 'block',
                  marginTop: '6px',
                  color: '#8992a2',
                  fontSize: '11px'
                }}
              >
                {selectedCustomer.email || 'No email available'}
              </small>
            )}
          </div>

          {/* Product */}

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#555f70'
              }}
            >
              Product
            </label>

            <select
              value={productId}
              onChange={event => setProductId(event.target.value)}
              required
              disabled={saleLoading}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px',
                background: 'white'
              }}
            >
              <option value=''>Select product</option>

              {products.map(product => (
                <option
                  key={product.id}
                  value={product.id}
                  disabled={Number(product.stock_quantity) <= 0}
                >
                  {product.name} — ₹
                  {Number(product.price).toLocaleString('en-IN')} | Stock:{' '}
                  {product.stock_quantity}
                </option>
              ))}
            </select>

            {selectedProduct && (
              <small
                style={{
                  display: 'block',
                  marginTop: '6px',
                  color:
                    Number(selectedProduct.stock_quantity) > 0
                      ? '#15803d'
                      : '#dc2626',
                  fontSize: '11px'
                }}
              >
                Price: ₹{selectedProductPrice.toLocaleString('en-IN')} •
                Available stock: {selectedProduct.stock_quantity}
              </small>
            )}
          </div>

          {/* Quantity */}

          <div>
            <label
              style={{
                display: 'block',
                marginBottom: '7px',
                fontSize: '13px',
                fontWeight: '600',
                color: '#555f70'
              }}
            >
              Quantity
            </label>

            <input
              type='number'
              min='1'
              max={selectedProduct ? selectedProduct.stock_quantity : undefined}
              placeholder='Enter quantity'
              value={quantity}
              onChange={event => setQuantity(event.target.value)}
              required
              disabled={saleLoading}
              style={{
                width: '100%',
                padding: '11px 12px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px'
              }}
            />

            {selectedProduct && (
              <small
                style={{
                  display: 'block',
                  marginTop: '6px',
                  color: '#8992a2',
                  fontSize: '11px'
                }}
              >
                Maximum available: {selectedProduct.stock_quantity}
              </small>
            )}
          </div>

          {/* Summary */}

          {selectedProduct && selectedQuantity > 0 && (
            <div
              style={{
                gridColumn: '1 / -1',
                marginTop: '4px',
                padding: '18px',
                borderRadius: '12px',
                background: '#f8f9fc',
                border: '1px solid #e8ebf1'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px',
                  flexWrap: 'wrap'
                }}
              >
                <div>
                  <span
                    style={{
                      display: 'block',
                      color: '#8992a2',
                      fontSize: '11px',
                      marginBottom: '5px'
                    }}
                  >
                    UNIT PRICE
                  </span>

                  <strong>
                    ₹{selectedProductPrice.toLocaleString('en-IN')}
                  </strong>
                </div>

                <div>
                  <span
                    style={{
                      display: 'block',
                      color: '#8992a2',
                      fontSize: '11px',
                      marginBottom: '5px'
                    }}
                  >
                    QUANTITY
                  </span>

                  <strong>{selectedQuantity}</strong>
                </div>

                <div
                  style={{
                    marginLeft: 'auto',
                    textAlign: 'right'
                  }}
                >
                  <span
                    style={{
                      display: 'block',
                      color: '#8992a2',
                      fontSize: '11px',
                      marginBottom: '5px'
                    }}
                  >
                    TOTAL AMOUNT
                  </span>

                  <strong
                    style={{
                      fontSize: '22px',
                      color: '#6366f1'
                    }}
                  >
                    ₹{estimatedTotal.toLocaleString('en-IN')}
                  </strong>
                </div>
              </div>
            </div>
          )}

          {/* Error */}

          {saleError && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '11px 13px',
                borderRadius: '9px',
                background: '#fff1f2',
                color: '#dc2626',
                fontSize: '13px'
              }}
            >
              {saleError}
            </div>
          )}

          {/* Success */}

          {saleMessage && (
            <div
              style={{
                gridColumn: '1 / -1',
                padding: '11px 13px',
                borderRadius: '9px',
                background: '#ecfdf3',
                color: '#15803d',
                fontSize: '13px'
              }}
            >
              {saleMessage}
            </div>
          )}

          {/* Submit */}

          <div
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              justifyContent: 'flex-end'
            }}
          >
            <button
              type='submit'
              disabled={saleLoading}
              style={{
                border: 'none',
                borderRadius: '9px',
                padding: '11px 20px',
                background: '#111827',
                color: 'white',
                fontWeight: '600',
                cursor: saleLoading ? 'not-allowed' : 'pointer',
                opacity: saleLoading ? 0.6 : 1
              }}
            >
              {saleLoading ? 'Creating Sale...' : 'Create Sale'}
            </button>
          </div>
        </form>
      </section>
    )
  }

  // =========================
  // Sales Page
  // =========================

  function renderSalesPage () {
    return (
      <>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>TRANSACTIONS</p>

            <h1>Sales</h1>

            <p className='subtitle'>
              Manage and review all sales transactions.
            </p>
          </div>

          <button className='profile-btn' title={userEmail}>
            {userInitial}
          </button>
        </header>

        <section className='panel'>
          <div
            className='panel-header'
            style={{
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3>Sales Transactions</h3>

              <p>Search your sales records</p>
            </div>

            <button
              onClick={() => setShowSaleForm(true)}
              style={{
                border: 'none',
                borderRadius: '9px',
                padding: '10px 16px',
                background: '#6366f1',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              + Add Sale
            </button>
          </div>

          <div
            style={{
              marginTop: '20px'
            }}
          >
            <input
              type='text'
              placeholder='Search by customer, product or sale ID...'
              value={salesSearch}
              onChange={event => setSalesSearch(event.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '11px 13px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>
        </section>

        {showSaleForm && renderSaleForm()}

        <section
          className='panel recent-panel'
          style={{
            marginTop: '22px'
          }}
        >
          <div className='panel-header'>
            <div>
              <h3>All Sales</h3>

              <p>
                {filteredSales.length} transaction
                {filteredSales.length !== 1 ? 's' : ''} found
              </p>
            </div>
          </div>

          <div className='table-wrapper'>
            <table>
              <thead>
                <tr>
                  <th>Sale ID</th>
                  <th>Customer</th>
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Unit Price</th>
                  <th>Total Amount</th>
                  <th>Date</th>
                  <th>Status</th>
                </tr>
              </thead>

              <tbody>
                {filteredSales.length > 0 ? (
                  filteredSales.map(sale => (
                    <tr key={sale.id}>
                      <td>#{sale.id}</td>

                      <td>{sale.customer_name}</td>

                      <td>{sale.product_name}</td>

                      <td>{sale.quantity}</td>

                      <td>
                        ₹{Number(sale.unit_price).toLocaleString('en-IN')}
                      </td>

                      <td>
                        <strong>
                          ₹{Number(sale.total_amount).toLocaleString('en-IN')}
                        </strong>
                      </td>

                      <td>
                        {sale.sale_date
                          ? new Date(sale.sale_date).toLocaleDateString('en-IN')
                          : '—'}
                      </td>

                      <td>
                        <span className='status'>Completed</span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan='8'
                      style={{
                        textAlign: 'center',
                        color: '#8992a2',
                        padding: '35px'
                      }}
                    >
                      No sales found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </>
    )
  }

  // =========================
  // Products Page
  // =========================
  function renderProductsPage () {
    const totalProducts = products.length

    const totalStock = products.reduce(
      (sum, product) => sum + Number(product.stock_quantity),
      0
    )

    const lowStockProducts = products.filter(
      product =>
        Number(product.stock_quantity) > 0 &&
        Number(product.stock_quantity) <= 5
    ).length

    const outOfStockProducts = products.filter(
      product => Number(product.stock_quantity) <= 0
    ).length

    return (
      <>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>CATALOG</p>

            <h1>Products</h1>

            <p className='subtitle'>
              Manage your product catalog and inventory.
            </p>
          </div>

          <button className='profile-btn' title={userEmail}>
            {userInitial}
          </button>
        </header>

        <section className='stats-grid'>
          <div className='stat-card'>
            <span>Total Products</span>
            <h2>{totalProducts}</h2>
            <small>Products in catalog</small>
          </div>

          <div className='stat-card'>
            <span>Total Stock</span>
            <h2>{totalStock}</h2>
            <small>Available units</small>
          </div>

          <div className='stat-card'>
            <span>Low Stock</span>
            <h2>{lowStockProducts}</h2>
            <small>5 units or less</small>
          </div>

          <div className='stat-card'>
            <span>Out of Stock</span>
            <h2>{outOfStockProducts}</h2>
            <small>Requires restocking</small>
          </div>
        </section>

        {/* Add Product Form */}

        {showProductForm && (
          <section
            className='panel'
            style={{
              marginBottom: '22px'
            }}
          >
            <div className='panel-header'>
              <div>
                <h3>Add New Product</h3>

                <p>Create a new product and add inventory.</p>
              </div>

              <button
                className='filter-btn'
                onClick={closeProductForm}
                disabled={productSaving}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleCreateProduct}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginTop: '22px'
              }}
            >
              {/* Product Name */}

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Product Name *
                </label>

                <input
                  type='text'
                  placeholder='Enter product name'
                  value={newProductName}
                  onChange={event => setNewProductName(event.target.value)}
                  required
                  disabled={productSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Category */}

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Category
                </label>

                <input
                  type='text'
                  placeholder='Electronics'
                  value={newProductCategory}
                  onChange={event => setNewProductCategory(event.target.value)}
                  disabled={productSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Price */}

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Price *
                </label>

                <input
                  type='number'
                  min='0.01'
                  step='0.01'
                  placeholder='55000'
                  value={newProductPrice}
                  onChange={event => setNewProductPrice(event.target.value)}
                  required
                  disabled={productSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Stock */}

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Stock Quantity *
                </label>

                <input
                  type='number'
                  min='0'
                  step='1'
                  placeholder='10'
                  value={newProductStock}
                  onChange={event => setNewProductStock(event.target.value)}
                  required
                  disabled={productSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              {/* Error */}

              {productError && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    background: '#fff1f2',
                    color: '#dc2626',
                    fontSize: '13px'
                  }}
                >
                  {productError}
                </div>
              )}

              {/* Success */}

              {productMessage && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    background: '#ecfdf3',
                    color: '#15803d',
                    fontSize: '13px'
                  }}
                >
                  {productMessage}
                </div>
              )}

              {/* Submit */}

              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <button
                  type='submit'
                  disabled={productSaving}
                  style={{
                    border: 'none',
                    borderRadius: '9px',
                    padding: '11px 20px',
                    background: '#111827',
                    color: 'white',
                    fontWeight: '600',
                    cursor: productSaving ? 'not-allowed' : 'pointer',
                    opacity: productSaving ? 0.6 : 1
                  }}
                >
                  {productSaving ? 'Saving Product...' : 'Save Product'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Product Catalog */}

        <section className='panel recent-panel'>
          <div
            className='panel-header'
            style={{
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3>Product Catalog</h3>

              <p>
                {filteredProducts.length} product
                {filteredProducts.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <button
              style={{
                border: 'none',
                borderRadius: '9px',
                padding: '10px 16px',
                background: '#6366f1',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onClick={() => {
                setProductError('')
                setProductMessage('')
                setShowProductForm(true)
              }}
            >
              + Add Product
            </button>
          </div>

          <div
            style={{
              marginTop: '20px'
            }}
          >
            <input
              type='text'
              placeholder='Search product or category...'
              value={productSearch}
              onChange={event => setProductSearch(event.target.value)}
              style={{
                width: '100%',
                maxWidth: '420px',
                padding: '11px 13px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>

          <div className='table-wrapper'>
            {productsLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '45px',
                  color: '#8992a2',
                  fontSize: '13px'
                }}
              >
                Loading products...
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredProducts.length > 0 ? (
                    filteredProducts.map(product => {
                      const stockStatus = getStockStatus(product.stock_quantity)

                      return (
                        <tr key={product.id}>
                          <td>
                            <div
                              style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '10px'
                              }}
                            >
                              <div
                                style={{
                                  width: '38px',
                                  height: '38px',
                                  borderRadius: '9px',
                                  display: 'grid',
                                  placeItems: 'center',
                                  background: '#eef2ff',
                                  fontSize: '17px'
                                }}
                              >
                                📦
                              </div>

                              <div>
                                <strong
                                  style={{
                                    display: 'block',
                                    fontSize: '13px'
                                  }}
                                >
                                  {product.name}
                                </strong>

                                <small
                                  style={{
                                    color: '#8992a2',
                                    fontSize: '11px'
                                  }}
                                >
                                  Product #{product.id}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>{product.category || 'Uncategorized'}</td>

                          <td>
                            <strong>
                              ₹{Number(product.price).toLocaleString('en-IN')}
                            </strong>
                          </td>

                          <td>{product.stock_quantity}</td>

                          <td>
                            <span className={stockStatus.className}>
                              {stockStatus.text}
                            </span>
                          </td>
                        </tr>
                      )
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan='5'
                        style={{
                          textAlign: 'center',
                          color: '#8992a2',
                          padding: '35px'
                        }}
                      >
                        No products found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </>
    )
  }

  // =========================
  // Customers Page
  // =========================
  function renderCustomersPage () {
    const totalCustomers = customers.length

    const customersWithEmail = customers.filter(customer =>
      Boolean(customer.email)
    ).length

    const customersWithPhone = customers.filter(customer =>
      Boolean(customer.phone)
    ).length

    const uniqueCities = new Set(
      customers.map(customer => customer.city).filter(Boolean)
    ).size

    return (
      <>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>CUSTOMERS</p>

            <h1>Customers</h1>

            <p className='subtitle'>
              Manage your customers and their information.
            </p>
          </div>

          <button className='profile-btn' title={userEmail}>
            {userInitial}
          </button>
        </header>

        {/* Customer Stats */}

        <section className='stats-grid'>
          <div className='stat-card'>
            <span>Total Customers</span>

            <h2>{totalCustomers}</h2>

            <small className='positive'>Active customer records</small>
          </div>

          <div className='stat-card'>
            <span>With Email</span>

            <h2>{customersWithEmail}</h2>

            <small>Customers with email</small>
          </div>

          <div className='stat-card'>
            <span>With Phone</span>

            <h2>{customersWithPhone}</h2>

            <small>Customers with phone</small>
          </div>

          <div className='stat-card'>
            <span>Cities</span>

            <h2>{uniqueCities}</h2>

            <small>Unique locations</small>
          </div>
        </section>

        {/* Add Customer Form */}

        {showCustomerForm && (
          <section
            className='panel'
            style={{
              marginBottom: '22px'
            }}
          >
            <div className='panel-header'>
              <div>
                <h3>Add New Customer</h3>

                <p>Create a new customer record.</p>
              </div>

              <button
                className='filter-btn'
                onClick={closeCustomerForm}
                disabled={customerSaving}
              >
                Close
              </button>
            </div>

            <form
              onSubmit={handleCreateCustomer}
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '16px',
                marginTop: '22px'
              }}
            >
              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Name *
                </label>

                <input
                  type='text'
                  placeholder='Enter customer name'
                  value={newCustomerName}
                  onChange={event => setNewCustomerName(event.target.value)}
                  required
                  disabled={customerSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Email
                </label>

                <input
                  type='email'
                  placeholder='customer@example.com'
                  value={newCustomerEmail}
                  onChange={event => setNewCustomerEmail(event.target.value)}
                  disabled={customerSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  Phone
                </label>

                <input
                  type='tel'
                  placeholder='9876543210'
                  value={newCustomerPhone}
                  onChange={event => setNewCustomerPhone(event.target.value)}
                  disabled={customerSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              <div>
                <label
                  style={{
                    display: 'block',
                    marginBottom: '7px',
                    fontSize: '13px',
                    fontWeight: '600',
                    color: '#555f70'
                  }}
                >
                  City
                </label>

                <input
                  type='text'
                  placeholder='Delhi'
                  value={newCustomerCity}
                  onChange={event => setNewCustomerCity(event.target.value)}
                  disabled={customerSaving}
                  style={{
                    width: '100%',
                    padding: '11px 12px',
                    border: '1px solid #dfe3ea',
                    borderRadius: '9px',
                    outline: 'none',
                    fontSize: '13px'
                  }}
                />
              </div>

              {customerError && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    background: '#fff1f2',
                    color: '#dc2626',
                    fontSize: '13px'
                  }}
                >
                  {customerError}
                </div>
              )}

              {customerMessage && (
                <div
                  style={{
                    gridColumn: '1 / -1',
                    padding: '11px 13px',
                    borderRadius: '9px',
                    background: '#ecfdf3',
                    color: '#15803d',
                    fontSize: '13px'
                  }}
                >
                  {customerMessage}
                </div>
              )}

              <div
                style={{
                  gridColumn: '1 / -1',
                  display: 'flex',
                  justifyContent: 'flex-end'
                }}
              >
                <button
                  type='submit'
                  disabled={customerSaving}
                  style={{
                    border: 'none',
                    borderRadius: '9px',
                    padding: '11px 20px',
                    background: '#111827',
                    color: 'white',
                    fontWeight: '600',
                    cursor: customerSaving ? 'not-allowed' : 'pointer',
                    opacity: customerSaving ? 0.6 : 1
                  }}
                >
                  {customerSaving ? 'Saving Customer...' : 'Save Customer'}
                </button>
              </div>
            </form>
          </section>
        )}

        {/* Customer Directory */}

        <section className='panel recent-panel'>
          <div
            className='panel-header'
            style={{
              flexWrap: 'wrap'
            }}
          >
            <div>
              <h3>Customer Directory</h3>

              <p>
                {filteredCustomers.length} customer
                {filteredCustomers.length !== 1 ? 's' : ''} found
              </p>
            </div>

            <button
              style={{
                border: 'none',
                borderRadius: '9px',
                padding: '10px 16px',
                background: '#6366f1',
                color: 'white',
                fontWeight: '700',
                cursor: 'pointer'
              }}
              onClick={() => {
                setCustomerError('')
                setCustomerMessage('')
                setShowCustomerForm(true)
              }}
            >
              + Add Customer
            </button>
          </div>

          <div
            style={{
              marginTop: '20px'
            }}
          >
            <input
              type='text'
              placeholder='Search customer, email, phone or city...'
              value={customerSearch}
              onChange={event => setCustomerSearch(event.target.value)}
              style={{
                width: '100%',
                maxWidth: '500px',
                padding: '11px 13px',
                border: '1px solid #dfe3ea',
                borderRadius: '9px',
                outline: 'none',
                fontSize: '13px'
              }}
            />
          </div>

          <div className='table-wrapper'>
            {customersLoading ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '45px',
                  color: '#8992a2',
                  fontSize: '13px'
                }}
              >
                Loading customers...
              </div>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>City</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.length > 0 ? (
                    filteredCustomers.map(customer => (
                      <tr key={customer.id}>
                        <td>
                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px'
                            }}
                          >
                            <div
                              style={{
                                width: '38px',
                                height: '38px',
                                borderRadius: '50%',
                                display: 'grid',
                                placeItems: 'center',
                                background: '#eef2ff',
                                color: '#6366f1',
                                fontWeight: '700',
                                fontSize: '13px'
                              }}
                            >
                              {customer.name?.charAt(0).toUpperCase()}
                            </div>

                            <div>
                              <strong
                                style={{
                                  display: 'block',
                                  fontSize: '13px'
                                }}
                              >
                                {customer.name}
                              </strong>

                              <small
                                style={{
                                  color: '#8992a2',
                                  fontSize: '11px'
                                }}
                              >
                                Customer #{customer.id}
                              </small>
                            </div>
                          </div>
                        </td>

                        <td>{customer.email || '—'}</td>

                        <td>{customer.phone || '—'}</td>

                        <td>{customer.city || '—'}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan='4'
                        style={{
                          textAlign: 'center',
                          color: '#8992a2',
                          padding: '35px'
                        }}
                      >
                        No customers found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </>
    )
  }

  // =========================
  // Placeholder Pages
  // =========================

  function renderPlaceholderPage (title, eyebrow, description) {
    const totalRevenue = Number(summary?.total_revenue || 0)
    const totalOrders = Number(summary?.total_orders || 0)
    const totalQuantity = Number(summary?.total_quantity || 0)
    const averageOrderValue = Number(summary?.average_order_value || 0)

    const maxMonthlyRevenue = Math.max(
      ...monthlySales.map(item => Number(item.revenue || 0)),
      1
    )

    return (
      <>
        <header className='topbar'>
          <div>
            <p className='eyebrow'>BUSINESS INTELLIGENCE</p>
            <h1>Analytics</h1>
            <p className='subtitle'>
              Explore detailed business performance analytics.
            </p>
          </div>
          <div className='analytics-period'>
            <button
              className={
                analyticsPeriod === '1'
                  ? 'secondary-btn active-period'
                  : 'secondary-btn'
              }
              onClick={() => setAnalyticsPeriod('1')}
            >
              Today
            </button>

            <button
              className={
                analyticsPeriod === '7'
                  ? 'secondary-btn active-period'
                  : 'secondary-btn'
              }
              onClick={() => setAnalyticsPeriod('7')}
            >
              7 Days
            </button>

            <button
              className={
                analyticsPeriod === '30'
                  ? 'secondary-btn active-period'
                  : 'secondary-btn'
              }
              onClick={() => setAnalyticsPeriod('30')}
            >
              30 Days
            </button>

            <button
              className={
                analyticsPeriod === 'month'
                  ? 'secondary-btn active-period'
                  : 'secondary-btn'
              }
              onClick={() => setAnalyticsPeriod('month')}
            >
              This Month
            </button>
          </div>

          <button className='profile-btn' title={userEmail}>
            {userInitial}
          </button>
        </header>

        {/* Analytics Summary */}
        <section className='stats-grid'>
          <div className='stat-card'>
            <span>Total Revenue</span>
            <strong>₹{totalRevenue.toLocaleString('en-IN')}</strong>
            <small>Overall sales revenue</small>
          </div>

          <div className='stat-card'>
            <span>Total Orders</span>
            <strong>{totalOrders.toLocaleString('en-IN')}</strong>
            <small>Completed sales</small>
          </div>

          <div className='stat-card'>
            <span>Total Quantity</span>
            <strong>{totalQuantity.toLocaleString('en-IN')}</strong>
            <small>Units sold</small>
          </div>

          <div className='stat-card'>
            <span>Average Order Value</span>
            <strong>
              ₹
              {averageOrderValue.toLocaleString('en-IN', {
                maximumFractionDigits: 0
              })}
            </strong>
            <small>Revenue per order</small>
          </div>
        </section>
        {/* Daily Sales */}

        {/* Daily Sales */}

        <section className='panel'>
          <div className='panel-header'>
            <div>
              <p className='eyebrow'>DAILY PERFORMANCE</p>
              <h2>Daily Sales</h2>
            </div>
          </div>

          <div style={{ width: '100%', height: 320, padding: '20px' }}>
            {dailySales.length === 0 ? (
              <p style={{ color: '#8992a2' }}>No daily sales data available.</p>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={dailySales.map(item => ({
                    date: item.date || 'Date',
                    revenue: Number(item.total_revenue || 0),
                    orders: Number(item.total_orders || 0),
                    quantity: Number(item.total_quantity || 0)
                  }))}
                >
                  <CartesianGrid strokeDasharray='3 3' />
                  <XAxis dataKey='date' />
                  <YAxis />
                  <Tooltip
                    formatter={(value, name, props) => {
                      if (name === 'Revenue') {
                        return [
                          `₹${Number(value).toLocaleString('en-IN')}`,
                          'Revenue'
                        ]
                      }

                      if (name === 'Orders') {
                        return [value, 'Orders']
                      }

                      if (name === 'Quantity') {
                        return [value, 'Quantity']
                      }

                      return [value, name]
                    }}
                  />

                  <Legend />
                  <Bar dataKey='revenue' name='Revenue' radius={[6, 6, 0, 0]} />
                  <Bar dataKey='orders' name='Orders' radius={[6, 6, 0, 0]} />
                  <Bar
                    dataKey='quantity'
                    name='Quantity'
                    radius={[6, 6, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Monthly Revenue */}
        <section className='panel'>
          <div className='panel-header'>
            <div>
              <p className='eyebrow'>REVENUE TREND</p>
              <h2>Monthly Revenue</h2>
            </div>
          </div>
          <div style={{ width: '100%', height: 320, padding: '20px' }}>
            {monthlySales.length === 0 ? (
              <p style={{ color: '#8992a2' }}>
                No monthly sales data available.
              </p>
            ) : (
              <ResponsiveContainer width='100%' height='100%'>
                <BarChart
                  data={monthlySales.map(item => ({
                    month: item.month || item.month_name || 'Month',
                    revenue: Number(item.revenue || item.total_revenue || 0)
                  }))}
                >
                  <CartesianGrid strokeDasharray='3 3' />

                  <XAxis dataKey='month' />

                  <YAxis
                    tickFormatter={value =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />

                  <Tooltip
                    formatter={value =>
                      `₹${Number(value).toLocaleString('en-IN')}`
                    }
                  />

                  <Bar dataKey='revenue' name='Revenue' radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>

        {/* Top Products */}
        <section className='panel'>
          <div className='panel-header'>
            <div>
              <p className='eyebrow'>PRODUCT PERFORMANCE</p>
              <h2>Top Products</h2>
            </div>
          </div>

          <div className='table-wrapper'>
            {topProducts.length === 0 ? (
              <p
                style={{
                  padding: '20px',
                  color: '#8992a2'
                }}
              >
                No product performance data available.
              </p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Quantity Sold</th>
                    <th>Revenue</th>
                    <th>Performance</th>
                  </tr>
                </thead>

                <tbody>
                  {topProducts.map((product, index) => (
                    <tr key={index}>
                      <td>
                        <strong>
                          {product.name || product.product_name || 'Product'}
                        </strong>
                      </td>

                      <td>
                        {Number(
                          product.quantity_sold ||
                            product.total_quantity ||
                            product.quantity ||
                            0
                        ).toLocaleString('en-IN')}
                      </td>

                      <td>
                        ₹
                        {Number(
                          product.revenue || product.total_revenue || 0
                        ).toLocaleString('en-IN')}
                      </td>
                      <td>
                        <div
                          style={{
                            width: '120px',
                            height: '8px',
                            background: '#eef1f6',
                            borderRadius: '20px',
                            overflow: 'hidden'
                          }}
                        >
                          <div
                            style={{
                              width: `${Math.min(
                                (Number(
                                  product.revenue || product.total_revenue || 0
                                ) /
                                  Math.max(
                                    ...topProducts.map(p =>
                                      Number(p.revenue || p.total_revenue || 0)
                                    ),
                                    1
                                  )) *
                                  100,
                                100
                              )}%`,
                              height: '100%',
                              background: '#111827',
                              borderRadius: '20px'
                            }}
                          />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      </>
    )
  }
  // =========================
  // Main Application
  // =========================

  return (
    <div className='app'>
      {/* Sidebar */}

      <aside className='sidebar'>
        <div className='brand'>
          <div className='brand-icon'>IF</div>

          <div>
            <h2>Insights Flow</h2>

            <span>Sales Analytics</span>
          </div>
        </div>

        <nav>
          <a
            className={activePage === 'dashboard' ? 'active' : ''}
            onClick={() => handleNavigation('dashboard')}
          >
            Dashboard
          </a>

          <a
            className={activePage === 'sales' ? 'active' : ''}
            onClick={() => handleNavigation('sales')}
          >
            Sales
          </a>

          <a
            className={activePage === 'products' ? 'active' : ''}
            onClick={() => handleNavigation('products')}
          >
            Products
          </a>

          <a
            className={activePage === 'customers' ? 'active' : ''}
            onClick={() => handleNavigation('customers')}
          >
            Customers
          </a>

          <a
            className={activePage === 'analytics' ? 'active' : ''}
            onClick={() => handleNavigation('analytics')}
          >
            Analytics
          </a>
        </nav>

        {/* User */}

        <div className='sidebar-bottom'>
          <div className='user-box'>
            <div className='avatar'>{userInitial}</div>

            <div className='user-details'>
              <strong>{userName}</strong>

              <small>{userEmail}</small>
            </div>
          </div>

          <button className='logout-btn' onClick={handleLogout}>
            <span>↪</span>
            Logout
          </button>
        </div>
      </aside>

      {/* Main */}

      <main className='main'>
        {activePage === 'dashboard' && renderDashboard()}

        {activePage === 'sales' && renderSalesPage()}

        {activePage === 'products' && renderProductsPage()}

        {activePage === 'customers' && renderCustomersPage()}

        {activePage === 'analytics' &&
          renderPlaceholderPage(
            'Analytics',
            'BUSINESS INTELLIGENCE',
            'Explore detailed business performance analytics.'
          )}
      </main>

      {/* Responsive Form */}

      <style>
        {`
          @media (max-width: 760px) {
            .panel form {
              grid-template-columns: 1fr !important;
            }

            .panel-header {
              align-items: flex-start;
            }
          }
        `}
      </style>
    </div>
  )
}

export default App
