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
