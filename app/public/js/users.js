const usersModule = (() => {
    const BASE_URL = 'http://localhost:3000/api/v1/users'
    const headers = new Headers()
    headers.set('Content-Type', 'application/json')

    return {
        fetchAllUsers: async () => {
            const res = await fetch(BASE_URL)
            const users = await res.json()

            users.map(user => {
                const body = `<tr>
                                    <td>${user.id}</td>
                                    <td>${user.name}</td>
                                    <td>${user.profile}</td>
                                    <td>${user.date_of_birth}</td>
                                    <td>${user.created_at}</td>
                                    <td>${user.updated_at}</td>
                              </tr>`
                document.getElementById('users-list').insertAdjacentHTML('beforeend', body)
            })
        },
        createUser: async () => {
            const name = document.getElementById('name').value
            const profile = document.getElementById('profile').value
            const dateOfBirth = document.getElementById('date-of-birth').value
            const body = {
                name: name,
                profile: profile,
                date_of_birth: dateOfBirth
            }
            const res = await fetch(BASE_URL, {
                method: 'POST',
                headers: headers,
                body: JSON.stringify(body)
            })
            const resJson = await res.json()
            alert(resJson.message)
            window.location.href = '/'
        },
        updateUser: async (uid) => {
            const name = document.getElementById('name').value
            const profile = document.getElementById('profile').value
            const dateOfBirth = document.getElementById('date-of-birth').value
            const body = {
                name: name,
                profile: profile,
                date_of_birth: dateOfBirth
            }
            const res = await fetch(BASE_URL + '/' + uid, {
                method: 'PUT',
                headers: headers,
                body: JSON.stringify(body)
            })
            const resJson = await res.json()
            alert(resJson.message)
            window.location.href = '/'
        },
        deleteUser: async (uid) => {
            const ret = window.confirm('このユーザーを削除しますか？')
            if (!ret) return false
            const res = await fetch(BASE_URL + '/' + uid, {
                method: 'DELETE',
                headers: headers
            })
            const resJson = await res.json()
            alert(resJson.message)
            window.location.href = '/'
        }
    }
})()
