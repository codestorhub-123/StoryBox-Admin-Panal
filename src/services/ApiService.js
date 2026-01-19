
// Helper for authorization header
const getAuthHeaders = () => {
    const token = localStorage.getItem('token')
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` 
    }
  }

export const adminLogin = async (data) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/auth/admin/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(data)
    })
  
    const result = await res.json()
    return { ok: res.ok, result }
  }

export const getUsers = async (params) => {
    const queryString = new URLSearchParams(params).toString()
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/user/get?${queryString}`, {
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const toggleUserBlock = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/user/toggle-block?id=${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const updateUserName = async (id, name) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/user/update-name?id=${id}`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({ name })
    })
    const result = await res.json()
    return { ok: res.ok, result }
}
