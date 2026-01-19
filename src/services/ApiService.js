
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

// Category API Services
export const getCategories = async (params) => {
    const queryString = new URLSearchParams(params).toString()
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/category/?${queryString}`, {
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const createCategory = async (formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/category/store`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const updateCategory = async (id, formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/category/update?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const deleteCategory = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/category/delete?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

// Story API Services
export const getStories = async (params) => {
    const queryString = new URLSearchParams(params).toString()
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/story/get?${queryString}`, {
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const getStoryDetail = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/story/show?id=${id}`, {
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const createStory = async (formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/story/store`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const updateStory = async (id, formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/story/update?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const deleteStory = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/story/delete?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

// Episode API Services
export const getEpisodes = async (params) => {
    const queryString = new URLSearchParams(params).toString()
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/episode/getAll?${queryString}`, {
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const createEpisode = async (formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/episode/store`, {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const updateEpisode = async (id, formData) => {
    const token = localStorage.getItem('token')
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/episode/update?id=${id}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `Bearer ${token}`
        },
        body: formData
    })
    const result = await res.json()
    return { ok: res.ok, result }
}

export const deleteEpisode = async (id) => {
    const res = await fetch(`${process.env.NEXT_PUBLIC_URL}/admin/episode/delete?id=${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders()
    })
    const result = await res.json()
    return { ok: res.ok, result }
}
